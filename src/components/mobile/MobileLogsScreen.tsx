import { useState, useEffect } from "react";
import { Disc3, Loader2, RefreshCw, Download, Play, Trash2, FileText } from "lucide-react";
import { Track } from "../../types";

interface MobileLogsScreenProps {
  onPlay: (track: Track) => void;
}

export function MobileLogsScreen({ onPlay }: MobileLogsScreenProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (res.ok && data.code === 200) {
        setTracks(data.data || []);
        setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
      } else {
        setError("Erro ao carregar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover música?")) return;
    try {
      await fetch(`/api/logs/${id}`, { method: "DELETE" });
      setTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Delete error", e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00D1FF]" />
        <p className="text-xs opacity-40 mt-4">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <button onClick={fetchLogs} className="px-4 py-2 bg-white/10 rounded-lg text-sm">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-8">
        <Disc3 className="w-16 h-16 mb-4" />
        <p className="text-lg font-bold uppercase">Nenhuma música</p>
        <p className="text-xs mt-2">Crie sua primeira música na aba Criar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-xs font-bold opacity-50">
          {tracks.length} músicas
        </span>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-[10px] opacity-30">{lastUpdate}</span>
          )}
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto pb-24">
        {tracks.map((track) => {
          const isReady =
            track.status === "SUCCESS" || track.status === "complete";
          const hasAudio = !!track.audio_url;

          return (
            <div
              key={track.id}
              className="bg-[#111] border-b border-white/5 p-4 flex items-center gap-3"
            >
              <button
                onClick={() => hasAudio && onPlay(track)}
                disabled={!hasAudio}
                className={`w-12 h-12 rounded-lg bg-[#222] shrink-0 flex items-center justify-center border border-white/10 ${
                  !hasAudio ? "opacity-50" : ""
                }`}
              >
                {!hasAudio ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#00D1FF]" />
                ) : (
                  <Play className="w-5 h-5 text-[#00D1FF] ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold uppercase truncate">
                    {track.title || "Untitled"}
                  </span>
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded shrink-0 ${
                      isReady
                        ? "bg-[#00D1FF]/20 text-[#00D1FF]"
                        : "bg-white/5 opacity-50"
                    }`}
                  >
                    {isReady ? "OK" : "..."}
                  </span>
                </div>
                <p className="text-[10px] opacity-40 truncate mt-0.5">
                  {track.tags || "Custom"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasAudio && (
                  <button
                    onClick={() => window.open(track.audio_url, "_blank")}
                    className="p-2 rounded-lg border border-white/10"
                    title="Play/Download"
                  >
                    <Download className="w-4 h-4 text-white/60" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(track.id)}
                  className="p-2 rounded-lg border border-white/10"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}