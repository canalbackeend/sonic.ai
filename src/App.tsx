import React, { useState, useRef, useEffect, useMemo } from "react";
import { Loader2, Disc3, Trash2, HelpCircle, LogOut } from "lucide-react";
import { Track, AIModel, VocalGender } from "./types";
import { LyricsModal } from "./components/modals/LyricsModal";
import { HelpModal } from "./components/modals/HelpModal";
import { NowPlayingBar } from "./components/player/NowPlayingBar";
import { TrackList } from "./components/track/TrackList";
import { StylePresets } from "./components/form/StylePresets";
import { LyricsInput } from "./components/form/LyricsInput";
import { AdvancedSettings } from "./components/form/AdvancedSettings";
import { UploadCover } from "./components/form/UploadCover";
import { Toggle } from "./components/ui/Toggle";
import { LoginScreen } from "./components/auth/LoginScreen";

export interface TrackGroup {
  title: string;
  tracks: Track[];
}

const getDateKey = (dateStr: string | undefined): "today" | "yesterday" | "thisWeek" | "older" => {
  if (!dateStr) return "older";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "older";
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const trackDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (trackDate.getTime() === today.getTime()) return "today";
  if (trackDate.getTime() === yesterday.getTime()) return "yesterday";
  if (trackDate >= weekAgo) return "thisWeek";
  return "older";
};

const calculateDateKey = (track: Track, index: number): "today" | "yesterday" | "thisWeek" | "older" => {
  if (track.createdAt) {
    return getDateKey(track.createdAt);
  }
  if (index < 3) return "today";
  if (index < 6) return "yesterday";
  if (index < 13) return "thisWeek";
  return "older";
};

