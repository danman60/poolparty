"use client";

import { useWatchlist } from "./WatchlistStore";

export default function WatchlistStar({ id, name }: { id: string; name?: string }) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(id);
  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle({ id, name }); }}
      className={`text-xs ${watched ? 'text-yellow-400' : 'opacity-50 hover:opacity-90'}`}
      aria-pressed={watched}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {watched ? '★' : '☆'}
    </button>
  );
}

