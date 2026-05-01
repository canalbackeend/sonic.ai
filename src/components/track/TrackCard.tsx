import { Play, Pause, Music, Download, Loader2, Settings2, Trash2, Video, FileText, Layers } from "lucide-react";
import { Track } from "../../types";

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  videoGenerating: boolean;
  onTogglePlay: () => void;
  onShowLyrics: () => void;
  onGenerateVideo: () => void;
  onReuse: () => void;
  onMashup: () => void;
  onDelete: () => void;
}

export function TrackCard({
  track,
  isPlaying,
  isCurrentTrack,
  videoGenerating,
  onTogglePlay,
  onShowLyrics,
  onGenerateVideo,
  onReuse,
  onMashup,
  onDelete,
}: TrackCardProps) {
  const hasAudio = !!track.audio_url;
  const isReady = track.status === 'SUCCESS' || track.status === 'complete';

  return (
    <div className="group bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-[#151515] hover:border-[#00D1FF]/30 transition-all">
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-[#222]">
        {track.image_url ? (
          <img src={track.image_url} alt={track.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
        ) : (
          <Music className="w-6 h-6 text-[#00D1FF]" />
        )}
        <button 
          onClick={onTogglePlay}
          className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${!hasAudio ? 'cursor-not-allowed' : ''}`}
        >
          <div className="bg-[#00D1FF] text-black w-8 h-8 rounded-full flex items-center justify-center">
            {!hasAudio ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : isPlaying && isCurrentTrack ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-black text-black" />
            )}
          </div>
        </button>
      </div>
      
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <div className="flex justify-between items-start">
          <div className="flex flex-col min-w-0">
            <h3 className="text-xl font-bold tracking-tight uppercase truncate pr-4 text-white">{track.title || "Untitled Track"}</h3>
            {!isReady && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  <span className="w-1 h-3 bg-[#00D1FF] animate-[pulse_1s_infinite_0ms]"></span>
                  <span className="w-1 h-3 bg-[#00D1FF] animate-[pulse_1s_infinite_200ms]"></span>
                  <span className="w-1 h-3 bg-[#00D1FF] animate-[pulse_1s_infinite_400ms]"></span>
                </div>
                <span className="text-[8px] uppercase tracking-widest text-[#00D1FF] font-black animate-pulse">Neural Synthesizing...</span>
              </div>
            )}
          </div>
          <span className={`text-[10px] px-2 py-1 rounded shrink-0 font-bold uppercase ${isReady ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-white/5 opacity-50 text-white'}`}>
            {isReady ? 'READY' : 'PROCESSING'}
          </span>
        </div>
        <p className="text-xs opacity-40 italic mt-1 font-serif truncate">{track.tags || "Custom Preset"}</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isReady && (
            <button 
              onClick={onShowLyrics}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20 hover:bg-[#00D1FF] hover:text-black hover:border-transparent transition-all"
            >
              <FileText className="w-3 h-3" /> Ver Letra & Prompt
            </button>
          )}
          
          {isReady && (
            track.video_url ? (
              <a 
                href={track.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-transparent transition-all"
              >
                <Video className="w-3 h-3" /> Ver Vídeo
              </a>
            ) : (
              <button 
                onClick={onGenerateVideo}
                disabled={videoGenerating}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {videoGenerating ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Gerando Vídeo...</>
                ) : (
                  <><Video className="w-3 h-3" /> Gerar Vídeo</>
                )}
              </button>
            )
          )}

          <button 
            onClick={onReuse}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-white/5 text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all"
          >
            <Settings2 className="w-3 h-3" /> Reutilizar
          </button>
          {hasAudio && (
            <button 
              onClick={onMashup}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 hover:bg-[#FF6B35] hover:text-black hover:border-transparent transition-all"
            >
              <Layers className="w-3 h-3" /> Mashup
            </button>
          )}
          <button 
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
          >
            <Trash2 className="w-3 h-3" /> Excluir
          </button>
          <div className="flex items-end gap-[1px] h-4 opacity-10">
            <div className="w-1 bg-white h-2"></div><div className="w-1 bg-white h-4"></div><div className="w-1 bg-white h-3"></div><div className="w-1 bg-white h-[10px]"></div><div className="w-1 bg-white h-2"></div><div className="w-1 bg-white h-4"></div><div className="w-1 bg-white h-3"></div><div className="w-1 bg-white h-[10px]"></div><div className="w-1 bg-white h-2"></div><div className="w-1 bg-white h-4"></div><div className="w-1 bg-white h-3"></div><div className="w-1 bg-white h-[10px]"></div><div className="w-1 bg-white h-2"></div><div className="w-1 bg-white h-4"></div>
          </div>
        </div>
      </div>
      
      <div className="flex sm:block w-full sm:w-auto justify-end mt-4 sm:mt-0 gap-2">
        <button 
          onClick={onTogglePlay}
          className={`sm:hidden p-4 rounded-full border border-white/10 transition-all ${!hasAudio ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00D1FF] hover:text-black hover:border-transparent'}`}
        >
          {!hasAudio ? <Loader2 className="w-5 h-5 animate-spin"/> : isPlaying && isCurrentTrack ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <a 
          href={track.audio_url || '#'} 
          download={`${track.title}.mp3`}
          target={track.audio_url ? '_blank' : '_self'}
          rel="noreferrer"
          className={`p-4 rounded-full border border-white/10 inline-flex text-white transition-all ${!hasAudio ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-[#00D1FF] hover:text-black hover:border-transparent'}`}
          title="Download MP3"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
