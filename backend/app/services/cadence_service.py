# backend/app/services/cadence_service.py

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from app.models import PlaylistTrack, Track


# ----------------------------
# Config
# ----------------------------


@dataclass
class CadenceWeights:
    # Transition smoothness weights
    w_energy: float = 1.2
    w_tempo: float = 0.9
    w_valence: float = 0.8
    w_loudness: float = 0.5

    # Variety / structure
    w_artist_streak_penalty: float = 0.7
    w_feature_cluster_penalty: float = 0.35  # acousticness clustering, etc.

    # Arc / global shape (light-touch uses softly)
    w_arc: float = 0.4

    # Moderate stochasticity
    top_k: int = 5
    temperature: float = 0.7  # lower => more deterministic, higher => more random

    # Light-touch constraints
    max_moves: int = 3
    max_displacement: int = 6  # moving a track more than this feels like takeover
    weak_edge_count: int = 4  # number of weakest edges we try to repair


# ----------------------------
# Helpers
# ----------------------------


def _safe_float(x: Optional[float], default: float = 0.5) -> float:
    try:
        return float(x) if x is not None else default
    except Exception:
        return default


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def _softmax_sample(items: List[Tuple[float, dict]], temperature: float) -> dict:
    """
    items: list of (score, payload). Higher score = better.
    temperature: ~0.3 = near deterministic, ~1.0 = more variety.
    """
    if not items:
        raise ValueError("No items to sample from")

    # Stabilize
    scores = [s for s, _ in items]
    max_s = max(scores)
    # Convert to exp weights
    weights = []
    for s in scores:
        # Temperature scales sharpness
        z = (s - max_s) / max(1e-9, temperature)
        weights.append(math.exp(z))

    total = sum(weights)
    if total <= 0:
        # fallback: deterministic
        return max(items, key=lambda x: x[0])[1]

    r = random.random() * total
    acc = 0.0
    for w, (_, payload) in zip(weights, items):
        acc += w
        if acc >= r:
            return payload

    return items[-1][1]


def _avg_feature(tracks: List[Track], attr: str, default: float) -> float:
    vals = []
    for t in tracks:
        vals.append(_safe_float(getattr(t, attr, None), default))
    return sum(vals) / max(1, len(vals))


# ----------------------------
# Transition + playlist scoring
# ----------------------------


def transition_penalty(a: Track, b: Track, w: CadenceWeights) -> Dict[str, float]:
    """
    Returns component penalties for explainability.
    Lower is better.
    """
    a_energy = _safe_float(a.energy, 0.5)
    b_energy = _safe_float(b.energy, 0.5)

    a_tempo = _safe_float(a.tempo, 120.0)
    b_tempo = _safe_float(b.tempo, 120.0)

    a_val = _safe_float(a.valence, 0.5)
    b_val = _safe_float(b.valence, 0.5)

    a_loud = _safe_float(a.loudness, -9.0)
    b_loud = _safe_float(b.loudness, -9.0)

    # Normalize rough scales:
    # - energy/valence already ~0..1
    # - tempo typically ~60..200; normalize by 200
    # - loudness roughly -20..0; normalize by 20
    p_energy = abs(a_energy - b_energy)
    p_tempo = abs(a_tempo - b_tempo) / 200.0
    p_valence = abs(a_val - b_val)
    p_loud = abs(a_loud - b_loud) / 20.0

    return {
        "energy": p_energy,
        "tempo": p_tempo,
        "valence": p_valence,
        "loudness": p_loud,
        "weighted_total": (
            w.w_energy * p_energy
            + w.w_tempo * p_tempo
            + w.w_valence * p_valence
            + w.w_loudness * p_loud
        ),
    }


def transition_score(
    a: Track, b: Track, w: CadenceWeights
) -> Tuple[float, Dict[str, float]]:
    """
    Score in [0,1]. Higher is better.
    """
    pen = transition_penalty(a, b, w)
    # Convert penalty to score using an exponential falloff for smoothness
    # Smaller penalty => closer to 1
    score = math.exp(-pen["weighted_total"])
    return _clamp01(score), pen


