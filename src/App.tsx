import { Suspense, lazy, useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Lock,
  Mail,
  Printer,
  RotateCcw,
  ShieldCheck,
  Smartphone,
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

const BONUSES = [
  {
    img: '/assets/images/probleminhas.webp',
    title: '100 Probleminhas Matemáticos (Blocos)',
    desc: 'Situações práticas para a criança interpretar enunciados e desenvolver o raciocínio lógico.',
  },
  {
    img: '/assets/images/tabuada.webp',
    title: 'Tabuada Visual',
    desc: 'Multiplicação ilustrada com blocos para entender a lógica das contas sem apenas decorar.',
  },
  {
    img: '/assets/images/bonus1.webp',
    title: 'Mapa de Progresso Matemático',
    desc: 'Quadro visual no papel para a criança acompanhar cada etapa concluída.',
  },
  {
    img: '/assets/images/bonus2.webp',
    title: 'Cartões de Recompensa',
    desc: 'Pequenos incentivos para comemorar metas diárias de estudo em família.',
  },
  {
    img: '/assets/images/bonus3.webp',
    title: 'Guia Rápido para os Pais',
    desc: 'Orientações simples para aplicar as atividades em casa com leveza, sem atrito.',
  },
];

export default function App() {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [hasDiscountApplied, setHasDiscountApplied] = useState(false);
  const [mountDeferredUi, setMountDeferredUi] = useState(false);

  const basicCheckoutUrl = decorateCheckoutUrl(CHECKOUT_BASIC_URL);
  const discountCheckoutUrl = decorateCheckoutUrl(CHECKOUT_DISCOUNT_URL);
  const comboCheckoutUrl = decorateCheckoutUrl(
    hasDiscountApplied ? CHECKOUT_DISCOUNT_URL : CHECKOUT_COMBO_URL
  );
  const comboPriceLabel = hasDiscountApplied ? 'R$ 35,90' : 'R$ 37,90';

  useEffect(() => {
    const timer = setTimeout(() => setMountDeferredUi(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToOffers = () => {
    document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleClaimPrize = () => {
    setHasDiscountApplied(true);
  };

  const handleProceedBasic = () => {
    // Navegação natural pelo <a> preservando UTMs e evento unificado da Utmify
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative">
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
            prizeCheckoutUrl={discountCheckoutUrl}
            basicCheckoutUrl={basicCheckoutUrl}
          />
        </Suspense>
      )}
      {/* 1. PRIMEIRA DOBRA: Promessa clara + Vídeo em posição de destaque + Próximo passo */}
      <header className="bg-gradient-to-b from-sky-950 via-sky-900 to-sky-800 text-white px-4 pt-6 pb-9 sm:pt-11 sm:pb-14">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-12 md:gap-x-10 md:items-center">
          {/* Apresentação inicial direta */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-1 text-center md:text-left">
            <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide mb-2">
              Matemática no Mundo dos Blocos · 1º ao 5º ano
            </p>

            <h1 className="text-[1.6rem] sm:text-4xl lg:text-[2.55rem] font-black leading-[1.15] mb-3 tracking-tight text-white text-balance">
              Atividades de matemática que tiram seu filho das telas e ajudam a estudar em casa
            </h1>

            <p className="text-sm sm:text-base font-medium text-sky-100 leading-relaxed max-w-xl mx-auto md:mx-0">
              Mais de <strong className="text-white">360 atividades práticas</strong>, criadas com estética de blocos para crianças de 6 a 11 anos aprenderem no papel com prazer.
            </p>
          </div>

          {/* Vídeo de demonstração real em destaque na primeira dobra */}
          <div className="md:col-span-5 md:col-start-8 md:row-start-1 md:row-span-2 flex flex-col items-center my-5 md:my-0">
            <VslPlayer checkoutUrl={comboCheckoutUrl} ctaLabel="QUERO O COMBO COMPLETO" />
            <p className="mt-2.5 text-xs text-sky-100 font-medium text-center max-w-[260px]">
              Veja o material por dentro
            </p>
          </div>

          {/* Resumo objetivo e CTA principal */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-2 flex flex-col items-center md:items-start text-center md:text-left md:mt-5">
            <ul className="space-y-2 mb-5 text-xs sm:text-sm text-sky-50 font-medium max-w-md md:max-w-none text-left">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Indicado para alunos do 1º ao 5º ano do Ensino Fundamental</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Envio automático por e-mail para baixar e imprimir quando quiser</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Planos a partir de R$ 29,90 no pagamento único, com garantia de 7 dias</span>
              </li>
            </ul>

            <a
              href={comboCheckoutUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-4 px-6 rounded-xl shadow-lg shadow-amber-400/25 active:scale-[0.98] transition-colors duration-200 cursor-pointer uppercase tracking-wide text-center"
            >
              <span>QUERO O COMBO COMPLETO</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>

            <button
              type="button"
              onClick={scrollToOffers}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-200 hover:text-amber-300 transition-colors cursor-pointer mt-3.5 underline underline-offset-4 decoration-sky-400/40 hover:decoration-amber-300"
            >
              <span>Comparar Plano Básico (R$ 29,90) e Combo Completo (R$ 37,90)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. APRESENTAÇÃO RÁPIDA DO MATERIAL E BENEFÍCIOS */}
      <section className="below-fold-opt container mx-auto px-4 py-9 sm:py-14 max-w-4xl">
        <div className="grid md:grid-cols-12 gap-6 sm:gap-10 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="bg-sky-50 p-3 sm:p-4 rounded-2xl border border-sky-100 max-w-[220px] sm:max-w-[260px]">
              <img
                src="/assets/images/produtoprincipal.webp"
                alt="Capa do caderno Matemática no Mundo dos Blocos"
                width={340}
                height={480}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="rounded-xl shadow-md w-full h-auto"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-4 text-left">
            <h2 className="text-xl sm:text-3xl font-black text-sky-950 leading-tight">
              Por que o material ajuda na rotina de estudos em casa
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Muitas crianças travam na matemática porque os exercícios comuns parecem repetitivos e distantes do que elas gostam. Quando as contas ganham apoio visual e temática de blocos, a hora da tarefa fica mais leve.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-bold text-sky-950 text-sm mb-1">
                  <Smartphone className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>Longe das telas</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Atividades feitas para imprimir e resolver no papel com lápis e atenção.
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-bold text-sky-950 text-sm mb-1">
                  <Printer className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>Fácil de usar</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Você baixa no celular ou computador e imprime só as folhas da série do seu filho.
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-bold text-sky-950 text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1º ao 5º ano</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Conteúdo progressivo com contas, probleminhas, tabuada, medidas e geometria.
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-bold text-sky-950 text-sm mb-1">
                  <Mail className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>Acesso imediato</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Após a confirmação do pagamento, os PDFs chegam automaticamente no seu e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEMONSTRAÇÃO DO QUE O COMPRADOR RECEBE */}
      <section className="below-fold-opt bg-sky-50/70 py-9 sm:py-14 px-4 border-y border-sky-100">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
            <h2 className="text-xl sm:text-3xl font-black text-sky-950 mb-2">
              O que você recebe ao adquirir o material
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              Veja os exemplos das páginas reais de atividades e os materiais extras incluídos no Combo Completo.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="md:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-sky-200 bg-white">
                <img
                  src="/assets/images/kit-completo-hero.webp"
                  alt="Páginas reais do caderno Matemática no Mundo dos Blocos e materiais extras do Combo Completo"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={600}
                  height={600}
                  className="w-full h-auto block"
                />
              </div>
            </div>

            <div className="md:col-span-6 space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700 mb-0.5">
                  Incluído nos dois planos
                </p>
                <h3 className="font-black text-sm sm:text-base text-sky-950">
                  +360 Atividades de Matemática (1º ao 5º ano)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Exercícios ilustrados sobre números, adição, subtração, multiplicação, divisão, medidas, dinheiro, sólidos geométricos e problemas.
                </p>
              </div>

              <div className="pt-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-2">
                  + 5 bônus exclusivos do Combo Completo:
                </p>
                <div className="space-y-2.5">
                  {BONUSES.map((bonus) => (
                    <div
                      key={bonus.title}
                      className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center gap-3"
                    >
                      <img
                        src={bonus.img}
                        alt={bonus.title}
                        width={180}
                        height={254}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="w-12 h-14 object-cover rounded-lg shrink-0 border border-gray-100"
                      />
                      <div className="text-left min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-sky-950 leading-snug">
                          {bonus.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-600 leading-snug mt-0.5">
                          {bonus.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMENTÁRIOS E DEPOIMENTOS (antes das ofertas) */}
      <section className="below-fold-opt bg-white py-9 sm:py-14 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <h2 className="text-xl sm:text-3xl font-black text-sky-950 mb-2">
            Relatos de quem já baixou e imprimiu em casa
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-7">
            Comentários reais enviados por famílias que estão usando o material com seus filhos.
          </p>

          <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-3 sm:pb-4 snap-x snap-mandatory scrollbar-hide px-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <img
                key={i}
                src={`/assets/images/provasocial-${i}.webp`}
                alt={`Relato de família sobre o material ${i}`}
                width={428}
                height={760}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="snap-center h-[350px] sm:h-[440px] w-auto rounded-2xl shadow-sm shrink-0 border border-gray-200"
              />
            ))}
          </div>
          <p className="text-center font-semibold mt-2 text-sky-700 text-xs sm:text-sm">
            Deslize para o lado para ver mais relatos →
          </p>
        </div>
      </section>

      {/* 5. OFERTAS: Plano Básico (1º) + Combo Completo (2º em destaque) */}
      <section id="ofertas" className="below-fold-opt container mx-auto px-4 py-10 sm:py-16 scroll-mt-6 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <h2 className="text-2xl sm:text-4xl font-black text-sky-950 mb-2">
            Escolha como deseja receber o material
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Pagamento único, sem mensalidades, com envio imediato em PDF por e-mail.
          </p>
        </div>

        <div className="space-y-7">
          {/* PRIMEIRA OFERTA: PLANO BÁSICO (R$ 29,90) — Abre Roleta Premiada */}
          <div
            id="plano-basico"
            className="bg-white p-5 sm:p-7 rounded-2xl border-2 border-gray-200 shadow-sm max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4 mb-4">
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Opção 1 · Essencial
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-950">
                  Plano Básico
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Ideal para quem quer começar com as atividades principais do 1º ao 5º ano.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-3xl sm:text-4xl font-black text-gray-950 leading-none">
                  R$ 29,90
                </p>
                <p className="text-[11px] font-semibold text-gray-500 mt-1">
                  Pagamento único
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-700 font-medium mb-5 text-left">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>+360 atividades de matemática em PDF (1º ao 5º ano)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pronto para baixar e imprimir quantas vezes quiser</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Envio imediato por e-mail e garantia de 7 dias</span>
              </li>
            </ul>

            <button
              type="button"
              onPointerEnter={() => {
                void preloadPrizeWheel();
              }}
              onTouchStart={() => {
                void preloadPrizeWheel();
              }}
              onClick={() => setIsDiscountModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-sky-900 hover:bg-sky-800 text-white font-black text-sm sm:text-base py-3.5 px-5 rounded-xl active:scale-[0.98] transition-colors cursor-pointer uppercase tracking-wide text-center"
            >
              <span>QUERO O PLANO BÁSICO</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <p className="text-center text-gray-500 mt-2.5 text-[11px] font-medium">
              Não inclui os 5 materiais bônus · Compra segura via PIX ou cartão
            </p>
          </div>

          {/* SEGUNDA OFERTA: COMBO COMPLETO (R$ 37,90 ou R$ 35,90 na Roleta) — Protagonista */}
          <div
            id="combo-completo"
            className={`bg-sky-950 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border-2 relative scroll-mt-10 max-w-3xl mx-auto transition-all duration-300 ${
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
              {hasDiscountApplied ? 'PRÊMIO DA ROLETA APLICADO!' : 'MAIS COMPLETO · MELHOR CUSTO-BENEFÍCIO'}
            </div>

            <div className="grid sm:grid-cols-12 gap-5 sm:gap-7 items-center mt-3">
              <div className="sm:col-span-5 text-center">
                <img
                  src="/assets/images/mockup.webp"
                  alt="Combo Completo Matemática no Mundo dos Blocos com todos os bônus"
                  width={320}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="rounded-xl w-40 sm:w-48 h-auto mx-auto shadow-xl border border-sky-800"
                />
                <p className="text-[11px] font-bold text-amber-300 mt-2.5">
                  {hasDiscountApplied
                    ? 'Desconto especial da roleta aplicado'
                    : 'Por apenas R$ 8,00 a mais que o Plano Básico'}
                </p>
              </div>

              <div className="sm:col-span-7 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Opção 2 · Recomendada
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5 mb-3">
                  Combo Completo
                </h3>

                <ul className="space-y-2 text-white font-medium text-xs sm:text-sm">
                  {[
                    '+360 atividades de matemática em PDF (1º ao 5º ano)',
                    'Bônus 1: 100 Probleminhas Matemáticos (Blocos)',
                    'Bônus 2: Tabuada Visual',
                    'Bônus 3: Mapa de Progresso Matemático',
                    'Bônus 4: Cartões de Recompensa',
                    'Bônus 5: Guia Rápido para os Pais',
                    'Acesso vitalício por e-mail + garantia de 7 dias',
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
              <div className="bg-white/10 p-4 rounded-xl border border-white/15 mb-4">
                {hasDiscountApplied ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-xs sm:text-sm text-sky-300 line-through">de R$ 79,90</p>
                      <p className="text-xs sm:text-sm text-sky-300 line-through font-semibold">
                        por R$ 37,90
                      </p>
                    </div>
                    <p className="text-4xl sm:text-5xl font-black text-emerald-300 my-0.5">
                      {comboPriceLabel}
                    </p>
                    <p className="text-[11px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider">
                      Pagamento único · Prêmio liberado na roleta
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-sky-200 line-through">de R$ 79,90</p>
                    <p className="text-4xl sm:text-5xl font-black text-white my-0.5">
                      {comboPriceLabel}
                    </p>
                    <p className="text-[11px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">
                      Pagamento único · Leve o kit completo + 5 bônus por apenas R$ 8,00 a mais
                    </p>
                  </>
                )}
              </div>

              <a
                href={comboCheckoutUrl}
                className={`w-full font-black text-base sm:text-lg py-4 px-5 rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer uppercase tracking-wide flex items-center justify-center gap-2 text-center ${
                  hasDiscountApplied
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-sky-950 shadow-emerald-400/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-sky-950 shadow-amber-400/30 animate-cta-pulse'
                }`}
              >
                <span>QUERO O COMBO COMPLETO</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </a>

              <p className="text-center text-sky-200 mt-3 text-[11px] sm:text-xs font-medium">
                Compra segura (PIX ou Cartão) · Envio imediato para o seu e-mail · Garantia de 7 dias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GARANTIA E INFORMAÇÕES DE SEGURANÇA */}
      <section className="below-fold-opt bg-sky-950 text-white py-9 sm:py-14 px-4 border-t border-sky-900">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-sky-900/50 rounded-2xl sm:rounded-3xl p-5 sm:p-9 border border-amber-400/35 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/50 text-amber-400 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white mb-2">
              Garantia incondicional de 7 dias
            </h2>
            <p className="text-xs sm:text-base text-sky-100 max-w-xl mx-auto mb-6 leading-relaxed">
              Você pode baixar o material, imprimir as primeiras atividades e testar com o seu filho sem pressa. Se achar que não serviu para vocês, basta pedir o reembolso em até 7 dias.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 text-left mb-6">
              <div className="bg-sky-950/70 p-3.5 rounded-xl border border-sky-800">
                <p className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1. Receba por e-mail</span>
                </p>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Assim que o pagamento é aprovado, o link para baixar os PDFs chega na hora.
                </p>
              </div>

              <div className="bg-sky-950/70 p-3.5 rounded-xl border border-sky-800">
                <p className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2. Teste em casa</span>
                </p>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Imprima as páginas da série do seu filho e observe o interesse dele nas atividades.
                </p>
              </div>

              <div className="bg-sky-950/70 p-3.5 rounded-xl border border-sky-800">
                <p className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-sky-300 shrink-0" />
                  <span>3. Risco zero</span>
                </p>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Não ficou satisfeito? Devolvemos 100% do valor dentro do prazo de 7 dias.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-sky-800/70 flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs text-sky-200 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Pagamento criptografado
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Código de Defesa do Consumidor
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-300" /> Entrega automática por e-mail
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dúvidas Frequentes */}
      <section className="below-fold-opt bg-gray-50 py-9 sm:py-14 px-4 border-t border-gray-200">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-xl sm:text-3xl font-black mb-5 sm:mb-7 text-center text-sky-950">
            Dúvidas frequentes
          </h2>
          <div className="space-y-3 text-left">
            {[
              {
                q: 'Como recebo o material após a compra?',
                a: 'O acesso é enviado automaticamente para o seu e-mail logo após a confirmação do pagamento (no PIX e no cartão costuma liberar em poucos instantes).',
              },
              {
                q: 'O material é físico ou digital?',
                a: 'É 100% digital em formato PDF de alta qualidade. Você baixa no celular ou computador e imprime em casa ou na papelaria quantas vezes precisar.',
              },
              {
                q: 'Para qual idade e ano escolar é indicado?',
                a: 'Para crianças do 1º ao 5º ano do Ensino Fundamental (aproximadamente de 6 a 11 anos), com atividades organizadas por nível.',
              },
              {
                q: 'Qual a diferença do Plano Básico para o Combo Completo?',
                a: 'O Plano Básico (R$ 29,90) entrega as +360 atividades principais. O Combo Completo (R$ 37,90) inclui tudo do Básico mais os 5 bônus: 100 Probleminhas Matemáticos, Tabuada Visual, Mapa de Progresso, Cartões de Recompensa e Guia Rápido para os Pais.',
              },
              {
                q: 'E se meu filho não gostar do material?',
                a: 'Você tem 7 dias de garantia incondicional para testar com calma e pedir reembolso integral se não atender às suas expectativas.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs group"
              >
                <summary className="font-bold text-sm sm:text-base cursor-pointer list-none flex justify-between items-center text-sky-950">
                  <span className="pr-2">{faq.q}</span>
                  <span className="text-sky-700 font-bold text-xl group-open:rotate-45 transition-transform duration-200 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-gray-700 mt-2.5 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CHAMADA FINAL PARA COMPRA */}
      <section className="below-fold-opt bg-white py-9 sm:py-14 px-4 border-t border-gray-200 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-xl sm:text-3xl font-black text-sky-950 mb-2">
            Pronto para testar em casa com o seu filho?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Garanta hoje o Combo Completo com todos os 5 bônus por {comboPriceLabel} ou escolha o Plano Básico por R$ 29,90.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={comboCheckoutUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-sky-950 font-black text-sm sm:text-base py-4 px-6 rounded-xl shadow-md active:scale-[0.98] transition-colors uppercase tracking-wide"
            >
              <span>QUERO O COMBO COMPLETO</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>
            <button
              type="button"
              onPointerEnter={() => {
                void preloadPrizeWheel();
              }}
              onTouchStart={() => {
                void preloadPrizeWheel();
              }}
              onClick={() => setIsDiscountModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm py-4 px-5 rounded-xl border border-gray-300 active:scale-[0.98] transition-colors uppercase tracking-wide cursor-pointer"
            >
              <span>QUERO O PLANO BÁSICO</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rodapé com Aviso Legal */}
      <footer className="below-fold-opt container mx-auto px-4 py-8 text-center text-gray-500 text-[11px] sm:text-xs border-t border-gray-100">
        <p className="mb-2 font-bold">Copyright © 2026 | Todos os direitos reservados.</p>
        <p className="max-w-3xl mx-auto leading-relaxed">
          Material educacional independente. Este site não é afiliado ou endossado pelo Facebook™, Instagram™, Google™, Mojang Synergies AB ou Microsoft™. As referências estéticas são utilizadas exclusivamente para fins de engajamento pedagógico. O material é um recurso complementar e não substitui o acompanhamento escolar ou profissional quando necessário.
        </p>
      </footer>
    </div>
  );
}
