import { useState } from "react";
import { Loader2, Plus, FileText, Upload, X } from "lucide-react";
import { stylePresets } from "../../constants/stylePresets";
import { VoiceSelector } from "./VoiceSelector";

type CreateMode = "music" | "lyrics" | "cover";

interface MobileCreateDrawerProps {
  isGenerating: boolean;
  generatingLyrics: boolean;
  onGenerateMusic: (data: {
    prompt: string;
    tags: string;
    makeInstrumental: boolean;
    voice: string;
  }) => void;
  onGenerateLyrics: (prompt: string) => void;
  onGenerateCover: (data: {
    url: string;
    prompt: string;
    style: string;
    title: string;
  }) => void;
}

export function MobileCreateDrawer({
  isGenerating,
  generatingLyrics,
  onGenerateMusic,
  onGenerateLyrics,
  onGenerateCover,
}: MobileCreateDrawerProps) {
  const [mode, setMode] = useState<CreateMode>("music");
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [voice, setVoice] = useState("auto");
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  
  // Cover form
  const [coverUrl, setCoverUrl] = useState("");
  const [coverPrompt, setCoverPrompt] = useState("");
  const [coverStyle, setCoverStyle] = useState("");
  const [coverTitle, setCoverTitle] = useState("");

  const [showLyricsInput, setShowLyricsInput] = useState(false);

  const handleSubmit = () => {
    if (mode === "music") {
      onGenerateMusic({ prompt, tags, makeInstrumental, voice });
    } else if (mode === "lyrics") {
      onGenerateLyrics(prompt);
    } else if (mode === "cover") {
      onGenerateCover({
        url: coverUrl,
        prompt: coverPrompt,
        style: coverStyle,
        title: coverTitle,
      });
    }
  };

  const canSubmit =
    mode === "music"
      ? !!prompt && !isGenerating
      : mode === "lyrics"
      ? !!prompt && !generatingLyrics
      : !!coverUrl && !isGenerating;

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Mode Tabs */}
      <div className="flex border-b border-white/10 bg-[#0a0a0a]">
        <button
          onClick={() => setMode("music")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            mode === "music"
              ? "text-[#00D1FF] border-b-2 border-[#00D1FF]"
              : "text-white/40"
          }`}
        >
          Música
        </button>
        <button
          onClick={() => setMode("lyrics")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            mode === "lyrics"
              ? "text-[#00D1FF] border-b-2 border-[#00D1FF]"
              : "text-white/40"
          }`}
        >
          Letras
        </button>
        <button
          onClick={() => setMode("cover")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
            mode === "cover"
              ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
              : "text-white/40"
          }`}
        >
          Cover
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mode === "music" && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva a música que você quer criar..."
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm h-24 focus:outline-none focus:border-[#00D1FF] transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Estilo
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="pop, rock, jazz..."
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-[#00D1FF] transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-2">
                {stylePresets.slice(0, 12).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setTags(preset.tags)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                      tags === preset.tags
                        ? "bg-[#00D1FF] border-transparent text-black"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <VoiceSelector value={voice} onChange={setVoice} />

            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input
                type="checkbox"
                checked={makeInstrumental}
                onChange={(e) => setMakeInstrumental(e.target.checked)}
                className="w-5 h-5 accent-[#00D1FF]"
              />
              <span className="text-xs font-bold uppercase tracking-wider">
                Instrumental
              </span>
            </label>
          </>
        )}

        {mode === "lyrics" && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Tema / Estilo
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o tema ou estilo das letras..."
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm h-32 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
              />
            </div>
          </>
        )}

        {mode === "cover" && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                URL do Áudio
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3"
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Novo Estilo
              </label>
              <input
                type="text"
                value={coverStyle}
                onChange={(e) => setCoverStyle(e.target.value)}
                placeholder="Jazz, Rock, Pop..."
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Título
              </label>
              <input
                type="text"
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                placeholder="My Remix"
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-2">
                Novas Letras (opcional)
              </label>
              <textarea
                value={coverPrompt}
                onChange={(e) => setCoverPrompt(e.target.value)}
                placeholder="[Verse] Novas letras..."
                className="w-full bg-[#111] border border-white/10 p-3 rounded-lg text-sm h-24 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-[#00D1FF] text-black h-12 rounded-lg font-black uppercase text-sm tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating || generatingLyrics ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />{" "}
              {mode === "lyrics" ? "GERANDO..." : "GERANDO..."}
            </>
          ) : mode === "lyrics" ? (
            "GERAR LETRAS"
          ) : mode === "cover" ? (
            "GERAR COVER"
          ) : (
            "GERAR MÚSICA"
          )}
        </button>
      </div>
    </div>
  );
}