def artist_streak_penalty(tracks: List[Track], w: CadenceWeights) -> float:
    """
    Penalize streaks > 2 from the same primary artist (first artist in list).
    """
    penalty = 0.0
    streak_artist = None
    streak_len = 0

    def primary_artist_id(t: Track) -> Optional[str]:
        if not getattr(t, "artists", None):
            return None
        return t.artists[0].id if t.artists else None

    for t in tracks:
        a_id = primary_artist_id(t)
        if a_id and a_id == streak_artist:
            streak_len += 1
        else:
            streak_artist = a_id
            streak_len = 1

        if streak_len > 2:
            penalty += (streak_len - 2) * w.w_artist_streak_penalty

    return penalty


def feature_cluster_penalty(tracks: List[Track], w: CadenceWeights) -> float:
    """
    Light penalty if acousticness clusters too tightly (playlist feels one-note).
    Uses windowed variance heuristic.
    """
    if len(tracks) < 6:
        return 0.0

    # Use acousticness as a proxy for "texture range" in v1
    vals = [_safe_float(t.acousticness, 0.4) for t in tracks]

    # Windowed variance across small windows
    total = 0.0
    windows = 0
    win = 5
    for i in range(0, len(vals) - win + 1):
        window = vals[i : i + win]
        mu = sum(window) / win
        var = sum((x - mu) ** 2 for x in window) / win
        # If variance is tiny, it’s too samey
        total += max(0.0, 0.008 - var)  # tweakable
        windows += 1

    return w.w_feature_cluster_penalty * (total / max(1, windows))


def arc_penalty(tracks: List[Track], w: CadenceWeights) -> float:
    """
    Soft arc model: penalize violent oscillation in energy between consecutive steps.
    (We keep this gentle for v1; stronger arc modeling can come later.)
    """
    if len(tracks) < 3:
        return 0.0

    energies = [_safe_float(t.energy, 0.5) for t in tracks]
    diffs = [abs(energies[i + 1] - energies[i]) for i in range(len(energies) - 1)]
    # Penalize if the playlist is too jagged on average
    jagged = sum(diffs) / max(1, len(diffs))
    # Target "smooth" average step maybe ~0.18; penalize excess
    return w.w_arc * max(0.0, jagged - 0.18)


def playlist_flow_score(tracks: List[Track], w: CadenceWeights) -> Dict[str, float]:
    """
    Returns score components and overall score in [0,1] (overall is clamped).
    """
    if len(tracks) < 2:
        return {
            "overall": 1.0,
            "transition_avg": 1.0,
            "variety_pen": 0.0,
            "arc_pen": 0.0,
        }

    trans_scores = []
    for i in range(len(tracks) - 1):
        s, _ = transition_score(tracks[i], tracks[i + 1], w)
        trans_scores.append(s)

    transition_avg = sum(trans_scores) / max(1, len(trans_scores))

    variety_pen = artist_streak_penalty(tracks, w) + feature_cluster_penalty(tracks, w)
    arc_pen = arc_penalty(tracks, w)

    # Combine: base from transitions, subtract normalized penalties
    # Normalize penalties by length to keep scale sane
    length = max(1, len(tracks))
    overall = transition_avg - (variety_pen / (10.0 * length)) - (arc_pen / 2.0)

    return {
        "transition_avg": _clamp01(transition_avg),
        "variety_pen": float(variety_pen),
        "arc_pen": float(arc_pen),
        "overall": _clamp01(overall),
    }


def find_weak_edges(tracks: List[Track], w: CadenceWeights, n: int) -> List[Dict]:
    edges = []
    for i in range(len(tracks) - 1):
        s, pen = transition_score(tracks[i], tracks[i + 1], w)
        edges.append(
            {
                "index": i,
                "from_track_id": tracks[i].id,
                "to_track_id": tracks[i + 1].id,
                "score": s,
                "penalty": pen,
            }
        )
    edges.sort(key=lambda e: e["score"])  # weakest first
    return edges[: max(0, min(n, len(edges)))]


# ----------------------------
# Light-touch optimization
# ----------------------------


def _apply_move(order: List[Track], src: int, dst: int) -> List[Track]:
    new_order = order[:]
    t = new_order.pop(src)
    new_order.insert(dst, t)
    return new_order


