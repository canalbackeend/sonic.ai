import { FileText, X, Copy, Check, Sparkles } from "lucide-react";
import { Track } from "../../types";

interface LyricsModalProps {
  track: Track;
  onClose: () => void;
  onCopy: (text: string) => void;
  copied: boolean;
}

export function LyricsModal({ track, onClose, onCopy, copied }: LyricsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-[#151515]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight text-white">{track.title}</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{track.tags}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-6 h-6 opacity-40 hover:opacity-100" />
          </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto font-serif italic text-lg leading-relaxed text-white/80 style-lyrics">
          {track.lyrics ? (
            track.lyrics.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))
          ) : (
            <div className="text-center py-12 opacity-40">
              <Sparkles className="w-8 h-8 mx-auto mb-4 animate-pulse" />
              <p className="text-sm font-sans uppercase tracking-[0.2em]">Letra não disponível ou em processamento.</p>
            </div>
          )}
          
          <div className="mt-12 pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 font-sans italic">Prompt de Geração</h4>
            <div className="bg-[#050505] p-6 rounded-xl border border-white/5 font-mono text-[11px] leading-loose opacity-70">
              {track.prompt || "Informação não disponível."}
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => onCopy(track.prompt || "")}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              >
                <Copy className="w-3 h-3" /> Copiar Prompt
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#151515] border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Neural Lyric Synthesis (Stable V4.5)</p>
          <button 
            onClick={() => onCopy(track.lyrics || "")}
            className={`w-full sm:w-auto px-8 h-12 rounded-full font-black uppercase tracking-tighter text-xs flex items-center justify-center gap-2 transition-all ${copied ? "bg-green-500 text-white" : "bg-[#00D1FF] text-black hover:brightness-110 active:scale-95"}`}
          >
            {copied ? <><Check className="w-4 h-4" /> COPIADO</> : <><Copy className="w-4 h-4" /> COPIAR LETRA</>}
          </button>
        </div>
      </div>
    </div>
  );
}
