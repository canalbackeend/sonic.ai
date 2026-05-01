import { Upload, X, Loader2 } from "lucide-react";

interface UploadCoverProps {
  isOpen: boolean;
  onClose: () => void;
  uploadUrl: string;
  setUploadUrl: (url: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  style: string;
  setStyle: (style: string) => void;
  title: string;
  setTitle: (title: string) => void;
  isUploading: boolean;
  onSubmit: () => void;
}

export function UploadCover({
  isOpen,
  onClose,
  uploadUrl,
  setUploadUrl,
  prompt,
  setPrompt,
  style,
  setStyle,
  title,
  setTitle,
  isUploading,
  onSubmit,
}: UploadCoverProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#151515]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight text-white">Cover / Remix</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Manter melodia, novas letras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-6 h-6 opacity-40 hover:opacity-100" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
              URL do Áudio (mp3, wav)
            </label>
            <input
              type="url"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="https://exemplo.com/audio.mp3"
              className="w-full bg-[#050505] border border-white/10 p-4 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
            <p className="text-[10px] opacity-30 mt-1">Máx: 8 min (V4/V5) ou 1 min (V4_5ALL)</p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
              Título da Música
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Remix"
              className="w-full bg-[#050505] border border-white/10 p-4 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
              Estilo / Gênero
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Jazz, Rock, Pop, Classical..."
              className="w-full bg-[#050505] border border-white/10 p-4 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
              Novas Letras (opcional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="[Verse]&#10;Sua nova letra aqui...&#10;&#10;[Chorus]&#10;Refrão..."
              className="w-full bg-[#050505] border border-white/10 p-4 rounded-lg text-sm h-32 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
            />
            <p className="text-[10px] opacity-30 mt-1">Deixe vazio para gerar letras automaticamente</p>
          </div>

          <button
            onClick={onSubmit}
            disabled={isUploading || !uploadUrl}
            className="w-full bg-[#FF6B35] text-black h-14 rounded-lg font-black uppercase text-sm tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> GERANDO...
              </>
            ) : (
              <>GERAR COVER / REMIX</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
