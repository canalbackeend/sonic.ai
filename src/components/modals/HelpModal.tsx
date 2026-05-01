import { X } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#151515] sticky top-0">
          <h3 className="font-black uppercase tracking-tight text-white">Guia de Prompts</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
            <X className="w-6 h-6 opacity-40" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-sm">
          <section>
            <h4 className="font-bold text-[#00D1FF] mb-2">Estrutura da Música</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#050505] p-2 rounded"><code>[Intro]</code> - Introdução</div>
              <div className="bg-[#050505] p-2 rounded"><code>[Verse]</code> - Verso</div>
              <div className="bg-[#050505] p-2 rounded"><code>[Chorus]</code> - Refrão</div>
              <div className="bg-[#050505] p-2 rounded"><code>[Bridge]</code> - Ponte</div>
              <div className="bg-[#050505] p-2 rounded"><code>[Outro]</code> - Encerramento</div>
              <div className="bg-[#050505] p-2 rounded"><code>[Instrumental Break]</code></div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-[#00D1FF] mb-2">Solos</h4>
            <div className="text-xs opacity-70">Use: <code>[Guitar Solo]</code>, <code>[Piano Solo]</code>, na letra</div>
          </section>

          <section>
            <h4 className="font-bold text-[#00D1FF] mb-2">Style Influence</h4>
            <div className="text-xs space-y-1 opacity-70">
              <p>• <b>0 (mínimo)</b> = Segue exatamente o que você pediu</p>
              <p>• <b>0.5 (metade)</b> = Meio termo</p>
              <p>• <b>1 (máximo)</b> = Cria o que quiser, ignora seu pedido</p>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-[#00D1FF] mb-2">Neural Weirdness</h4>
            <div className="text-xs space-y-1 opacity-70">
              <p>• <b>0</b> = Música normal, genérica</p>
              <p>• <b>0.5</b> = Um pouco diferente</p>
              <p>• <b>1</b> = Muito criativo, pode ficar estranho</p>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-[#00D1FF] mb-2">Audio Fidelity</h4>
            <div className="text-xs space-y-1 opacity-70">
              <p>• <b>0</b> = Prioriza estilo único</p>
              <p>• <b>0.5</b> = Equilibrado</p>
              <p>• <b>1</b> = Prioriza qualidade de áudio</p>
            </div>
          </section>

          <section className="pt-4 border-t border-white/5">
            <h4 className="font-bold text-red-400 mb-2">Direitos Autorais</h4>
            <p className="text-xs opacity-70">API pode bloquear bandas conhecidas. Evite mencionar artistas.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
