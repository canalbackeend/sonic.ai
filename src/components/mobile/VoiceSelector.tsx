interface VoiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const voiceOptions = [
  { value: "m", label: "M" },
  { value: "f", label: "F" },
  { value: "duet", label: "DUETO" },
  { value: "auto", label: "AUTO" },
];

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-[10px] uppercase tracking-widest opacity-40 mb-3">
        Escolha de Voz
      </label>
      <div className="flex gap-2">
        {voiceOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              value === opt.value
                ? "bg-[#00D1FF] border-transparent text-black"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}