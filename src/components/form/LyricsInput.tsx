import { Toggle } from "../ui/Toggle";

interface LyricsInputProps {
  useLyrics: boolean;
  lyrics: string;
  onToggle: (value: boolean) => void;
  onLyricsChange: (value: string) => void;
}

export function LyricsInput({ useLyrics, lyrics, onToggle, onLyricsChange }: LyricsInputProps) {
  return (
    <section className="bg-[#111] p-4 rounded-xl border border-white/5">
      <div className="mb-4">
        <Toggle 
          label="Use Custom Lyrics"
          checked={useLyrics}
          onChange={onToggle}
        />
      </div>

      {useLyrics ? (
        <textarea
          value={lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="Paste your lyrics here..."
          className="w-full bg-[#050505] border border-white/10 p-4 rounded-lg text-sm h-32 focus:outline-none focus:border-[#00D1FF] transition-colors resize-none"
        />
      ) : (
        <div className="text-[10px] opacity-30 italic leading-relaxed">
          The API will generate optimized high-fidelity lyrics based on your instructions automatically.
        </div>
      )}
    </section>
  );
}
