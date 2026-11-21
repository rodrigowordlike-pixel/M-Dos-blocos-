import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Pause, Play, RotateCcw, Volume2, VolumeOff } from 'lucide-react';

interface VslPlayerProps {
  checkoutUrl: string;
  priceLabel: string;
}

export function VslPlayer({ checkoutUrl, priceLabel }: VslPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasStartedRef = useRef(false);
  const [hasStartedWithAudio, setHasStartedWithAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Executa apenas na montagem inicial para prévia silenciosa (nunca re-muta após o clique do usuário)
    videoEl.defaultMuted = true;
    videoEl.muted = true;
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');

    let previewStarted = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !previewStarted && !hasStartedRef.current) {
            previewStarted = true;
            videoEl.play().catch(() => {});
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, []);

  const handleStartVslWithAudio = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    hasStartedRef.current = true;
    videoEl.removeAttribute('muted');
    videoEl.defaultMuted = false;
    videoEl.muted = false;
    videoEl.volume = 1;
    videoEl.loop = false;

    if (videoEl.readyState >= 1 && videoEl.currentTime > 0) {
      videoEl.currentTime = 0;
    }

    setIsMuted(false);
    setHasStartedWithAudio(true);
    setHasEnded(false);
    setProgressPercent(0);

    videoEl
      .play()
      .then(() => {
        // Garante que o áudio permanece ativo após iniciar a reprodução
        videoEl.muted = false;
        setIsMuted(false);
        setIsPlaying(true);
      })
      .catch((err) => {
        if (err && err.name === 'NotAllowedError') {
          videoEl.muted = true;
          setIsMuted(true);
          videoEl
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      });
  };

  const handleVideoSurfaceClick = () => {
    if (!hasStartedWithAudio) {
      handleStartVslWithAudio();
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl || hasEnded) return;

    if (videoEl.paused) {
      videoEl.removeAttribute('muted');
      videoEl.muted = isMuted;
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  const handleTogglePlayButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleVideoSurfaceClick();
  };

  const handleToggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!hasStartedWithAudio) {
      handleStartVslWithAudio();
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const nextMuted = !isMuted;
    if (nextMuted) {
      videoEl.muted = true;
    } else {
      videoEl.removeAttribute('muted');
      videoEl.defaultMuted = false;
      videoEl.muted = false;
      videoEl.volume = 1;
    }
    setIsMuted(nextMuted);

    if (videoEl.paused && !hasEnded) {
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleReplay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleStartVslWithAudio();
  };

  return (
    <div className="w-full max-w-[290px] sm:max-w-[320px] mx-auto">
      {/* Player estilo VSL clássico (fundo escuro + botão Play circular branco + barra vermelha sem segundos) */}
      <div className="rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
        {/* Área do vídeo 9:16 */}
        <div
          onClick={handleVideoSurfaceClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleVideoSurfaceClick();
            }
          }}
          aria-label={
            !hasStartedWithAudio
              ? 'Dar play e assistir ao vídeo com áudio'
              : isPlaying
              ? 'Pausar vídeo'
              : 'Continuar vídeo'
          }
          className="relative aspect-[9/16] bg-neutral-900 cursor-pointer select-none overflow-hidden"
        >
          <video
            ref={videoRef}
            src="/assets/video-demonstracao.mp4"
            poster="/assets/video-poster.webp"
            muted={isMuted}
            loop={!hasStartedWithAudio}
            playsInline
            preload="none"
            onVolumeChange={(e) => {
              if (hasStartedRef.current) {
                setIsMuted(e.currentTarget.muted);
              }
            }}
            onTimeUpdate={(e) => {
              const vid = e.currentTarget;
              if (hasStartedRef.current && Number.isFinite(vid.duration) && vid.duration > 0) {
                setProgressPercent(Math.min(100, Math.max(0, (vid.currentTime / vid.duration) * 100)));
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setHasEnded(true);
              setProgressPercent(100);
            }}
            className="w-full h-full object-cover bg-neutral-900"
          />

          {/* Estado 1: Antes do play — botão circular branco clássico de VSL + chamada de áudio sem mostrar duração */}
          {!hasStartedWithAudio && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-5 text-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-24 h-24 rounded-full border-2 border-white/35 animate-ping" />
                <div className="w-20 h-20 rounded-full border-[3.5px] border-white bg-black/55 backdrop-blur-xs flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.65)] transition-transform duration-200 hover:scale-105">
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </div>
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-white drop-shadow">
                Toque para assistir com áudio
              </p>
            </div>
          )}

          {/* Estado 2: Pausado manualmente após iniciar */}
          {hasStartedWithAudio && !isPlaying && !hasEnded && (
            <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-[3.5px] border-white bg-black/60 flex items-center justify-center shadow-2xl">
                <Play className="w-9 h-9 text-white fill-white ml-1" />
              </div>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-white">
                Continuar assistindo
              </p>
            </div>
          )}

          {/* Estado 3: Vídeo finalizado — CTA direto */}
          {hasEnded && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center cursor-default"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-base font-black text-white leading-tight mb-1">
                Agora você já viu o que vai receber!
              </p>
              <p className="text-xs text-neutral-300 mb-4">
                Garanta acesso imediato no seu e-mail agora mesmo.
              </p>
              <a
                href={checkoutUrl}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-xs py-3.5 px-4 rounded-xl shadow-lg uppercase tracking-wide transition-colors"
              >
                <span>QUERO RECEBER · {priceLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={handleReplay}
                className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Assistir novamente</span>
              </button>
            </div>
          )}
        </div>

        {/* Barra inferior estilo VSL (vermelha, limpa e SEM segundos/duração) */}
        <div className="bg-red-600 px-3 py-2 flex items-center gap-2.5 text-white">
          <button
            type="button"
            onClick={handleTogglePlayButton}
            aria-label={isPlaying && hasStartedWithAudio ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            className="hover:opacity-85 transition-opacity cursor-pointer shrink-0 flex items-center justify-center"
          >
            {isPlaying && hasStartedWithAudio ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
          </button>

          {/* Barra de progresso sem marcador numérico de tempo */}
          <div className="flex-1 h-1.5 bg-white/35 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-[width] duration-150"
              style={{
                width: `${hasStartedWithAudio ? progressPercent : 14}%`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="hover:opacity-85 transition-opacity cursor-pointer shrink-0 flex items-center justify-center"
          >
            {isMuted || !hasStartedWithAudio ? (
              <VolumeOff className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
