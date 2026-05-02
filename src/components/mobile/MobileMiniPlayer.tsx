import { Play, Pause, Music, Volume2 } from "lucide-react";
import { Track } from "../../types";

interface MobileMiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  formatTime: (time: number) => string;
}

export function MobileMiniPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  formatTime,
}: MobileMiniPlayerProps) {
  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 py-3 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#222] shrink-0 border border-white/10">
          {track.image_url ? (
            <img
              src={track.image_url}
              alt={track.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-4 h-4 text-[#00D1FF]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-tight truncate text-white">
              {track.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Volume2 className="w-3 h-3 text-[#00D1FF]" />
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00D1FF] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[8px] font-mono opacity-40">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        <button
          onClick={onTogglePlay}
          className="w-10 h-10 flex items-center justify-center bg-[#00D1FF] text-black rounded-full hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black text-black" />
          ) : (
            <Play className="w-4 h-4 ml-0.5 fill-black text-black" />
          )}
        </button>
      </div>
    </div>
  );
}