import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, RotateCcw, BadgeCheck, ArrowRight, ChevronDown, Volume2, VolumeX } from 'lucide-react';

const SalesToast = lazy(() =>
  import('./components/SalesToast').then((m) => ({ default: m.SalesToast }))
);
const PrizeWheelModal = lazy(() =>
  import('./components/PrizeWheelModal').then((m) => ({ default: m.PrizeWheelModal }))
);
const preloadPrizeWheel = () => import('./components/PrizeWheelModal');

const CHECKOUT_COMBO_URL = 'https://pay.wiapy.com/iHnQlTMv88d'; // R$ 37,90
const CHECKOUT_BASIC_URL = 'https://pay.wiapy.com/JCduapP0LGGE'; // R$ 29,90
const CHECKOUT_DISCOUNT_URL = 'https://pay.wiapy.com/fHTFBT-7RCn'; // R$ 35,90 (Roleta Premiada)

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const trackInitiateCheckout = (contentName: string, value: number) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: contentName,
        value: value,
        currency: 'BRL',
      });
    } catch {
      // Ignorar caso bloqueado por adblocker
    }
  }
};

export default function App() {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [hasDiscountApplied, setHasDiscountApplied] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [mountDeferredUi, setMountDeferredUi] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMountDeferredUi(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    // Garante compatibilidade com autoplay silencioso no iOS Safari, Android e WebViews (Meta/Instagram)
    videoEl.defaultMuted = true;
    videoEl.muted = true;
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');

    let hasAutoPlayed = false;

    const cleanupListeners = () => {
      window.removeEventListener('scroll', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
      window.removeEventListener('wheel', tryPlay);
      videoEl.removeEventListener('canplay', tryPlay);
    };

    const tryPlay = () => {
      if (hasAutoPlayed || !videoEl.paused) {
        hasAutoPlayed = true;
        cleanupListeners();
        return;
      }
      videoEl
        .play()
        .then(() => {
          hasAutoPlayed = true;
          cleanupListeners();
        })
        .catch(() => {
          // Aguarda primeira rolagem ou toque na tela se o navegador bloquear
        });
    };

    // Inicia vídeo logo após a primeira pintura para não competir com o LCP no 4G/celular
    const rafId = requestAnimationFrame(() => {
      setTimeout(tryPlay, 60);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayed) {
            tryPlay();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(videoEl);
    videoEl.addEventListener('canplay', tryPlay);
    window.addEventListener('scroll', tryPlay, { passive: true });
    window.addEventListener('touchstart', tryPlay, { passive: true });
    window.addEventListener('wheel', tryPlay, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      cleanupListeners();
    };
  }, []);

  const handleToggleVideoSound = () => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    if (isVideoMuted) {
      videoEl.muted = false;
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
      setIsVideoMuted(false);
    } else {
      videoEl.muted = true;
      setIsVideoMuted(true);
    }
  };

  const handleVideoSurfaceClick = () => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    if (isVideoMuted) {
      handleToggleVideoSound();
    } else if (videoEl.paused) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
  };

  const scrollToOffers = () => {
    const el = document.getElementById('ofertas') || document.getElementById('combo-completo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClaimPrize = () => {
    trackInitiateCheckout('Combo Completo Roleta Premiada', 35.90);
    setHasDiscountApplied(true);
    setIsDiscountModalOpen(false);
    window.location.href = CHECKOUT_DISCOUNT_URL;
  };

  const handleProceedBasic = () => {
    trackInitiateCheckout('Plano Básico', 29.90);
    setIsDiscountModalOpen(false);
    window.location.href = CHECKOUT_BASIC_URL;
  };

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans relative">
      {/* Real-time Discreet Social Proof Purchase Pop-up (carregamento adiado pós-pintura inicial) */}
      {mountDeferredUi && (
        <Suspense fallback={null}>
          <SalesToast />
        </Suspense>
      )}

      {/* Roleta Premiada sob demanda ao clicar no Plano Básico */}
      {isDiscountModalOpen && (
        <Suspense fallback={null}>
          <PrizeWheelModal 
            isOpen={isDiscountModalOpen}
            onClose={() => setIsDiscountModalOpen(false)}
            onClaimPrize={handleClaimPrize}
            onProceedBasic={handleProceedBasic}
            prizeCheckoutUrl={CHECKOUT_DISCOUNT_URL}
            basicCheckoutUrl={CHECKOUT_BASIC_URL}
          />
        </Suspense>
      )}
      
      {/* Hero: Continuidade direta com o criativo + Vídeo demonstrativo otimizado */}
      <section className="bg-gradient-to-b from-sky-950 via-sky-900 to-sky-800 text-white px-4 pt-8 pb-10 sm:pt-14 sm:pb-16 relative overflow-hidden">
        {/* Glow de fundo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="container mx-auto max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-12 md:gap-x-10 md:items-center">
          {/* Bloco 1: Identificação do produto, Headline e Subheadline */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-1 text-center md:text-left">
            <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide mb-3 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
              <span>Matemática no Mundo dos Blocos</span>
              <span aria-hidden="true" className="text-sky-400">·</span>
              <span className="text-sky-100 font-semibold">+360 atividades · 1º ao 5º ano</span>
            </p>

            <h1 className="text-[1.68rem] sm:text-4xl lg:text-[2.75rem] font-black leading-[1.13] mb-3.5 sm:mb-4 tracking-tight text-white text-balance">
              Seu filho ama Minecraft e passa horas no celular, mas{' '}
              <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-4">
                trava na matemática
              </span>
              ?
            </h1>

            <p className="text-sm sm:text-lg font-medium text-sky-100 leading-relaxed max-w-xl mx-auto md:mx-0">
              Use o interesse dele por jogos de blocos para tirar o foco das telas. São{' '}
              <strong className="text-white font-bold">mais de 360 páginas em PDF para imprimir</strong>{' '}
              com missões, mapas e desafios do 1º ao 5º ano que transformam a hora de estudar sem reclamação.
            </p>
          </div>

          {/* Bloco 2: Vídeo real do material impresso com autoplay imediato ao rolar */}
          <div className="md:col-span-5 md:col-start-8 md:row-start-1 md:row-span-2 flex flex-col items-center my-6 md:my-0">
            <div className="w-full max-w-[240px] sm:max-w-[275px] aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.45)] border-2 border-white/25 bg-sky-950 relative">
              <video
                ref={heroVideoRef}
                src="/assets/video-demonstracao.mp4"
                poster="/assets/video-poster.jpg"
                autoPlay
                muted={isVideoMuted}
                loop
                playsInline
                preload="metadata"
                onClick={handleVideoSurfaceClick}
                className="w-full h-full object-cover bg-black cursor-pointer"
              />

              {isVideoMuted ? (
                <button
                  type="button"
                  onClick={handleToggleVideoSound}
                  aria-label="Ativar som da demonstração do caderno"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] bg-sky-950/85 hover:bg-sky-950 text-white border border-amber-400/70 backdrop-blur-sm rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide shadow-lg cursor-pointer transition-colors"
                >
                  <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Toque para ouvir o vídeo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleVideoSound}
                  aria-label="Silenciar demonstração"
                  className="absolute top-3 right-3 bg-sky-950/80 hover:bg-sky-950 text-white border border-white/20 backdrop-blur-sm rounded-lg p-2 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>
          </div>

          {/* Bloco 3: Benefícios objetivos, CTA pulsando e navegação suave */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-2 flex flex-col items-center md:items-start text-center md:text-left md:mt-6">
            <ul className="space-y-2 mb-6 text-xs sm:text-sm text-sky-50 font-medium max-w-md md:max-w-none text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Menos celular, mais foco no papel:</strong>{' '}
                  atividades visuais no universo que ele já gosta
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Progressivo do 1º ao 5º ano:</strong>{' '}
                  operações, probleminhas, frações, medidas e tabuada
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Pronto para imprimir hoje:</strong>{' '}
                  acesso imediato no e-mail e garantia de 7 dias
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={scrollToOffers}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-3.5 px-7 rounded-xl active:scale-[0.98] transition-colors duration-200 cursor-pointer uppercase tracking-wider whitespace-nowrap animate-cta-pulse"
            >
              <span>QUERO GARANTIR O MATERIAL</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <p className="text-[11px] sm:text-xs text-sky-200/90 mt-2.5 font-medium">
              Envio imediato em PDF no e-mail · Garantia total de 7 dias
            </p>

            <button
              type="button"
              onClick={() => document.getElementById('problema-metodo')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-200 hover:text-amber-300 transition-colors cursor-pointer mt-4 underline underline-offset-4 decoration-sky-400/40 hover:decoration-amber-300"
            >
              <span>Entenda por que funciona melhor que a lição comum</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* The Problem/Transformation */}
      <section id="problema-metodo" className="below-fold-opt container mx-auto px-4 py-8 sm:py-14 scroll-mt-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center max-w-4xl mx-auto">
          <div className="bg-sky-50 p-3 sm:p-4 rounded-2xl border border-sky-100 max-w-[200px] sm:max-w-xs mx-auto md:max-w-none">
             <img src="https://matematica.aprendizadodivertido01.com/imagens/produtoprincipal.webp" alt="Atividades" loading="lazy" decoding="async" className="rounded-xl shadow-md w-36 sm:w-48 mx-auto" />
          </div>
          <div className="space-y-3 sm:space-y-5 text-left">
            <h2 className="text-xl sm:text-3xl font-black text-sky-950 leading-tight">O PROBLEMA NÃO É O SEU FILHO, É O MÉTODO!</h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">Enquanto você tenta ensinar números abstratos, o cérebro dele clama por estímulos visuais, lógica e diversão prática.</p>
            <p className="text-sm sm:text-lg font-bold text-sky-900 border-l-4 border-amber-400 pl-3">A matemática fica fácil quando ela fala a língua dele.</p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">Nosso material transforma a resistência em missão. Ele não está apenas fazendo contas; ele está resolvendo desafios no estilo do universo que ele adora. <span className="font-bold text-sky-800">Você percebe a confiança dele voltar nas primeiras páginas.</span></p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="below-fold-opt bg-gray-50 py-8 sm:py-14 border-y border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <h2 className="text-xl sm:text-3xl font-black text-sky-950 mb-4 sm:mb-6">VEJA QUEM JÁ VIU A MUDANÇA:</h2>
          <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-3 sm:pb-5 snap-x snap-mandatory scrollbar-hide px-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <img key={i} src={`https://matematica.aprendizadodivertido01.com/imagens/PROVASOCIAL%20(${i}).webp`} alt={`Relato ${i}`} loading="lazy" decoding="async" className="snap-center h-[360px] xs:h-[400px] sm:h-[480px] rounded-2xl shadow-sm shrink-0 border border-gray-200/70" />
            ))}
          </div>
          <p className="text-center font-bold mt-2 text-sky-700 text-xs sm:text-sm animate-pulse">👈 Arraste para o lado para ler os relatos →</p>
        </div>
      </section>

      {/* Extra Materials Section */}
      <section className="below-fold-opt container mx-auto px-4 py-8 sm:py-14 bg-white text-sky-900 max-w-3xl">
        <h2 className="text-xl sm:text-3xl font-black mb-5 sm:mb-8 text-center">E NÃO PARA POR AÍ... TEM MAIS 5 BÔNUS!</h2>
        <div className="space-y-3 sm:space-y-3.5">
          {[
            { img: 'https://matematica.aprendizadodivertido01.com/imagens/probleminhas.webp', title: 'EXTRA 01: 100 PROBLEMINHAS', desc: 'Aprende a interpretar problemas reais e desenvolver raciocínio lógico brincando.' },
            { img: 'https://matematica.aprendizadodivertido01.com/imagens/tabuada.webp', title: 'EXTRA 02: TABUADA VISUAL', desc: 'Chega de decorar sem entender. Multiplicação de forma intuitiva e memorável.' },
            { img: 'https://matematica.aprendizadodivertido01.com/imagens/bonus1.webp', title: 'BÔNUS 01: MAPA DE PROGRESSO', desc: 'A criança visualiza cada conquista. Motivação contínua para avançar.' },
            { img: 'https://matematica.aprendizadodivertido01.com/imagens/bonus2.webp', title: 'BÔNUS 02: CARTÕES DE RECOMPENSA', desc: 'Reforce o esforço e pequenas metas com recompensas divertidas.' },
            { img: 'https://matematica.aprendizadodivertido01.com/imagens/bonus3.webp', title: 'BÔNUS 03: GUIA RÁPIDO PARA PAIS', desc: 'Orientações práticas para aplicar o material com leveza, sem atrito.' }
          ].map((item, i) => (
            <div key={i} className="bg-sky-50/80 p-3 sm:p-3.5 rounded-xl border border-sky-100 flex gap-3 sm:gap-4 items-center">
              <img src={item.img} alt={item.title} loading="lazy" decoding="async" className="w-16 sm:w-20 rounded-lg shadow-sm shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <h3 className="font-black text-sm sm:text-base leading-tight text-sky-950 mb-0.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug line-clamp-2">{item.desc}</p>
                <span className="text-emerald-700 font-extrabold text-[10px] sm:text-xs uppercase inline-block mt-1">GRÁTIS NO COMBO</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Offers: High Conversion Focus */}
      <section id="ofertas" className="below-fold-opt container mx-auto px-4 py-10 sm:py-16 scroll-mt-6 max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-sky-950 mb-2 sm:mb-3">
            O PREÇO DE UM LANCHE PARA MUDAR O FUTURO DELE.
          </h2>
          <p className="text-sm sm:text-lg font-bold text-red-600 animate-pulse">
            ⚠️ OFERTA LIMITADA: O DESCONTO EXPIRA EM BREVE!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-3xl mx-auto">
          {/* Basic */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between order-2 md:order-1">
            <div>
              <img src="https://matematica.aprendizadodivertido01.com/imagens/produtoprincipal.webp" alt="Básico" loading="lazy" decoding="async" className="rounded-xl mb-4 w-28 sm:w-32 mx-auto shadow-md border border-gray-100" />
              <h3 className="text-lg sm:text-xl font-black text-center mb-3 text-gray-900">PLANO BÁSICO</h3>
              <ul className="space-y-1.5 mb-5 text-gray-700 font-medium text-xs sm:text-sm">
                {['360 atividades (PDF)', '1º ao 5º ano', 'Visuais e intuitivas', 'Prontas para imprimir', 'Foco em resultados'].map(item => (
                  <li key={item} className="flex gap-2 items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-center mb-4">
                <p className="text-xs sm:text-sm text-gray-400 line-through">de R$ 49,90</p>
                <p className="text-3xl sm:text-4xl font-black text-sky-900">R$ 29,90</p>
              </div>
              <button 
                onPointerEnter={() => { void preloadPrizeWheel(); }}
                onTouchStart={() => { void preloadPrizeWheel(); }}
                onClick={() => setIsDiscountModalOpen(true)}
                className="w-full bg-slate-900 hover:bg-black text-white font-black text-sm sm:text-base py-3 px-4 rounded-xl active:scale-95 transition-all duration-200 cursor-pointer uppercase tracking-wider shadow-sm"
              >
                QUERO O BÁSICO
              </button>
            </div>
          </div>

          {/* Premium (Oferta Maior) */}
          <div 
            id="combo-completo" 
            className={`bg-sky-950 p-5 sm:p-6 rounded-2xl shadow-xl border-2 relative flex flex-col justify-between order-1 md:order-2 mt-3 md:mt-0 scroll-mt-14 sm:scroll-mt-20 transition-all duration-300 ${
              hasDiscountApplied ? 'border-emerald-400 ring-4 ring-emerald-400/30 shadow-emerald-500/20' : 'border-amber-400'
            }`}
          >
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md whitespace-nowrap ${
              hasDiscountApplied 
                ? 'bg-emerald-400 text-sky-950 animate-bounce' 
                : 'bg-amber-400 text-sky-950 animate-pulse'
            }`}>
              {hasDiscountApplied ? '🎉 PRÊMIO DA ROLETA APLICADO!' : '🔥 MAIS VENDIDO'}
            </div>
            <div>
              <img src="https://matematica.aprendizadodivertido01.com/imagens/mockup.webp" alt="Completo" loading="lazy" decoding="async" className="rounded-xl mb-4 w-28 sm:w-32 mx-auto shadow-xl border border-sky-800" />
              <h3 className="text-lg sm:text-xl font-black text-center mb-1 text-white">COMBO COMPLETO</h3>
              <p className="text-center font-bold text-amber-300 mb-4 uppercase tracking-wide text-[11px] sm:text-xs">
                {hasDiscountApplied ? 'DESCONTO DA ROLETA PREMIADA' : 'MAIS CONTEÚDO, MAIS RESULTADO'}
              </p>
              <ul className="space-y-1.5 mb-5 text-white font-medium text-xs sm:text-sm">
                {['Tudo do Básico', '100 Probleminhas (Extra)', 'Tabuada Visual (Extra)', '🎁 Mapa de Progresso', '🎁 Cartões de Recompensa', '🎁 Guia Rápido Pais', 'Acesso Vitalício'].map(item => (
                  <li key={item} className="flex gap-2 items-center">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${hasDiscountApplied ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-center mb-4 bg-white/10 p-3 sm:p-3.5 rounded-xl border border-white/10">
                {hasDiscountApplied ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-xs text-sky-300 line-through">de R$ 79,90</p>
                      <p className="text-xs text-sky-300 line-through font-semibold">por R$ 37,90</p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-black text-emerald-300">R$ 35,90</p>
                    <p className="text-[10px] sm:text-xs text-emerald-300 mt-0.5 font-bold uppercase tracking-wider">
                      ⚡ Desconto da roleta ativado no PIX ou Cartão
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-sky-200 line-through">de R$ 79,90</p>
                    <p className="text-4xl sm:text-5xl font-black text-white">R$ 37,90</p>
                    <p className="text-[10px] sm:text-xs text-sky-300 mt-0.5 font-bold uppercase tracking-wider">pagamento único (economize mais de 50%)</p>
                  </>
                )}
              </div>
              <a 
                href={hasDiscountApplied ? CHECKOUT_DISCOUNT_URL : CHECKOUT_COMBO_URL}
                onClick={() => trackInitiateCheckout(hasDiscountApplied ? 'Combo Completo Roleta Premiada' : 'Combo Completo', hasDiscountApplied ? 35.90 : 37.90)}
                className={`w-full font-black text-base sm:text-lg py-3.5 px-5 rounded-xl shadow-md active:scale-95 transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 text-center ${
                  hasDiscountApplied 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-sky-950 shadow-emerald-400/30' 
                    : 'bg-amber-400 hover:bg-amber-300 text-sky-950 shadow-amber-400/30'
                }`}
              >
                <span>{hasDiscountApplied ? 'QUERO O COMBO POR R$ 35,90' : 'QUERO O COMBO COMPLETO'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-center text-sky-200 mt-2.5 text-[11px] sm:text-xs font-semibold">
                ✅ Compra 100% segura • Acesso imediato
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Professional 7-Day Guarantee Section */}
      <section className="below-fold-opt bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 text-white py-8 sm:py-14 px-4 border-t border-sky-800/40 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Main Guarantee Card */}
          <div className="bg-gradient-to-br from-sky-900/60 to-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-10 border-2 border-amber-400/40 shadow-[0_0_40px_rgba(2,132,199,0.2)] text-center">
            
            {/* Seal / Badge */}
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-500 p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-sky-950 flex flex-col items-center justify-center border-2 border-amber-300/40 text-center p-2">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 mb-0.5" />
                  <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">7 DIAS</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-200 tracking-wider uppercase mt-0.5">GARANTIA</span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-sky-950 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-md">
                100% INCONDICIONAL
              </div>
            </div>

            {/* Headline & Subhead */}
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight px-1">
              VOCÊ TEM <span className="text-amber-400 underline decoration-amber-400/60 decoration-2 sm:decoration-4">7 DIAS DE TESTE</span> COM RISCO ZERO
            </h2>
            <p className="text-xs sm:text-base text-sky-100 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1">
              O risco é <strong className="text-white font-black">100% meu</strong>, não seu. Se o seu filho não se interessar ou você achar que o material não facilitou a rotina, devolvemos seu dinheiro sem complicações.
            </p>

            {/* 3 Step Reassurance Grid */}
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-left mb-6 sm:mb-8">
              <div className="bg-sky-950/70 p-4 rounded-xl border border-sky-800/60 flex flex-col justify-start">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-black text-sm mb-2 border border-sky-400/30">
                  1
                </div>
                <h3 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Baixe e Teste Hoje
                </h3>
                <p className="text-xs text-sky-200/80 leading-relaxed">
                  Acesse no e-mail, imprima as primeiras páginas e dê para seu filho brincar e resolver.
                </p>
              </div>

              <div className="bg-sky-950/70 p-4 rounded-xl border border-sky-800/60 flex flex-col justify-start">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-sm mb-2 border border-amber-400/30">
                  2
                </div>
                <h3 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Sinta a Diferença
                </h3>
                <p className="text-xs text-sky-200/80 leading-relaxed">
                  Veja a resistência diminuir e a curiosidade dele despertar com os desafios lúdicos.
                </p>
              </div>

              <div className="bg-sky-950/70 p-4 rounded-xl border border-sky-800/60 flex flex-col justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-sm mb-2 border border-emerald-400/30">
                  3
                </div>
                <h3 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Reembolso em 1 Clique
                </h3>
                <p className="text-xs text-sky-200/80 leading-relaxed">
                  Se não gostar por qualquer razão, solicite o reembolso. Sem burocracia nem perguntas.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-sky-800/60 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-sky-200/90 font-medium">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Transação Criptografada
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Código de Defesa do Consumidor
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-400" /> Satisfação Garantida
              </span>
            </div>

            {/* CTA Button inside the Guarantee fold */}
            <div className="mt-5 pt-4 border-t border-sky-800/60">
              <a 
                href={hasDiscountApplied ? CHECKOUT_DISCOUNT_URL : CHECKOUT_COMBO_URL}
                onClick={() => trackInitiateCheckout(hasDiscountApplied ? 'Combo Completo Roleta Premiada' : 'Combo Completo', hasDiscountApplied ? 35.90 : 37.90)}
                className="w-full max-w-xs sm:max-w-sm mx-auto bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-base sm:text-lg py-3.5 px-5 rounded-xl shadow-md shadow-amber-400/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-center"
              >
                <span>{hasDiscountApplied ? 'QUERO AGORA POR R$ 35,90' : 'QUERO AGORA'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-[11px] sm:text-xs text-sky-200/80 mt-2 font-medium text-center">
                ⚡ Acesso imediato no e-mail • Garantia total de 7 dias
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="below-fold-opt bg-sky-950 text-white py-8 sm:py-14 px-4 border-t border-sky-900/40">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-xl sm:text-3xl font-black mb-5 sm:mb-8 text-center text-white">DÚVIDAS FREQUENTES</h2>
          <div className="space-y-3 text-left text-sky-950">
            {[
              { q: 'Como recebo o material?', a: 'O acesso é enviado automaticamente para o seu e-mail logo após a confirmação do pagamento.' },
              { q: 'O material é físico?', a: 'Não, o material é digital em formato PDF para você baixar e imprimir quando e como quiser.' },
              { q: 'Para quais idades é indicado?', a: 'O conteúdo foi planejado para crianças que estão cursando do 1º ao 5º ano do ensino fundamental.' },
              { q: 'Posso pedir reembolso?', a: 'Sim, você tem 7 dias de garantia para avaliar o material e, se não gostar, solicitar o reembolso.' }
            ].map((faq, i) => (
              <details key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-sky-800 shadow-md group">
                <summary className="font-black text-sm sm:text-base cursor-pointer list-none flex justify-between items-center text-sky-950">
                  <span className="pr-2">{faq.q}</span>
                  <span className="text-sky-600 font-bold text-xl group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
                </summary>
                <p className="text-gray-700 mt-2.5 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="below-fold-opt container mx-auto px-4 py-8 text-center text-gray-500 text-[11px] sm:text-xs mt-4 sm:mt-8 border-t border-gray-100">
        <p className="mb-2 font-bold">Copyright © 2026 | Todos os direitos reservados.</p>
        <p className="max-w-3xl mx-auto leading-relaxed">Material educacional independente. Este site não é afiliado ou endossado pelo Facebook™, Instagram™, Google™, Mojang Synergies AB ou Microsoft™. As referências estéticas são utilizadas exclusivamente para fins de engajamento pedagógico. O material é um recurso complementar e não substitui o acompanhamento escolar ou profissional quando necessário.</p>
      </footer>
    </div>
  );
}
