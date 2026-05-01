import { stylePresets } from "../../constants/stylePresets";

interface StylePresetsProps {
  selectedTags: string;
  onSelectTags: (tags: string) => void;
}

export function StylePresets({ selectedTags, onSelectTags }: StylePresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stylePresets.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onSelectTags(preset.tags)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
            selectedTags === preset.tags 
              ? "bg-[#00D1FF] border-transparent text-black" 
              : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
          }`}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
