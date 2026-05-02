import { Disc3 } from "lucide-react";
import { Track } from "../../types";
import { TrackGroup } from "../../App";
import { MobileTrackCard } from "./MobileTrackCard";

interface MobileTrackListProps {
  groupedTracks: TrackGroup[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: (track: Track) => void;
  onShowLyrics: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export function MobileTrackList({
  groupedTracks,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onShowLyrics,
  onDelete,
}: MobileTrackListProps) {
  const totalTracks = groupedTracks.reduce(
    (sum, group) => sum + group.tracks.length,
    0
  );

  if (totalTracks === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-8">
        <Disc3 className="w-16 h-16 mb-4" />
        <p className="text-lg font-bold tracking-tight uppercase">
          Ready for Input
        </p>
        <p className="text-xs font-serif italic mt-2 opacity-60">
          Crie sua primeira música na aba Criar
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {groupedTracks.map((group) => (
        <div key={group.title}>
          <div className="sticky top-0 bg-[#050505]/95 backdrop-blur-sm px-4 py-2 border-b border-white/5 z-10">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
              {group.title} ({group.tracks.length})
            </span>
          </div>
          <div>
            {group.tracks.map((track, idx) => (
              <div key={track.id || `track-${idx}`}>
                <MobileTrackCard
                  track={track}
                  isPlaying={isPlaying}
                  isCurrentTrack={currentTrack?.id === track.id}
                  onTogglePlay={() => onTogglePlay(track)}
                  onShowLyrics={() => onShowLyrics(track)}
                  onDelete={() => onDelete(track.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}