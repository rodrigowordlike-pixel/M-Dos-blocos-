import { Suspense, lazy, useEffect, useState } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  BadgeCheck,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { VslPlayer } from './components/VslPlayer';

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

const TRACKING_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ttclid',
  'src',
];

const decorateCheckoutUrl = (baseUrl: string): string => {
  if (typeof window === 'undefined') return baseUrl;
  try {
    const target = new URL(baseUrl);
    const currentParams = new URLSearchParams(window.location.search);

    TRACKING_PARAM_KEYS.forEach((key) => {
      const value = currentParams.get(key) || window.localStorage.getItem(key);
      if (value && value !== 'null' && value !== 'undefined' && !target.searchParams.has(key)) {
        target.searchParams.set(key, value);
      }
    });

    return target.toString();
  } catch {
    return baseUrl;
  }
};

export default function App() {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [hasDiscountApplied, setHasDiscountApplied] = useState(false);
  const [mountDeferredUi, setMountDeferredUi] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMountDeferredUi(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToDetails = () => {
    const el = document.getElementById('material-por-dentro') || document.getElementById('combo-completo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClaimPrize = () => {
    setHasDiscountApplied(true);
  };

  const handleProceedBasic = () => {
    // Navegação natural pelo <a> preservando UTMs e evento unificado da Utmify
  };

  const activeComboUrl = decorateCheckoutUrl(
    hasDiscountApplied ? CHECKOUT_DISCOUNT_URL : CHECKOUT_COMBO_URL
  );
  const comboPriceLabel = hasDiscountApplied ? 'R$ 35,90' : 'R$ 37,90';

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans relative">
      {/* Notificação discreta de prova social (carregamento adiado pós-pintura inicial) */}
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
            prizeCheckoutUrl={decorateCheckoutUrl(CHECKOUT_DISCOUNT_URL)}
            basicCheckoutUrl={decorateCheckoutUrl(CHECKOUT_BASIC_URL)}
          />
        </Suspense>
      )}

      {/* Primeira dobra (Mobile-First): Promessa direta + Imagem completa do material + CTA de compra */}
      <section className="bg-gradient-to-b from-sky-950 via-sky-900 to-sky-800 text-white px-4 pt-6 pb-9 sm:pt-12 sm:pb-14 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-12 md:gap-x-10 md:items-center">
          {/* Bloco 1: Produto, Headline e Promessa Principal */}
          <div className="md:col-span-6 md:col-start-1 md:row-start-1 text-center md:text-left">
            <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide mb-2.5 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
              <span>Matemática no Mundo dos Blocos</span>
              <span aria-hidden="true" className="text-sky-400">·</span>
              <span className="text-sky-100 font-semibold">+360 atividades em PDF · 1º ao 5º ano</span>
            </p>

            <h1 className="text-[1.6rem] sm:text-4xl lg:text-[2.55rem] font-black leading-[1.13] mb-3 tracking-tight text-white text-balance">
              Tire seu filho das telas com{' '}
              <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-4">
                +360 atividades de matemática
              </span>{' '}
              no universo dos blocos
            </h1>

            <p className="text-sm sm:text-lg font-medium text-sky-100 leading-relaxed max-w-xl mx-auto md:mx-0">
              Material em <strong className="text-white font-bold">PDF para imprimir (1º ao 5º ano)</strong>{' '}
              que transforma a resistência na lição de casa em missões divertidas no papel, longe do celular.
            </p>
          </div>

          {/* Bloco 2: Imagem completa do material (capa + páginas reais + bônus) com carregamento imediato */}
          <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:row-span-2 flex flex-col items-center my-5 md:my-0">
            <div className="w-full max-w-[340px] sm:max-w-[430px] rounded-2xl overflow-hidden shadow-[0_20px_44px_rgba(0,0,0,0.45)] border-2 border-amber-400/40 bg-sky-950">
              <img
                src="/assets/images/kit-completo-hero.webp"
                alt="Kit completo Matemática no Mundo dos Blocos com páginas de atividades do 1º ao 5º ano, Tabuada Visual, Probleminhas, Mapa de Progresso e Cartões de Recompensa"
                width={720}
                height={720}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="w-full h-auto block"
              />
            </div>

            <p className="mt-2.5 text-[11px] sm:text-xs font-semibold text-sky-100 bg-sky-950/70 border border-sky-400/30 rounded-lg px-3 py-1.5 text-center max-w-[340px] sm:max-w-[430px]">
              Kit completo em PDF pronto para imprimir quantas vezes quiser
            </p>
          </div>

          {/* Bloco 3: Benefícios objetivos e CTA principal visível para iniciar checkout */}
          <div className="md:col-span-6 md:col-start-1 md:row-start-2 flex flex-col items-center md:items-start text-center md:text-left md:mt-5">
            <ul className="space-y-2 mb-5 text-xs sm:text-sm text-sky-50 font-medium max-w-md md:max-w-none text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Menos telas, mais foco no papel:</strong>{' '}
                  atividades ilustradas no estilo de blocos que as crianças adoram
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Progressivo do 1º ao 5º ano:</strong>{' '}
                  contas, probleminhas, frações, medidas e tabuada visual
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Combo Completo + 5 Bônus hoje:</strong>{' '}
                  de <span className="line-through text-sky-300">R$ 79,90</span> por apenas{' '}
                  <strong className="text-amber-300">{comboPriceLabel}</strong> no pagamento único
                </span>
              </li>
            </ul>

            <a
              href={activeComboUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-4 px-6 rounded-xl active:scale-[0.98] transition-colors duration-200 cursor-pointer uppercase tracking-wide animate-cta-pulse text-center"
            >
              <span>QUERO O COMBO COMPLETO POR {comboPriceLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>

            <p className="text-[11px] sm:text-xs text-sky-200/90 mt-2.5 font-medium">
              Pagamento único · Acesso imediato em PDF por e-mail · Garantia de 7 dias
            </p>

            <button
              type="button"
              onClick={scrollToDetails}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-200 hover:text-amber-300 transition-colors cursor-pointer mt-3.5 underline underline-offset-4 decoration-sky-400/40 hover:decoration-amber-300"
            >
              <span>Veja o material impresso por dentro e os 5 bônus</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* O Problema e a Transformação */}
      <section id="problema-metodo" className="below-fold-opt container mx-auto px-4 py-8 sm:py-14 scroll-mt-6">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center max-w-4xl mx-auto">
          <div className="bg-sky-50 p-3 sm:p-4 rounded-2xl border border-sky-100 max-w-[200px] sm:max-w-xs mx-auto md:max-w-none">
            <img
              src="/assets/images/produtoprincipal.webp"
              alt="Atividades de matemática no universo dos blocos"
              loading="lazy"
              decoding="async"
              className="rounded-xl shadow-md w-36 sm:w-48 mx-auto"
            />
          </div>
          <div className="space-y-3 sm:space-y-5 text-left">
            <h2 className="text-xl sm:text-3xl font-black text-sky-950 leading-tight">
              O PROBLEMA NÃO É O SEU FILHO, É O MÉTODO!
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Enquanto você tenta ensinar apenas com números abstratos, o cérebro dele pede estímulos visuais, lógica e desafios práticos.
            </p>
            <p className="text-sm sm:text-lg font-bold text-sky-900 border-l-4 border-amber-400 pl-3">
              A matemática fica fácil quando fala a língua dele.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Nosso material transforma a resistência em missão. Ele não está apenas fazendo contas: está vencendo fases no papel dentro de um universo visual que ele já ama.{' '}
              <span className="font-bold text-sky-800">
                Você percebe a confiança dele voltar logo nas primeiras páginas.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="below-fold-opt bg-gray-50 py-8 sm:py-14 border-y border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <h2 className="text-xl sm:text-3xl font-black text-sky-950 mb-4 sm:mb-6">
            VEJA QUEM JÁ VIU A MUDANÇA EM CASA:
          </h2>
          <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-3 sm:pb-5 snap-x snap-mandatory scrollbar-hide px-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <img
                key={i}
                src={`/assets/images/provasocial-${i}.webp`}
                alt={`Relato de mãe ou pai ${i}`}
                loading="lazy"
                decoding="async"
                className="snap-center h-[360px] xs:h-[400px] sm:h-[480px] rounded-2xl shadow-sm shrink-0 border border-gray-200/70"
              />
            ))}
          </div>
          <p className="text-center font-bold mt-2 text-sky-700 text-xs sm:text-sm animate-pulse">
            Arraste para o lado para ler os relatos →
          </p>
        </div>
      </section>

      {/* Bônus Exclusivos do Combo Completo */}
      <section className="below-fold-opt container mx-auto px-4 py-8 sm:py-14 bg-white text-sky-900 max-w-3xl">
        <h2 className="text-xl sm:text-3xl font-black mb-2 text-center">
          E NÃO PARA POR AÍ: VOCÊ LEVA + 5 BÔNUS NO COMBO COMPLETO!
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 text-center mb-5 sm:mb-8 font-medium">
          Todos os materiais abaixo vão em PDF para imprimir junto com as 360+ atividades principais:
        </p>

        <div className="space-y-3 sm:space-y-3.5">
          {[
            {
              img: '/assets/images/probleminhas.webp',
              title: 'BÔNUS 01: 100 PROBLEMINHAS MATEMÁTICOS (BLOCOS)',
              desc: 'Ajuda a criança a interpretar situações reais e desenvolver o raciocínio lógico brincando.',
            },
            {
              img: '/assets/images/tabuada.webp',
              title: 'BÔNUS 02: TABUADA VISUAL',
              desc: 'Chega de decorar sem entender: multiplicação ilustrada de forma intuitiva e fácil de lembrar.',
            },
            {
              img: '/assets/images/bonus1.webp',
              title: 'BÔNUS 03: MAPA DE PROGRESSO MATEMÁTICO',
              desc: 'A criança acompanha cada conquista no papel, mantendo a motivação contínua para avançar.',
            },
            {
              img: '/assets/images/bonus2.webp',
              title: 'BÔNUS 04: CARTÕES DE RECOMPENSA',
              desc: 'Reforce o esforço diário e pequenas metas com recompensas divertidas em família.',
            },
            {
              img: '/assets/images/bonus3.webp',
              title: 'BÔNUS 05: GUIA RÁPIDO PARA OS PAIS',
              desc: 'Orientações práticas para aplicar o material em casa com leveza, sem brigas nem atrito.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-sky-50/80 p-3 sm:p-3.5 rounded-xl border border-sky-100 flex gap-3 sm:gap-4 items-center"
            >
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-16 sm:w-20 rounded-lg shadow-sm shrink-0"
              />
              <div className="text-left flex-1 min-w-0">
                <h3 className="font-black text-sm sm:text-base leading-tight text-sky-950 mb-0.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug line-clamp-2">
                  {item.desc}
                </p>
                <span className="text-emerald-700 font-extrabold text-[10px] sm:text-xs uppercase inline-block mt-1">
                  GRÁTIS NO COMBO COMPLETO
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VSL / Demonstração Real em Vídeo: fundo preto + título amarelo de alta curiosidade */}
      <section
        id="material-por-dentro"
        className="below-fold-opt bg-black text-white py-11 sm:py-16 px-4 scroll-mt-6"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-amber-400 uppercase tracking-wide leading-tight max-w-2xl mx-auto mb-3 text-balance">
            VEJA POR DENTRO O MATERIAL MAIS VENDIDO DOS ÚLTIMOS DIAS
          </h2>
          <p className="text-sm sm:text-lg text-white/95 font-medium max-w-xl mx-auto mb-7 sm:mb-8 leading-relaxed">
            Aperte o play e descubra o que você recebe — e por que tantas crianças estão trocando as telas por essas folhas impressas
          </p>

          <div className="flex flex-col items-center">
            <VslPlayer checkoutUrl={activeComboUrl} priceLabel={comboPriceLabel} />

            <a
              href={activeComboUrl}
              className="mt-7 w-full max-w-md inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-4 px-6 rounded-xl shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-colors duration-200 cursor-pointer uppercase tracking-wide text-center"
            >
              <span>QUERO O COMBO COMPLETO POR {comboPriceLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>
            <p className="text-[11px] sm:text-xs text-neutral-300 mt-2.5 font-medium">
              Acesso imediato em PDF por e-mail · Garantia incondicional de 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* Oferta com Hierarquia Clara: Destaque Total no Combo Completo (R$ 37,90) e Básico Discreto */}
      <section id="ofertas" className="below-fold-opt container mx-auto px-4 py-10 sm:py-16 scroll-mt-6 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-sky-950 mb-2 sm:mb-3">
            O PREÇO DE UM LANCHE PARA TRANSFORMAR A ROTINA DE ESTUDOS DELE.
          </h2>
          <p className="text-sm sm:text-base font-bold text-red-600">
            Oferta promocional por tempo limitado — acesso imediato no seu e-mail.
          </p>
        </div>

        {/* CARD PRINCIPAL EM DESTAQUE: COMBO COMPLETO */}
        <div
          id="combo-completo"
          className={`bg-sky-950 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border-2 relative scroll-mt-10 transition-all duration-300 ${
            hasDiscountApplied
              ? 'border-emerald-400 ring-4 ring-emerald-400/30 shadow-emerald-500/20'
              : 'border-amber-400'
          }`}
        >
          <div
            className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md whitespace-nowrap ${
              hasDiscountApplied
                ? 'bg-emerald-400 text-sky-950'
                : 'bg-amber-400 text-sky-950'
            }`}
          >
            {hasDiscountApplied ? 'PRÊMIO DA ROLETA APLICADO!' : '🔥 MAIS VENDIDO · MELHOR CUSTO-BENEFÍCIO'}
          </div>

          <div className="grid sm:grid-cols-12 gap-5 sm:gap-6 items-center mt-2">
            <div className="sm:col-span-5 text-center">
              <img
                src="/assets/images/mockup.webp"
                alt="Combo Completo Matemática no Mundo dos Blocos"
                loading="lazy"
                decoding="async"
                className="rounded-xl w-36 sm:w-44 mx-auto shadow-xl border border-sky-800"
              />
            </div>

            <div className="sm:col-span-7 text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white text-center sm:text-left">
                COMBO COMPLETO
              </h3>
              <p className="font-bold text-amber-300 mb-4 uppercase tracking-wide text-xs text-center sm:text-left">
                {hasDiscountApplied
                  ? 'DESCONTO ESPECIAL DA ROLETA PREMIADA'
                  : 'KIT COMPLETO + TODOS OS 5 BÔNUS EXCLUSIVOS'}
              </p>

              <ul className="space-y-2 text-white font-medium text-xs sm:text-sm">
                {[
                  '+360 Atividades de Matemática (1º ao 5º ano em PDF)',
                  'Bônus 01: 100 Probleminhas Matemáticos (Blocos)',
                  'Bônus 02: Tabuada Visual',
                  'Bônus 03: Mapa de Progresso Matemático',
                  'Bônus 04: Cartões de Recompensa',
                  'Bônus 05: Guia Rápido para os Pais',
                  'Acesso vitalício + envio imediato por e-mail',
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        hasDiscountApplied ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sky-800/80 text-center">
            <div className="bg-white/10 p-4 rounded-xl border border-white/10 mb-4">
              {hasDiscountApplied ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs sm:text-sm text-sky-300 line-through">de R$ 79,90</p>
                    <p className="text-xs sm:text-sm text-sky-300 line-through font-semibold">
                      por R$ 37,90
                    </p>
                  </div>
                  <p className="text-4xl sm:text-5xl font-black text-emerald-300 my-0.5">
                    R$ 35,90
                  </p>
                  <p className="text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider">
                    Pagamento único · Acesso imediato por e-mail
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-sky-200 line-through">de R$ 79,90</p>
                  <p className="text-4xl sm:text-5xl font-black text-white my-0.5">
                    R$ 37,90
                  </p>
                  <p className="text-[11px] sm:text-xs text-sky-200 font-bold uppercase tracking-wider">
                    Pagamento único (economize mais de 50%) · Acesso imediato por e-mail
                  </p>
                </>
              )}
            </div>

            <a
              href={activeComboUrl}
              className={`w-full font-black text-base sm:text-lg py-4 px-5 rounded-xl shadow-lg active:scale-95 transition-all duration-200 cursor-pointer uppercase tracking-wide flex items-center justify-center gap-2 text-center ${
                hasDiscountApplied
                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-sky-950 shadow-emerald-400/30'
                  : 'bg-amber-400 hover:bg-amber-300 text-sky-950 shadow-amber-400/30'
              }`}
            >
              <span>QUERO O COMBO COMPLETO POR {comboPriceLabel}</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </a>

            <p className="text-center text-sky-200 mt-3 text-[11px] sm:text-xs font-semibold">
              Compra 100% segura (PIX ou Cartão) · Envio imediato por e-mail · Garantia de 7 dias
            </p>
          </div>
        </div>

        {/* OPÇÃO SECUNDÁRIA DISCRETA: PLANO BÁSICO */}
        <div className="mt-6 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-2xl mx-auto">
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Opção básica (sem os 5 bônus)
            </p>
            <h3 className="text-base font-black text-gray-900">
              Plano Básico — Apenas as 360+ Atividades em PDF
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              1º ao 5º ano · Pronto para imprimir · Pagamento único de{' '}
              <strong className="text-gray-900">R$ 29,90</strong>
            </p>
          </div>

          <button
            type="button"
            onPointerEnter={() => {
              void preloadPrizeWheel();
            }}
            onTouchStart={() => {
              void preloadPrizeWheel();
            }}
            onClick={() => setIsDiscountModalOpen(true)}
            className="sm:shrink-0 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl active:scale-95 transition-colors cursor-pointer uppercase tracking-wide"
          >
            Quero o Básico por R$ 29,90
          </button>
        </div>
      </section>

      {/* Garantia de 7 Dias */}
      <section className="below-fold-opt bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 text-white py-8 sm:py-14 px-4 border-t border-sky-800/40 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="bg-gradient-to-br from-sky-900/60 to-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-10 border-2 border-amber-400/40 shadow-[0_0_40px_rgba(2,132,199,0.2)] text-center">
            {/* Selo de Garantia */}
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-500 p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-sky-950 flex flex-col items-center justify-center border-2 border-amber-300/40 text-center p-2">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 mb-0.5" />
                  <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                    7 DIAS
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-200 tracking-wider uppercase mt-0.5">
                    GARANTIA
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-sky-950 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-md">
                100% INCONDICIONAL
              </div>
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight px-1">
              VOCÊ TEM{' '}
              <span className="text-amber-400 underline decoration-amber-400/60 decoration-2 sm:decoration-4">
                7 DIAS DE TESTE
              </span>{' '}
              COM RISCO ZERO
            </h2>
            <p className="text-xs sm:text-base text-sky-100 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1">
              O risco é <strong className="text-white font-black">100% nosso</strong>. Se o seu filho não se interessar ou você achar que o material não facilitou a rotina, devolvemos seu dinheiro sem complicações.
            </p>

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
                  Acesse por e-mail, imprima as primeiras páginas e entregue para seu filho brincar e resolver.
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
                  Veja a resistência diminuir e a curiosidade despertar com os desafios visuais.
                </p>
              </div>

              <div className="bg-sky-950/70 p-4 rounded-xl border border-sky-800/60 flex flex-col justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-sm mb-2 border border-emerald-400/30">
                  3
                </div>
                <h3 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Reembolso Simples
                </h3>
                <p className="text-xs text-sky-200/80 leading-relaxed">
                  Se não gostar por qualquer razão dentro de 7 dias, solicite o reembolso sem burocracia.
                </p>
              </div>
            </div>

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

            <div className="mt-5 pt-4 border-t border-sky-800/60">
              <a
                href={activeComboUrl}
                className="w-full max-w-md mx-auto bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-4 px-5 rounded-xl shadow-md shadow-amber-400/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide text-center"
              >
                <span>QUERO O COMBO COMPLETO POR {comboPriceLabel}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-[11px] sm:text-xs text-sky-200/80 mt-2 font-medium text-center">
                Acesso imediato por e-mail · Garantia total de 7 dias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dúvidas Frequentes (FAQ) */}
      <section className="below-fold-opt bg-sky-950 text-white py-8 sm:py-14 px-4 border-t border-sky-900/40">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-xl sm:text-3xl font-black mb-5 sm:mb-8 text-center text-white">
            DÚVIDAS FREQUENTES
          </h2>
          <div className="space-y-3 text-left text-sky-950">
            {[
              {
                q: 'Como recebo o material?',
                a: 'O acesso é enviado automaticamente para o seu e-mail logo após a confirmação do pagamento.',
              },
              {
                q: 'O material é físico ou digital?',
                a: 'O material é 100% digital em formato PDF de alta qualidade para você baixar e imprimir quando e quantas vezes quiser.',
              },
              {
                q: 'Para quais idades é indicado?',
                a: 'O conteúdo foi planejado para crianças que estão cursando do 1º ao 5º ano do Ensino Fundamental (aproximadamente de 6 a 11 anos).',
              },
              {
                q: 'Posso pedir reembolso se não gostar?',
                a: 'Sim, você tem 7 dias de garantia incondicional para avaliar o material e, se não gostar, solicitar o reembolso integral.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white p-4 sm:p-5 rounded-xl border border-sky-800 shadow-md group"
              >
                <summary className="font-black text-sm sm:text-base cursor-pointer list-none flex justify-between items-center text-sky-950">
                  <span className="pr-2">{faq.q}</span>
                  <span className="text-sky-600 font-bold text-xl group-open:rotate-45 transition-transform duration-200 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-gray-700 mt-2.5 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé com Aviso Legal */}
      <footer className="below-fold-opt container mx-auto px-4 py-8 text-center text-gray-500 text-[11px] sm:text-xs mt-4 sm:mt-8 border-t border-gray-100">
        <p className="mb-2 font-bold">Copyright © 2026 | Todos os direitos reservados.</p>
        <p className="max-w-3xl mx-auto leading-relaxed">
          Material educacional independente. Este site não é afiliado ou endossado pelo Facebook™, Instagram™, Google™, Mojang Synergies AB ou Microsoft™. As referências estéticas são utilizadas exclusivamente para fins de engajamento pedagógico. O material é um recurso complementar e não substitui o acompanhamento escolar ou profissional quando necessário.
        </p>
      </footer>
    </div>
  );
}
