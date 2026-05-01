interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-colors">
        {label}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-5 rounded-full relative border border-white/10 transition-colors ${checked ? "bg-[#00D1FF]/20 border-[#00D1FF]/50" : "bg-[#222]"}`}>
          <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform ${checked ? "translate-x-5 bg-[#00D1FF]" : "translate-x-0 bg-white/50"}`}></div>
        </div>
      </div>
    </label>
  );
}
