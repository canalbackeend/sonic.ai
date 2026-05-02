import React, { useState, useRef, useEffect, useMemo } from "react";
import { Loader2, Music, LogOut, Trash2 } from "lucide-react";
import { Track } from "../../types";
import { MobileTabBar } from "./MobileTabBar";
import { MobileTrackList } from "./MobileTrackList";
import { MobileCreateDrawer } from "./MobileCreateDrawer";
import { MobileMiniPlayer } from "./MobileMiniPlayer";
import { MobileCreditsScreen } from "./MobileCreditsScreen";
import { MobileLogsScreen } from "./MobileLogsScreen";
import { LyricsModal } from "../modals/LyricsModal";

type TabType = "tracks" | "create" | "credits" | "logs";

export interface TrackGroup {
  title: string;
  tracks: Track[];
}

const groupTracksByDate = (tracks: Track[]): TrackGroup[] => {
  if (!Array.isArray(tracks)) return [];

  const groups: Record<string, Track[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  tracks.forEach((track) => {
    if (!track?.createdAt) {
      groups.older.push(track);
      return;
    }
    const date = new Date(track.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trackDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (trackDate.getTime() === today.getTime()) groups.today.push(track);
    else if (trackDate.getTime() === yesterday.getTime()) groups.yesterday.push(track);
    else if (trackDate >= weekAgo) groups.thisWeek.push(track);
    else groups.older.push(track);
  });

  const result: TrackGroup[] = [];
  if (groups.today.length > 0) result.push({ title: "HOJE", tracks: groups.today });
  if (groups.yesterday.length > 0)
    result.push({ title: "ONTEM", tracks: groups.yesterday });
  if (groups.thisWeek.length > 0)
    result.push({ title: "SEMANA", tracks: groups.thisWeek });
  if (groups.older.length > 0)
    result.push({ title: "ANTIGAS", tracks: groups.older });

  return result;
};

interface MobileAppProps {
  onLogout: () => void;
}

export function MobileApp({ onLogout }: MobileAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tracks");
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [voice, setVoice] = useState("auto");
  const [makeInstrumental, setMakeInstrumental] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [error, setError] = useState("");

  const [showLyricsModal, setShowLyricsModal] = useState<Track | null>(null);

  const [tracks, setTracks] = useState<Track[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sonic_ai_tracks");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracksRef = useRef<Track[]>(tracks);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem("sonic_ai_tracks", JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (res.ok && data.code === 200 && typeof data.data === "number") {
          setCredits(data.data);
          setCreditsError(null);
        } else {
          setCreditsError("erro");
        }
      } catch {
        setCreditsError("erro");
      }
    };
    fetchCredits();
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, []);

  // Polling para verificar status das músicas pendentes
  useEffect(() => {
    const pendingTaskIds = Array.from(new Set(
      tracks
        .filter(t => t.taskId && !["SUCCESS", "complete"].includes(t.status))
        .map(t => t.taskId as string)
    ));

    if (pendingTaskIds.length === 0) return;

    const checkStatus = async () => {
      for (const taskId of pendingTaskIds) {
        try {
          const res = await fetch(`/api/status?taskId=${taskId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              const newStatus = data.data.status;
              const sunoData = data.data.response?.sunoData || [];

              if (sunoData.length > 0) {
                setTracks(prev => prev.map(t => {
                  if (t.taskId === taskId) {
                    const match = sunoData.find((s: any) => s.id === t.id);
                    if (match) {
                      return {
                        ...t,
                        audio_url: match.audioUrl || match.streamAudioUrl || t.audio_url,
                        image_url: match.imageUrl || t.image_url,
                        status: newStatus
                      };
                    }
                    return { ...t, status: newStatus };
                  }
                  return t;
                }));
              }
            }
          }
        } catch (e) {
          console.error("Status check error", e);
        }
      }
    };

    checkStatus();
    const pollInterval = setInterval(checkStatus, 5000);
    return () => clearInterval(pollInterval);
  }, [tracks]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack?.audio_url) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack?.audio_url]);

  const groupedTracks = useMemo(() => groupTracksByDate(tracks), [tracks]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const togglePlay = (track: Track) => {
    if (!track.audio_url) return;
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Apagar todo o histórico?")) {
      setTracks([]);
      localStorage.removeItem("sonic_ai_tracks");
    }
  };

  const handleGenerateMusic = async (data: {
    prompt: string;
    tags: string;
    makeInstrumental: boolean;
    voice: string;
  }) => {
    if (!data.prompt) return;

    setIsGenerating(true);
    setError("");

    try {
      let vocalGender: string | undefined;
      let finalTags = data.tags;

      if (data.voice === "duet") {
        finalTags = data.tags
          ? `${data.tags}, male and female vocals, duet`
          : "male and female vocals, duet";
        vocalGender = undefined;
      } else if (data.voice === "m") {
        vocalGender = "m";
      } else if (data.voice === "f") {
        vocalGender = "f";
      } else {
        vocalGender = undefined;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: data.prompt,
          tags: finalTags,
          make_instrumental: data.makeInstrumental,
          title: "Sonic AI Track",
          model: "V4_5ALL",
          vocalGender,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Erro");

      const enrichTrack = (track: any) => ({
        id: track.id || track.taskId || `suno-${Date.now()}`,
        taskId: track.taskId,
        title: track.title || "Sonic AI Track",
        audio_url: track.audio_url || "",
        image_url: track.image_url || "",
        tags: track.tags || finalTags,
        prompt: track.prompt || data.prompt,
        status: track.status || "submitted",
        createdAt: new Date().toISOString(),
      });

      let newTracks: Track[] = [];
      if (Array.isArray(responseData)) {
        newTracks = responseData.map(enrichTrack);
      } else if (responseData.data) {
        if (Array.isArray(responseData.data))
          newTracks = responseData.data.map(enrichTrack);
        else newTracks = [enrichTrack(responseData.data)];
      } else {
        newTracks = [enrichTrack(responseData)];
      }

      setTracks((prev) => [...newTracks, ...prev]);
      if (newTracks[0]) setCurrentTrack(newTracks[0]);
      setActiveTab("tracks");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLyricsOnly = async (promptText: string) => {
    if (!promptText) return;

    setGeneratingLyrics(true);
    setError("");

    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro");

      alert("Letra gerada! Verifique os resultados.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingLyrics(false);
    }
  };

  const handleGenerateCover = async (data: {
    url: string;
    prompt: string;
    style: string;
    title: string;
  }) => {
    if (!data.url) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/upload-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadUrl: data.url,
          prompt: data.prompt,
          style: data.style,
          title: data.title,
          model: "V4_5",
        }),
      });

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData.error || responseData.msg || "Erro");

      const newTrack: Track = {
        id: responseData.data?.taskId || `cover-${Date.now()}`,
        taskId: responseData.data?.taskId,
        title: data.title || "Cover Remix",
        audio_url: "",
        image_url: "",
        tags: data.style,
        prompt: data.prompt,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      setTracks((prev) => [newTrack, ...prev]);
      setActiveTab("tracks");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#00D1FF]" />
          <h1 className="text-lg font-black uppercase tracking-tight">
            SONIC<span className="text-[#00D1FF]">.</span>AI
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {typeof credits === "number" && (
            <span className="text-[10px] font-bold text-[#00D1FF]">
              {credits}
            </span>
          )}
          <button onClick={onLogout} className="p-2" title="Sair">
            <LogOut className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "tracks" && (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                {tracks.length} tracks
              </span>
              <button
                onClick={clearHistory}
                className="text-[10px] font-bold text-red-400 uppercase"
              >
                Limpar
              </button>
            </div>
            <MobileTrackList
              groupedTracks={groupedTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onShowLyrics={setShowLyricsModal}
              onDelete={handleDeleteTrack}
            />
          </>
        )}

        {activeTab === "create" && (
          <MobileCreateDrawer
            isGenerating={isGenerating}
            generatingLyrics={generatingLyrics}
            onGenerateMusic={handleGenerateMusic}
            onGenerateLyrics={handleGenerateLyricsOnly}
            onGenerateCover={handleGenerateCover}
          />
        )}

        {activeTab === "logs" && (
          <MobileLogsScreen onPlay={(track) => togglePlay(track)} />
        )}

        {activeTab === "credits" && (
          <MobileCreditsScreen credits={credits} error={creditsError} />
        )}
      </main>

      {/* Error */}
      {error && (
        <div className="fixed top-16 left-4 right-4 z-50">
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg text-center">
            {error}
          </div>
        </div>
      )}

      {/* Mini Player */}
      <MobileMiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSeek={handleSeek}
        formatTime={formatTime}
      />

      {/* Tab Bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audio_url}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        className="hidden"
      />

      {/* Lyrics Modal */}
      {showLyricsModal && (
        <LyricsModal
          track={showLyricsModal}
          onClose={() => setShowLyricsModal(null)}
          onCopy={() => {}}
          copied={false}
        />
      )}
    </div>
  );
}