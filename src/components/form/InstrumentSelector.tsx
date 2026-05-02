import { useState } from "react";
import { Piano, Guitar, Drum, Mic2, Waves } from "lucide-react";

interface InstrumentSelectorProps {
  value: string;
  onChange: (instruments: string) => void;
}

const INSTRUMENTS = [
  { 
    id: "piano", 
    label: "Piano", 
    icon: Piano,
    exclude: "drums,bass,guitar,synth,electronic beats,electric guitar,drum machine"
  },
  { 
    id: "guitar", 
    label: "Guitarra", 
    icon: Guitar,
    exclude: "piano,drums,synth,electronic beats,drum machine,bass guitar"
  },
  { 
    id: "drums", 
    label: "Bateria", 
    icon: Drum,
    exclude: "piano,guitar,synth,electronic beats,no drums,acoustic only"
  },
  { 
    id: "bass", 
    label: "Baixo", 
    icon: Waves,
    exclude: "piano,electronic synth,drum machine,no bass"
  },
  { 
    id: "synth", 
    label: "Synth/Eletrônico", 
    icon: Waves,
    exclude: "acoustic piano,acoustic guitar,real drums,no synth"
  },
  { 
    id: "vocals", 
    label: "Vocais", 
    icon: Mic2,
    exclude: "instrumental only,no vocals,no singing,instrumental"
  }
];

export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedInstruments = value ? value.split(",").filter(Boolean) : [];

  const handleToggle = (instrumentId: string) => {
    let newSelected: string[];
    
    if (selectedInstruments.includes(instrumentId)) {
      newSelected = selectedInstruments.filter(i => i !== instrumentId);
    } else {
      newSelected = [...selectedInstruments, instrumentId];
    }
    
    // Generate negative tags excluding non-selected instruments
    const selectedObjs = INSTRUMENTS.filter(i => newSelected.includes(i.id));
    const excluded = selectedObjs.map(i => i.exclude).join(", ");
    
    onChange(newSelected.join(","));
    
    // Also update negative tags in form state (via parent's negativeTags)
    const negativeInput = document.getElementById("negative") as HTMLInputElement;
    if (negativeInput && excluded) {
      negativeInput.value = excluded;
      // Dispatch event to notify parent
      negativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] uppercase tracking-widest opacity-40">
        Instrumentos Principais
      </label>
      
      <div className="flex flex-wrap gap-2">
        {INSTRUMENTS.map(inst => {
          const Icon = inst.icon;
          const isSelected = selectedInstruments.includes(inst.id);
          
          return (
            <button
              key={inst.id}
              type="button"
              onClick={() => handleToggle(inst.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                isSelected 
                  ? "bg-[#00D1FF] border-transparent text-black" 
                  : "bg-[#111] border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              <Icon className="w-3 h-3" />
              {inst.label}
            </button>
          );
        })}
      </div>
      
      {selectedInstruments.length > 0 && (
        <div className="text-[10px] opacity-40">
          Selecionados: {selectedInstruments.join(", ")}
        </div>
      )}
    </div>
  );
}