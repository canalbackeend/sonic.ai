import { Play, Pause, Music, Volume2 } from "lucide-react";
import { Track } from "../../types";

interface NowPlayingBarProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  formatTime: (time: number) => string;
}

export function NowPlayingBar({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  formatTime,
}: NowPlayingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl p-4 transform transition-transform z-50">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Progress Bar Row */}
        <div className="flex items-center gap-3 w-full group">
          <span className="text-[10px] font-mono opacity-40 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 accent-[#00D1FF] h-1 bg-white/10 rounded-full cursor-pointer hover:h-1.5 transition-all"
          />
          <span className="text-[10px] font-mono opacity-40 w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#222] shrink-0 border border-white/10">
              {track.image_url ? (
                <img src={track.image_url} alt={track.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-4 h-4 text-[#00D1FF]" />
                </div>
              )}
            </div>
            <div className="truncate">
              <div className="font-bold text-white uppercase tracking-tight truncate flex items-center gap-2">
                {track.title}
                <span className="px-1.5 py-0.5 rounded bg-[#00D1FF]/20 text-[#00D1FF] text-[8px] tracking-widest hidden sm:inline-block">LIVE</span>
              </div>
              <div className="text-[10px] text-white/40 flex items-center gap-1 mt-1 font-serif italic">
                <Volume2 className="w-3 h-3 text-[#00D1FF]" /> ACTIVE STREAM
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-[2px] h-6 opacity-40">
              <div className="w-1 bg-[#00D1FF] h-3"></div><div className={`w-1 bg-[#00D1FF] h-5 ${isPlaying ? 'animate-pulse' : ''}`}></div><div className="w-1 bg-[#00D1FF] h-2"></div><div className={`w-1 bg-[#00D1FF] h-6 ${isPlaying ? 'animate-pulse' : ''}`}></div><div className="w-1 bg-[#00D1FF] h-4"></div>
            </div>
            <button 
              onClick={onTogglePlay}
              className="w-12 h-12 flex items-center justify-center bg-[#00D1FF] text-black rounded-full hover:brightness-110 active:scale-95 transition-all shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 ml-1 fill-black text-black" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
