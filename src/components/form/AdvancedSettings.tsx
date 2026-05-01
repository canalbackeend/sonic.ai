import { Settings2 } from "lucide-react";
import { AIModel, VocalGender } from "../../types";

interface AdvancedSettingsProps {
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  makeInstrumental: boolean;
  selectedModel: AIModel;
  vocalGender: VocalGender;
  styleWeight: number;
  audioWeight: number;
  weirdnessConstraint: number;
  negativeTags: string;
  onModelChange: (model: AIModel) => void;
  onVocalGenderChange: (gender: VocalGender) => void;
  onStyleWeightChange: (value: number) => void;
  onAudioWeightChange: (value: number) => void;
  onWeirdnessChange: (value: number) => void;
  onNegativeTagsChange: (value: string) => void;
}

export function AdvancedSettings({
  showAdvanced,
  onToggleAdvanced,
  makeInstrumental,
  selectedModel,
  vocalGender,
  styleWeight,
  audioWeight,
  weirdnessConstraint,
  negativeTags,
  onModelChange,
  onVocalGenderChange,
  onStyleWeightChange,
  onAudioWeightChange,
  onWeirdnessChange,
  onNegativeTagsChange,
}: AdvancedSettingsProps) {
  return (
    <section className="pt-4 border-t border-white/5">
      <button 
        type="button"
        onClick={onToggleAdvanced}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity mb-4"
      >
        <Settings2 className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        {showAdvanced ? 'Hide Advanced Mode' : 'Show Advanced Mode'}
      </button>

      {showAdvanced && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-widest opacity-40">AI Engine Model</label>
            <div className="grid grid-cols-3 gap-2">
              {(["V4_5ALL", "V4", "V3_5"] as AIModel[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModelChange(m)}
                  className={`p-2 rounded border text-[10px] font-bold transition-all ${selectedModel === m ? "bg-[#00D1FF] border-transparent text-black" : "bg-[#111] border-white/10 text-white/50 hover:border-white/30"}`}
                >
                  {m.replace("_", ".")}
                </button>
              ))}
            </div>
          </div>

          {!makeInstrumental && (
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest opacity-40">Vocal Tone</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "m" as VocalGender, label: "MALE" },
                  { id: "f" as VocalGender, label: "FEMALE" },
                  { id: "d" as VocalGender, label: "DUET" },
                  { id: "" as VocalGender, label: "AUTO" }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onVocalGenderChange(g.id)}
                    className={`p-2 rounded border text-[10px] font-bold transition-all ${vocalGender === g.id ? "bg-[#00D1FF] border-transparent text-black" : "bg-[#111] border-white/10 text-white/50 hover:border-white/30"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: "Style Influence", value: styleWeight, setter: onStyleWeightChange, min: 0, max: 1 },
              { label: "Audio Fidelity", value: audioWeight, setter: onAudioWeightChange, min: 0, max: 1 },
              { label: "Neural Weirdness", value: weirdnessConstraint, setter: onWeirdnessChange, min: 0.1, max: 1 }
            ].map(slider => (
              <div key={slider.label} className="space-y-2">
                <div className="flex justify-between text-[8px] uppercase tracking-widest opacity-40">
                  <span>{slider.label}</span>
                  <span>{slider.value.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min={slider.min} 
                  max={slider.max} 
                  step="0.05" 
                  value={slider.value}
                  onChange={(e) => slider.setter(parseFloat(e.target.value))}
                  className="w-full accent-[#00D1FF] h-1 bg-[#222] rounded-full"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <label htmlFor="negative" className="block text-[10px] uppercase tracking-widest opacity-40">Negative Tags (Exclude)</label>
            <input
              id="negative"
              type="text"
              value={negativeTags}
              onChange={(e) => onNegativeTagsChange(e.target.value)}
              placeholder="Heavy Metal, Upbeat Drums..."
              className="w-full bg-[#111] border border-white/10 p-4 rounded-lg text-sm focus:outline-none focus:border-[#00D1FF] transition-colors"
            />
          </div>
        </div>
      )}
    </section>
  );
}
