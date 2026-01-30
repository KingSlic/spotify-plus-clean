const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://127.0.0.1:5000/api";

function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}

export async function searchAll(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Search failed:", res.status, text);
    throw new Error("Search failed");
  }

  return res.json();
}
