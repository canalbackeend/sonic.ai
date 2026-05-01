import { useState, type FormEvent } from "react";
import { Lock, Music } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        localStorage.setItem("sonic_ai_auth", "true");
        onLogin();
      } else {
        setError("Senha incorreta");
      }
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00D1FF]/10 mb-6">
            <Music className="w-10 h-10 text-[#00D1FF]" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">
            SONIC.AI
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] mt-2 opacity-50 font-bold">
            Studio Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-widest opacity-40 mb-3">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 pl-12 pr-4 py-4 rounded-lg text-sm focus:outline-none focus:border-[#00D1FF] transition-colors placeholder:text-white/20"
                placeholder="Digite sua senha..."
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-[#00D1FF] text-black h-14 rounded-lg font-black uppercase text-sm tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest opacity-20 font-bold">
            Acesso restrito - SONIC.AI Studio
          </p>
        </div>
      </div>
    </div>
  );
}