import { Play, Pause, Loader2, Download, Trash2, FileText } from "lucide-react";
import { Track } from "../../types";

interface MobileTrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onTogglePlay: () => void;
  onShowLyrics: () => void;
  onDelete: () => void;
}

export function MobileTrackCard({
  track,
  isPlaying,
  isCurrentTrack,
  onTogglePlay,
  onShowLyrics,
  onDelete,
}: MobileTrackCardProps) {
  const hasAudio = !!track.audio_url;
  const isReady = track.status === "SUCCESS" || track.status === "complete";

  return (
    <div className="bg-[#111] border-b border-white/5 p-4 flex items-center gap-3">
      <button
        onClick={onTogglePlay}
        disabled={!hasAudio}
        className={`w-12 h-12 rounded-lg overflow-hidden bg-[#222] shrink-0 flex items-center justify-center border border-white/10 ${
          !hasAudio ? "opacity-50" : ""
        }`}
      >
        {!hasAudio ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#00D1FF]" />
        ) : isPlaying && isCurrentTrack ? (
          <Pause className="w-5 h-5 text-[#00D1FF]" />
        ) : (
          <Play className="w-5 h-5 text-[#00D1FF] ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-tight truncate text-white">
            {track.title || "Untitled"}
          </span>
          <span
            className={`text-[8px] px-1.5 py-0.5 rounded shrink-0 font-bold uppercase ${
              isReady
                ? "bg-[#00D1FF]/20 text-[#00D1FF]"
                : "bg-white/5 opacity-50 text-white"
            }`}
          >
            {isReady ? "OK" : "..."}
          </span>
        </div>
        <p className="text-[10px] opacity-40 italic truncate mt-0.5">
          {track.tags || "Custom"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isReady && track.lyrics && (
          <button
            onClick={onShowLyrics}
            className="p-2 rounded-lg border border-white/10"
            title="Ver Letra"
          >
            <FileText className="w-4 h-4 text-white/60" />
          </button>
        )}

        {hasAudio && (
          <button
            onClick={() => window.open(track.audio_url, "_blank")}
            className="p-2 rounded-lg border border-white/10"
            title="Play/Download"
          >
            <Download className="w-4 h-4 text-white/60" />
          </button>
        )}

        <button
          onClick={onDelete}
          className="p-2 rounded-lg border border-white/10"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}