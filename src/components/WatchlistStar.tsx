"use client";

import { useWatchlist } from "./WatchlistStore";
import { useToast } from "./ToastProvider";

export default function WatchlistStar({ id, name }: { id: string; name?: string }) {
  const { isWatched, toggle } = useWatchlist();
  const { addToast } = useToast();
  const watched = isWatched(id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWatched = watched;
    toggle({ id, name });

    if (wasWatched) {
      addToast(`Removed ${name || 'pool'} from watchlist`, 'info');
    } else {
      addToast(`Added ${name || 'pool'} to watchlist`, 'success');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`text-xs transition-all duration-200 ${
        watched
          ? 'text-yellow-400 hover:scale-110 hover:rotate-12'
          : 'opacity-50 hover:opacity-90 hover:scale-110 hover:text-yellow-300'
      }`}
      aria-pressed={watched}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {watched ? '★' : '☆'}
    </button>
  );
}