def _candidate_moves_from_weak_edges(
    tracks: List[Track], weak_edges: List[Dict], w: CadenceWeights
) -> List[dict]:
    """
    Build local swap/move candidates around weak edges.
    """
    n = len(tracks)
    candidates = []

    for e in weak_edges:
        i = e["index"]
        # Consider a small neighborhood around i
        window_indices = list(set([i - 2, i - 1, i, i + 1, i + 2]))
        window_indices = [x for x in window_indices if 0 <= x < n]

        # Adjacent swaps in neighborhood
        for j in window_indices:
            if j + 1 < n:
                candidates.append({"type": "swap", "i": j, "j": j + 1})

        # Single track move within displacement cap
        for src in window_indices:
            for delta in [-w.max_displacement, -3, -2, -1, 1, 2, 3, w.max_displacement]:
                dst = src + delta
                if 0 <= dst < n and src != dst:
                    if abs(dst - src) <= w.max_displacement:
                        candidates.append({"type": "move", "src": src, "dst": dst})

    # De-dup
    seen = set()
    uniq = []
    for c in candidates:
        key = tuple(sorted(c.items()))
        if key not in seen:
            seen.add(key)
            uniq.append(c)

    return uniq


def light_touch_reorder(
    playlist_id: str,
    *,
    seed: Optional[int] = None,
    weights: Optional[CadenceWeights] = None,
) -> Dict:
    """
    Dry-run reorder proposal. Returns scores, proposed order, and explanations.
    """
    if seed is not None:
        random.seed(seed)

    w = weights or CadenceWeights()

    pts = (
        PlaylistTrack.query.filter_by(playlist_id=playlist_id)
        .order_by(PlaylistTrack.position.asc())
        .all()
    )
    tracks = [pt.track for pt in pts]

    before = playlist_flow_score(tracks, w)
    weak = find_weak_edges(tracks, w, w.weak_edge_count)

    # Generate candidate changes, score them, pick up to max_moves improvements
    current = tracks[:]
    changes = []
    move_count = 0

    while move_count < w.max_moves:
        weak_now = find_weak_edges(current, w, w.weak_edge_count)
        candidates = _candidate_moves_from_weak_edges(current, weak_now, w)

        scored_candidates: List[Tuple[float, dict]] = []

        for c in candidates:
            if c["type"] == "swap":
                i, j = c["i"], c["j"]
                new_order = current[:]
                new_order[i], new_order[j] = new_order[j], new_order[i]
                after = playlist_flow_score(new_order, w)
                delta = after["overall"] - playlist_flow_score(current, w)["overall"]
                if delta > 0.001:
                    scored_candidates.append(
                        (
                            after["overall"],
                            {**c, "new_order": new_order, "after": after},
                        )
                    )
            else:
                src, dst = c["src"], c["dst"]
                if abs(dst - src) > w.max_displacement:
                    continue
                new_order = _apply_move(current, src, dst)
                after = playlist_flow_score(new_order, w)
                delta = after["overall"] - playlist_flow_score(current, w)["overall"]
                if delta > 0.001:
                    scored_candidates.append(
                        (
                            after["overall"],
                            {**c, "new_order": new_order, "after": after},
                        )
                    )

        if not scored_candidates:
            break

        # Take top_k and sample (moderate stochasticity)
        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        top = scored_candidates[: max(1, min(w.top_k, len(scored_candidates)))]

        chosen = _softmax_sample(top, w.temperature)
        new_order = chosen.pop("new_order")
        after = chosen.pop("after")

        # Explain by showing how the weakest edge improved (best-effort)
        weak_before = find_weak_edges(current, w, 1)
        weak_after = find_weak_edges(new_order, w, 1)

        explanation = {
            "type": chosen["type"],
            "details": chosen,
            "before_overall": playlist_flow_score(current, w)["overall"],
            "after_overall": after["overall"],
            "weakest_edge_before": weak_before[0] if weak_before else None,
            "weakest_edge_after": weak_after[0] if weak_after else None,
        }

        changes.append(explanation)
        current = new_order
        move_count += 1

    after = playlist_flow_score(current, w)

    return {
        "playlist_id": playlist_id,
        "mode": "light",
        "seed": seed,
        "weights": {
            "top_k": w.top_k,
            "temperature": w.temperature,
            "max_moves": w.max_moves,
            "max_displacement": w.max_displacement,
            "weak_edge_count": w.weak_edge_count,
        },
        "before": before,
        "after": after,
        "weak_edges_before": weak,
        "changes": changes,
        "proposed_order": [t.to_dict() for t in current],
    }
