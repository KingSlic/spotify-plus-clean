import Link from "next/link";

export default function Sidebar() {
  return (
    <nav className="space-y-6">
      <h1 className="text-xl font-bold">Spotify+</h1>

      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/" className="hover:text-white text-neutral-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="/search" className="hover:text-white text-neutral-400">
            Search
          </Link>
        </li>
        <li>
          <Link href="/library" className="hover:text-white text-neutral-400">
            Library
          </Link>
        </li>
      </ul>
    </nav>
  );
}