const groupTracksByDate = (tracks: Track[]): TrackGroup[] => {
  const groups: { today: Track[]; yesterday: Track[]; thisWeek: Track[]; older: Track[] } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };
  
  tracks.forEach((track, index) => {
    const key = calculateDateKey(track, index);
    groups[key].push(track);
  });
  
  const result: TrackGroup[] = [];
  
  if (groups.today.length > 0) result.push({ title: "HOJE", tracks: groups.today });
  if (groups.yesterday.length > 0) result.push({ title: "ONTEM", tracks: groups.yesterday });
  if (groups.thisWeek.length > 0) result.push({ title: "SEMANA PASSADA", tracks: groups.thisWeek });
  if (groups.older.length > 0) result.push({ title: "MAIS ANTIGOS", tracks: groups.older });
  
  return result;
};

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sonic_ai_auth") === "true";
    }
    return false;
  });

  // Form state
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [useLyrics, setUseLyrics] = useState(false);
  const [lyrics, setLyrics] = useState("");
  
  // Advanced settings state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("V4_5ALL");
  const [vocalGender, setVocalGender] = useState<VocalGender>("");
  const [styleWeight, setStyleWeight] = useState(0.8);
  const [audioWeight, setAudioWeight] = useState(0.8);
  const [weirdnessConstraint, setWeirdnessConstraint] = useState(0.5);
  const [negativeTags, setNegativeTags] = useState("");
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [lyricsResults, setLyricsResults] = useState<{title: string; text: string; tags?: string; prompt?: string}[]>([]);
  const [lyricsTaskId, setLyricsTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [generateSingle, setGenerateSingle] = useState(false);
  
  // Tracks state
  const [tracks, setTracks] = useState<Track[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sonic_ai_tracks");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Failed to load tracks", e);
          return [];
        }
      }
    }
    return [];
  });
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Modal state
  const [showLyricsModal, setShowLyricsModal] = useState<Track | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Video generation state
  const [videoGeneratingIds, setVideoGeneratingIds] = useState<Set<string>>(new Set());
  
  // Credits state
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  
  // Upload cover state
  const [showUploadCover, setShowUploadCover] = useState(false);
  const [uploadCoverUrl, setUploadCoverUrl] = useState("");
  const [uploadCoverPrompt, setUploadCoverPrompt] = useState("");
  const [uploadCoverStyle, setUploadCoverStyle] = useState("");
  const [uploadCoverTitle, setUploadCoverTitle] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Grouped tracks by date
  const groupedTracks = useMemo(() => groupTracksByDate(tracks), [tracks]);

  // Persistence: Save tracks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sonic_ai_tracks", JSON.stringify(tracks));
  }, [tracks]);

  // Fetch credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (res.ok && data.code === 200 && typeof data.data === 'number') {
          setCredits(data.data);
          setCreditsError(null);
        } else {
          setCreditsError("erro");
        }
      } catch (err) {
        setCreditsError("erro");
      }
    };
    fetchCredits();
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    if (confirm("Deseja realmente apagar todo o histórico de músicas?")) {
      setTracks([]);
      localStorage.removeItem("sonic_ai_tracks");
    }
  };

  const handleLogout = () => {
    if (confirm("Deseja sair do aplicativo?")) {
      localStorage.removeItem("sonic_ai_auth");
      setIsAuthenticated(false);
    }
  };

  // Poll for unfinished tracks or tracks that are generating videos
  useEffect(() => {
    const pendingTaskIds = Array.from(new Set(tracks
      .filter(t => t.taskId && (
        !["SUCCESS", "GENERATE_AUDIO_FAILED", "CREATE_TASK_FAILED"].includes(t.status) ||
        (t.status === 'SUCCESS' && videoGeneratingIds.has(t.id) && !t.video_url)
      ))
      .map(t => t.taskId as string)
    ));

    if (pendingTaskIds.length === 0) return;

    const interval = setInterval(async () => {
      try {
        for (const taskId of pendingTaskIds) {
          const res = await fetch(`/api/status?taskId=${taskId}`);
          if (res.ok) {
             const data = await res.json();
             if (data?.data && data.data.taskId === taskId) {
               const newStatus = data.data.status;
               const sunoData: any[] = data.data.response?.sunoData || [];

               setTracks(prev => {
                  if (sunoData.length > 0) {
                      const withoutPlaceholder = prev.filter(t => !(t.taskId === taskId && t.id === taskId));
                      const knownIds = new Set(prev.map(t => t.id));
                      
                      const newActualTracks = sunoData.filter(st => !knownIds.has(st.id)).map(st => ({
                        id: st.id,
                        taskId: taskId,
                        title: st.title || prev.find(t => t.taskId === taskId)?.title || "Track",
                        audio_url: st.audioUrl || st.streamAudioUrl || "",
                        image_url: st.imageUrl || "",
                        video_url: st.videoUrl || "",
                        tags: st.tags || prev.find(t => t.taskId === taskId)?.tags || "",
                        prompt: st.prompt || prev.find(t => t.taskId === taskId)?.prompt || "",
                        lyrics: st.lyrics || st.metadata?.prompt || "",
                        status: newStatus
                      }));
                      
                      const updatedPrev = withoutPlaceholder.map(t => {
                         if (t.taskId === taskId) {
                            const match = sunoData.find(st => st.id === t.id);
                            if (match) {
                               return { 
                                 ...t, 
                                 audio_url: match.audioUrl || match.streamAudioUrl || "", 
                                 image_url: match.imageUrl || "", 
                                 video_url: match.videoUrl || t.video_url || "",
                                 lyrics: match.lyrics || match.metadata?.prompt || t.lyrics || "",
                                 status: newStatus 
                               };
                            }
                         }
                         return t;
                      });

                      const finalTracks = [...newActualTracks, ...updatedPrev];
                      
                      setCurrentTrack(curr => {
                          if (curr && curr.id === taskId && newActualTracks.length > 0) {
                              return newActualTracks[0];
                          }
                          if (curr && curr.taskId === taskId) {
                              const match = finalTracks.find(t => t.id === curr.id);
                              if (match) return match;
                          }
                          return curr;
                      });
                      
                      return finalTracks;
                  } else {
                     return prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t);
                  }
               });
             }
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tracks, videoGeneratingIds]);

  // Audio player control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack?.audio_url) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
           playPromise.catch(e => {
             if (e.name !== "AbortError") {
               console.error("Audio play error", e.message);
               setIsPlaying(false);
             }
           });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack?.audio_url]);

  // Lyrics polling
  useEffect(() => {
    if (!lyricsTaskId || !generatingLyrics) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lyrics-status?taskId=${lyricsTaskId}`);
        const data = await res.json();

        if (data.code === 200 && data.data?.status === "SUCCESS" && data.data?.response?.data) {
          const lyrics = data.data.response.data.map((item: any) => ({
            title: item.title,
            text: item.text,
            tags: prompt,
            prompt: prompt
          }));
          setLyricsResults(lyrics);
          setGeneratingLyrics(false);
          setLyricsTaskId(null);
        } else if (data.data?.status === "GENERATE_LYRICS_FAILED" || data.data?.status === "CREATE_TASK_FAILED") {
          setError(data.data?.errorMessage || "Falha ao gerando letras.");
          setGeneratingLyrics(false);
          setLyricsTaskId(null);
        } else if (data.data?.status === "SENSITIVE_WORD_ERROR") {
          setError("Palavra sensível detectada. Tente outro prompt.");
          setGeneratingLyrics(false);
          setLyricsTaskId(null);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lyricsTaskId, generatingLyrics, prompt]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompt,
          tags, 
          lyrics: useLyrics ? lyrics : "",
          make_instrumental: makeInstrumental,
          title: "Sonic AI Track",
          model: selectedModel,
          vocalGender: makeInstrumental ? undefined : (vocalGender || undefined),
          styleWeight,
          audioWeight,
          weirdnessConstraint,
          negativeTags
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerar música.");
      }

      const enrichTrack = (track: any) => {
        if (!track) return track;
        if (track.taskId) {
            track.id = track.taskId; 
        } else if (!track.id) {
            track.id = `suno-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!track.status) track.status = "submitted";
        if (!track.prompt) track.prompt = prompt;
        if (!track.tags) track.tags = tags;
        if (!track.createdAt) track.createdAt = new Date().toISOString();
        return track;
      };

      if (Array.isArray(data)) {
        const tracksToUse = generateSingle ? [data[0]] : data;
        const mapped = tracksToUse.map(enrichTrack);
        setTracks(prev => [...mapped, ...prev]);
        if (!currentTrack && mapped.length > 0) setCurrentTrack(mapped[0]);
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          const tracksToUse = generateSingle ? [data.data[0]] : data.data;
          const mapped = tracksToUse.map(enrichTrack);
          setTracks(prev => [...mapped, ...prev]);
          if (!currentTrack && mapped.length > 0) setCurrentTrack(mapped[0]);
        } else if (typeof data.data === 'object') {
          if (data.data.taskId && !data.data.id) {
             data.data.id = data.data.taskId;
          }
          const mapped = enrichTrack(data.data);
          setTracks(prev => [mapped, ...prev]);
          if (!currentTrack) setCurrentTrack(mapped);
        } else if (typeof data.data === 'string') {
          const newTrack = { id: data.data, taskId: data.data, title: prompt, prompt, tags, image_url: "", audio_url: "", status: "submitted", createdAt: new Date().toISOString() };
          setTracks(prev => [newTrack as any, ...prev]);
          if (!currentTrack) setCurrentTrack(newTrack as any);
        }
      } else if (data.id) {
        const mapped = enrichTrack(data);
        setTracks(prev => [mapped, ...prev]);
        if (!currentTrack) setCurrentTrack(mapped);
      } else if (data.taskId) {
        const mapped = enrichTrack(data);
        setTracks(prev => [mapped, ...prev]);
        if (!currentTrack) setCurrentTrack(mapped);
      } else {
        const newTrack = enrichTrack(Array.isArray(data) ? data[0] : (data.data || data));
        if (newTrack && typeof newTrack === 'object') {
          setTracks(prev => [newTrack, ...prev]);
          if (!currentTrack) setCurrentTrack(newTrack);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
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

  const handleGenerateLyricsOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setGeneratingLyrics(true);
    setError("");
    setLyricsResults([]);

    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerando letras.");
      }

      const taskId = data.data?.taskId || data.taskId || data.data?.id;
      if (taskId) {
        setLyricsTaskId(taskId);
      } else if (data.data?.lyricsData) {
        setLyricsResults(data.data.lyricsData);
        setGeneratingLyrics(false);
      } else if (data.data) {
        const lyricsData = data.data.lyricsData || data.data.lyrics || data.data;
        if (lyricsData) {
          setLyricsResults(lyricsData);
          setGeneratingLyrics(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setGeneratingLyrics(false);
    }
  };

  const handleGenerateVideo = async (track: Track) => {
    if (!track.id) return;
    
    setVideoGeneratingIds(prev => new Set(prev).add(track.id));
    setError("");

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: track.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerar vídeo.");
      }
    } catch (err: any) {
      setError(err.message);
      setVideoGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const handleUploadCover = async () => {
    if (!uploadCoverUrl) return;

    setIsUploadingCover(true);
    setError("");

    try {
      const response = await fetch("/api/upload-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadUrl: uploadCoverUrl,
          prompt: uploadCoverPrompt,
          style: uploadCoverStyle,
          title: uploadCoverTitle || "Cover Remix",
          model: selectedModel || "V4_5"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || data.msg || `Erro ${response.status}: Limite excedido`;
        throw new Error(errorMsg);
      }

      // Handle response - similar to handleGenerate
      if (data.data?.taskId) {
        const taskId = data.data.taskId;
        const newTrack: Track = {
          id: taskId,
          taskId: taskId,
          title: uploadCoverTitle || "Cover Remix",
          audio_url: "",
          image_url: "",
          tags: uploadCoverStyle,
          prompt: uploadCoverPrompt,
          status: "PENDING",
          createdAt: new Date().toISOString()
        };
        setTracks(prev => [newTrack, ...prev]);
        setShowUploadCover(false);
        setUploadCoverUrl("");
        setUploadCoverPrompt("");
        setUploadCoverStyle("");
        setUploadCoverTitle("");
      }
    } catch (err: any) {
      console.error("Upload cover error:", err);
      setError(err.message || "Erro ao fazer cover. Aguarde e tente novamente.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

const handleReuseTrack = (track: Track) => {
  const lyricsContent = track.lyrics && track.lyrics.trim().length > 0 
    ? track.lyrics 
    : track.prompt || "";
  
  setTags(track.tags || "");
  setUseLyrics(true);
  setLyrics(lyricsContent);
  setPrompt("");
};

const handleMashupTrack = async (track: Track) => {
  if (!track.audio_url) return;
  
  setIsGenerating(true);
  setError("");

  try {
    const response = await fetch("/api/mashup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url1: track.audio_url,
        url2: track.audio_url,
        model: "V5",
        prompt: `[Verse] Remix of ${track.title}`,
        style: track.tags || "pop",
        title: `${track.title} Mashup`
      })
    });

    const text = await response.text();
    console.log("Mashup response:", response.status, text);

    if (!response.ok) {
      throw new Error(text || `Erro ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.data?.taskId) {
      const taskId = data.data.taskId;
      const newTrack: Track = {
        id: taskId,
        taskId: taskId,
        title: `${track.title} Mashup`,
        audio_url: "",
        image_url: "",
        tags: track.tags,
        status: "PENDING",
        createdAt: new Date().toISOString()
      };
      setTracks(prev => [newTrack, ...prev]);
    }
  } catch (err: any) {
    console.error("Mashup error:", err);
    setError(err.message || "Erro ao fazer mashup");
  } finally {
    setIsGenerating(false);
  }
};

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col xl:flex-row h-screen w-full bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#00D1FF]/30">
      {/* Left Sidebar: Generation Controls */}
      <aside className="w-full xl:w-[450px] shrink-0 border-b xl:border-b-0 xl:border-r border-white/10 p-6 md:p-8 flex flex-col xl:h-full overflow-y-auto bg-[#050505] z-10 pb-48 xl:pb-48">
        <div>
          <div className="mb-12">
            <h1 className="text-[64px] font-black leading-none tracking-tighter uppercase relative">
              SONIC<span className="text-[#00D1FF]">.</span>AI
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] mt-2 opacity-50 font-bold">Powered by Suno Engine</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            <section>
              <label htmlFor="prompt" className="block text-[10px] uppercase tracking-widest opacity-40 mb-3">
                Music Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A synthwave track with heavy bass and ethereal vocals about a cyberpunk city..."
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg text-sm h-32 focus:outline-none focus:border-[#00D1FF] transition-colors resize-none"
                required
              />
            </section>

            <section>
              <label htmlFor="tags" className="block text-[10px] uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                Style Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ex: Synthwave, Pop, Rock..."
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg text-sm focus:outline-none focus:border-[#00D1FF] transition-colors mb-4"
              />

              <StylePresets selectedTags={tags} onSelectTags={setTags} />
            </section>
            
            <LyricsInput
              useLyrics={useLyrics}
              lyrics={lyrics}
              onToggle={setUseLyrics}
              onLyricsChange={setLyrics}
            />

            <section>
              <Toggle
                label="Instrumental Only"
                checked={makeInstrumental}
                onChange={setMakeInstrumental}
              />
              <div className="mt-3">
                <Toggle
                  label="Gerar apenas 1"
                  checked={generateSingle}
                  onChange={setGenerateSingle}
                />
              </div>
            </section>

            <AdvancedSettings
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
              makeInstrumental={makeInstrumental}
              selectedModel={selectedModel}
              vocalGender={vocalGender}
              styleWeight={styleWeight}
              audioWeight={audioWeight}
              weirdnessConstraint={weirdnessConstraint}
              negativeTags={negativeTags}
              onModelChange={setSelectedModel}
              onVocalGenderChange={setVocalGender}
              onStyleWeightChange={setStyleWeight}
              onAudioWeightChange={setAudioWeight}
              onWeirdnessChange={setWeirdnessConstraint}
              onNegativeTagsChange={setNegativeTags}
            />

            <div className="pt-4">
              <button
                type="submit"
                disabled={isGenerating || !prompt}
                className="w-full bg-[#00D1FF] text-black h-16 rounded mb-8 xl:mb-0 font-black uppercase text-lg tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> GENERATING...
                  </>
                ) : (
                  <>
                    GENERATE TRACK
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleGenerateLyricsOnly}
                disabled={generatingLyrics || !prompt}
                className="w-full bg-[#FF6B35] text-black h-12 rounded font-black uppercase text-sm tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                {generatingLyrics ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> GENERATING...
                  </>
                ) : (
                  <>
                    GENERATE LYRICS ONLY
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-full bg-[#111] border border-white/10 text-white/60 h-10 rounded font-bold uppercase text-xs tracking-widest hover:border-white/30 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" /> COMO USAR PROMPTS
              </button>

              <button
                type="button"
                onClick={() => setShowUploadCover(true)}
                className="w-full bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-[#FF6B35] h-10 rounded font-bold uppercase text-xs tracking-widest hover:bg-[#FF6B35]/30 hover:border-[#FF6B35]/50 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Disc3 className="w-4 h-4" /> COVER / REMIX
              </button>

              {typeof credits === 'number' && (
                <div className="mt-3 text-[10px] text-white/30 text-center uppercase tracking-widest">
                  Saldo: {credits} créditos
                </div>
              )}
            </div>
              
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase rounded text-center">
                {error}
              </div>
            )}
          </form>

          {lyricsResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Generated Lyrics</h3>
              {lyricsResults.map((lyric, idx) => (
                <div key={idx} className="bg-[#111] border border-[#FF6B35]/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{lyric.title}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLyricsModal({ id: `lyrics-${idx}`, title: lyric.title, tags: lyric.tags || prompt, lyrics: lyric.text, prompt: lyric.prompt, audio_url: "", image_url: "", status: "complete" })}
                        className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                      >
                        VER MAIS
                      </button>
                      <button
                        onClick={() => {
                          setLyrics(lyric.text);
                          setUseLyrics(true);
                        }}
                        className="text-[10px] uppercase tracking-widest text-[#FF6B35] font-bold"
                      >
                        USAR ESTA
                      </button>
                    </div>
                  </div>
                  <p className="text-xs opacity-60 line-clamp-2">{lyric.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content: Studio Gallery */}
      <main className="flex-1 p-6 md:p-12 flex flex-col xl:h-full overflow-y-auto relative pb-32">
        {(isGenerating || generatingLyrics) && (
          <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-[#00D1FF]/20 border-t-[#00D1FF] animate-spin"></div>
              <Disc3 className="absolute inset-0 m-auto w-12 h-12 text-[#00D1FF]/40 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black uppercase italic mt-12 tracking-tighter">{generatingLyrics ? "Generating Lyrics..." : "Initializing Synthesis..."}</h3>
            <p className="text-xs uppercase tracking-[0.5em] mt-4 opacity-40 font-bold animate-pulse">Neural Frequencies are being Aligned</p>
            
            <div className="w-64 h-1 bg-white/5 rounded-full mt-12 overflow-hidden">
               <div className="h-full bg-[#00D1FF] animate-pulse w-full"></div>
            </div>

            <button
              onClick={() => {
                setIsGenerating(false);
                setGeneratingLyrics(false);
                setError("");
              }}
              className="mt-8 px-6 py-3 rounded-full font-black uppercase text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        <header className="flex flex-col sm:flex-row sm:justify-between items-baseline mb-12 gap-4">
          <h2 className="text-4xl font-black uppercase italic">Studio Records</h2>
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLogout}
              className="text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity tracking-widest uppercase flex items-center gap-2 group"
            >
              <LogOut className="w-3 h-3 group-hover:text-red-500 transition-colors" /> Sair
            </button>
            <button 
              onClick={clearHistory}
              className="text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity tracking-widest uppercase flex items-center gap-2 group"
            >
              <Trash2 className="w-3 h-3 group-hover:text-red-500 transition-colors" /> Limpar Histórico
            </button>
            <div className="text-[10px] font-bold opacity-30 tracking-widest uppercase">STORAGE: {tracks.length} TRACKS</div>
          </div>
        </header>

        <TrackList
          groupedTracks={groupedTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          videoGeneratingIds={videoGeneratingIds}
          onTogglePlay={togglePlay}
          onShowLyrics={setShowLyricsModal}
          onGenerateVideo={handleGenerateVideo}
          onReuse={handleReuseTrack}
          onMashup={handleMashupTrack}
          onDelete={handleDeleteTrack}
        />

        {/* Bottom Branding Overlay */}
        <div className="mt-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-end gap-6 relative w-full">
          <div className="max-w-xs z-10 pb-12 xl:pb-0">
            <p className="text-[10px] uppercase leading-relaxed tracking-tighter opacity-30 font-bold">
              Every sonic grain is unique. Our generative neural network interprets your creative intent into high-fidelity frequency patterns.
            </p>
          </div>
          <div className="text-right z-10 pb-12 xl:pb-0">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">v2.0.4-STABLE</div>
          </div>
          <span className="text-[60px] md:text-[80px] font-black leading-none opacity-[0.03] block absolute bottom-8 right-0 pointer-events-none select-none">FREQUENCIES</span>
        </div>
      </main>

      {/* Global Audio Player */}
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
      
      {/* Now Playing Bar */}
      {currentTrack && (
        <NowPlayingBar
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          formatTime={formatTime}
        />
      )}

      {/* Lyrics Modal */}
      {showLyricsModal && (
        <LyricsModal
          track={showLyricsModal}
          onClose={() => setShowLyricsModal(null)}
          onCopy={copyToClipboard}
          copied={copied}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {/* Upload Cover Modal */}
      <UploadCover
        isOpen={showUploadCover}
        onClose={() => setShowUploadCover(false)}
        uploadUrl={uploadCoverUrl}
        setUploadUrl={setUploadCoverUrl}
        prompt={uploadCoverPrompt}
        setPrompt={setUploadCoverPrompt}
        style={uploadCoverStyle}
        setStyle={setUploadCoverStyle}
        title={uploadCoverTitle}
        setTitle={setUploadCoverTitle}
        isUploading={isUploadingCover}
        onSubmit={handleUploadCover}
      />
    </div>
  );
}
