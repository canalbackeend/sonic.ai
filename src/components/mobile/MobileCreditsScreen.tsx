import { Coins, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileCreditsScreenProps {
  credits: number | null;
  error: string | null;
}

export function MobileCreditsScreen({ credits, error }: MobileCreditsScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (credits !== null) {
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    }
  }, [credits]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      if (res.ok && data.code === 200 && typeof data.data === "number") {
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 pb-24">
      <div className="w-20 h-20 rounded-full bg-[#00D1FF]/10 flex items-center justify-center mb-6">
        <Coins className="w-10 h-10 text-[#00D1FF]" />
      </div>

      <h2 className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold mb-2">
        Seu Saldo
      </h2>

      {error ? (
        <p className="text-red-400 text-lg font-bold">Erro ao carregar</p>
      ) : credits === null ? (
        <p className="text-white/40 text-lg font-bold">--</p>
      ) : (
        <p className="text-5xl font-black uppercase text-white">{credits}</p>
      )}

      <p className="text-xs uppercase tracking-widest opacity-30 font-bold mt-2">
        Créditos
      </p>

      {lastUpdate && (
        <p className="text-[10px] opacity-20 mt-4">
          Atualizado: {lastUpdate}
        </p>
      )}

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        <span className="text-xs font-bold uppercase tracking-wider">
          Atualizar
        </span>
      </button>

      <p className="text-[10px] opacity-20 mt-8 text-center">
        SONIC.AI Mobile
        <br />
        Powered by Suno API
      </p>
    </div>
  );
}