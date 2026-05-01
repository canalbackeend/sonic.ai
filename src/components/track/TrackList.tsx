import React, { useState } from "react";
import { Disc3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Track } from "../../types";
import { TrackCard } from "./TrackCard";
import { TrackGroup } from "../../App";

interface TrackListProps {
  groupedTracks: TrackGroup[];
  currentTrack: Track | null;
  isPlaying: boolean;
  videoGeneratingIds: Set<string>;
  onTogglePlay: (track: Track) => void;
  onShowLyrics: (track: Track) => void;
  onGenerateVideo: (track: Track) => void;
  onReuse: (track: Track) => void;
  onMashup: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export function TrackList({
  groupedTracks,
  currentTrack,
  isPlaying,
  videoGeneratingIds,
  onTogglePlay,
  onShowLyrics,
  onGenerateVideo,
  onReuse,
  onMashup,
  onDelete,
}: TrackListProps) {
  const [activePage, setActivePage] = useState(0);
  const totalTracks = groupedTracks.reduce((sum, group) => sum + group.tracks.length, 0);
  
  if (totalTracks === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 mt-12 z-10">
        <Disc3 className="w-24 h-24 mb-6" />
        <p className="text-xl font-bold tracking-tight uppercase">Ready for Input</p>
        <p className="text-xs font-serif italic mt-2 max-w-sm">Awaiting neural instructions to generate high-fidelity audio output.</p>
      </div>
    );
  }

  if (groupedTracks.length === 0) return null;

  const currentGroup = groupedTracks[activePage];
  const hasNextPage = activePage < groupedTracks.length - 1;
  const hasPrevPage = activePage > 0;

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActivePage(p => Math.max(0, p - 1))}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          {groupedTracks.map((group, idx) => (
            <button
              key={group.title}
              onClick={() => setActivePage(idx)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                idx === activePage
                  ? "bg-[#00D1FF] text-black"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              }`}
            >
              {group.title} ({group.tracks.length})
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setActivePage(p => Math.min(groupedTracks.length - 1, p + 1))}
          disabled={!hasNextPage}
          className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Current Page Content */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-3 border-b border-white/10">
          <Calendar className="w-4 h-4 opacity-40" />
          <h3 className="text-xs font-black uppercase tracking-widest opacity-50">{currentGroup.title}</h3>
          <span className="text-[10px] font-bold opacity-30">({currentGroup.tracks.length} músicas)</span>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {currentGroup.tracks.map((track, idx) => (
            <div key={track.id || `track-${idx}`} className="border-b border-white/5 last:border-b-0">
              <TrackCard
                track={track}
                isPlaying={isPlaying}
                isCurrentTrack={currentTrack?.id === track.id}
                videoGenerating={videoGeneratingIds.has(track.id)}
                onTogglePlay={() => onTogglePlay(track)}
                onShowLyrics={() => onShowLyrics(track)}
                onGenerateVideo={() => onGenerateVideo(track)}
                onReuse={() => onReuse(track)}
                onMashup={() => onMashup(track)}
                onDelete={() => onDelete(track.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Page Indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {groupedTracks.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === activePage ? "bg-[#00D1FF]" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}