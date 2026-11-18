import { useEffect, useRef, useState } from 'react';
import { X, Gift, ArrowRight, Trophy, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface PrizeWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimPrize: () => void;
  onProceedBasic: () => void;
  prizeCheckoutUrl: string;
  basicCheckoutUrl: string;
}

interface WheelSegment {
  label: string;
  sublabel?: string;
  bg: string;
  text: string;
  isWinner?: boolean;
}

const SEGMENTS: WheelSegment[] = [
  { label: 'QUASE LÁ', sublabel: 'Tente de novo', bg: '#0c4a6e', text: '#e0f2fe' },
  { label: '5% OFF', sublabel: 'Desconto', bg: '#10b981', text: '#052e16' },
  { label: 'PASSOU', sublabel: 'Por pouco', bg: '#1e293b', text: '#cbd5e1' },
  { label: 'COMBO', sublabel: 'R$ 35,90', bg: '#fbbf24', text: '#082f49', isWinner: true },
  { label: 'BÔNUS', sublabel: 'Surpresa', bg: '#075985', text: '#ffffff' },
  { label: '10% OFF', sublabel: 'Cupom', bg: '#0284c7', text: '#ffffff' },
];

const SLICE_COUNT = SEGMENTS.length;
const SLICE_ANGLE = 360 / SLICE_COUNT; // 60°

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createWedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function PrizeWheelModal({
  isOpen,
  onClose,
  onClaimPrize,
  onProceedBasic,
  prizeCheckoutUrl,
  basicCheckoutUrl,
}: PrizeWheelModalProps) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'won'>('idle');
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resetar estado ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setRotation(0);
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    };
  }, [isOpen]);

  // Explosão de confetes em Canvas 2D quando ganhar
  useEffect(() => {
    if (!isOpen || phase !== 'won') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#fbbf24', '#10b981', '#38bdf8', '#f43f5e', '#ffffff', '#a855f7'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      color: string;
      rot: number;
      vRot: number;
      tilt: number;
      vTilt: number;
      alpha: number;
    }

    const particles: Particle[] = [];

    const spawnBurst = (originX: number, originY: number, count: number, spreadSpeed: number) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.45;
        const speed = (0.35 + Math.random() * 0.75) * spreadSpeed;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          w: 7 + Math.random() * 7,
          h: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          tilt: Math.random() * Math.PI * 2,
          vTilt: 0.08 + Math.random() * 0.12,
          alpha: 1,
        });
      }
    };

    // 3 rajadas comemorativas (centro + laterais)
    spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.48, 110, 17);
    const t1 = setTimeout(() => spawnBurst(window.innerWidth * 0.2, window.innerHeight * 0.65, 65, 16), 220);
    const t2 = setTimeout(() => spawnBurst(window.innerWidth * 0.8, window.innerHeight * 0.65, 65, 16), 380);

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.34; // gravidade
        p.vx *= 0.985; // arrasto do ar
        p.rot += p.vRot;
        p.tilt += p.vTilt;

        if (p.y > canvas.height + 30) {
          particles.splice(i, 1);
          continue;
        }

        if (p.y > canvas.height * 0.78) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (particles.length > 0) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', resize);
    };
  }, [isOpen, phase]);

  const handleSpin = () => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    // Inicialmente (0°), a fatia 0 ("QUASE LÁ") está no topo sob o ponteiro.
    // A fatia premiada 3 ("COMBO R$ 35,90") está a 180° (embaixo).
    // Girando 6 voltas completas + 180° (+ ajuste mínimo de ±5°), ela para exatamente sob o ponteiro!
    const extraTurns = 6 * 360 + 180;
    const slightOffset = Math.round((Math.random() - 0.5) * 8);
    setRotation(extraTurns + slightOffset);

    spinTimerRef.current = setTimeout(() => {
      setPhase('won');
    }, 4300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-sky-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Canvas de Confetes acima do modal sem bloquear cliques */}
      {phase === 'won' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[60] pointer-events-none"
        />
      )}

      {/* Container da Roleta Premiada */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden z-10 my-auto">
        {/* Faixa Superior */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-sky-950 py-3 px-10 text-center text-white relative border-b-2 border-amber-400">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
            <Gift className="w-4 h-4 shrink-0" />
            <span>
              {phase === 'won'
                ? 'PARABÉNS! PRESENTE DESBLOQUEADO!'
                : 'GIRE E GANHE UM PRESENTE!'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar roleta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 text-center">
          {phase !== 'won' ? (
            <>
              <h3 className="text-lg sm:text-xl font-black text-sky-950 leading-tight mb-1">
                Antes de fechar o Básico, tente a sorte na Roleta Premiada!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-4">
                Você tem <strong className="text-sky-900">1 giro grátis</strong> para liberar um presente especial agora.
              </p>

              {/* Área da Roleta */}
              <div className="relative w-[264px] h-[264px] sm:w-[292px] sm:h-[292px] mx-auto mb-5 select-none">
                {/* Ponteiro Superior */}
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] ${
                    phase === 'spinning' ? 'animate-bounce' : ''
                  }`}
                >
                  <svg width="34" height="36" viewBox="0 0 34 36" fill="none">
                    <path
                      d="M17 35L3 8C1.5 5 3.7 1.5 7 1.5H27C30.3 1.5 32.5 5 31 8L17 35Z"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                {/* Aro externo dourado com pinos */}
                <div className="w-full h-full rounded-full p-2.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_12px_32px_rgba(12,74,110,0.35)] relative">
                  {/* Pinos decorativos na borda */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const deg = idx * 30;
                    return (
                      <span
                        key={idx}
                        style={{
                          transform: `rotate(${deg}deg) translateY(-125px)`,
                        }}
                        className="hidden sm:block absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white shadow-sm z-10 pointer-events-none"
                      />
                    );
                  })}

                  {/* Disco Giratório SVG */}
                  <div
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition:
                        phase === 'spinning'
                          ? 'transform 4200ms cubic-bezier(0.12, 0.85, 0.18, 1)'
                          : 'none',
                    }}
                    className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-sky-950"
                  >
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                      {SEGMENTS.map((seg, i) => {
                        // Fatia 0 centrada em -90° (-120° até -60°)
                        const startDeg = -120 + i * SLICE_ANGLE;
                        const endDeg = startDeg + SLICE_ANGLE;
                        const centerDeg = startDeg + SLICE_ANGLE / 2;
                        const pathData = createWedgePath(150, 150, 148, startDeg, endDeg);

                        return (
                          <g key={i}>
                            <path
                              d={pathData}
                              fill={seg.bg}
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <g transform={`translate(150, 150) rotate(${centerDeg + 90})`}>
                              <text
                                x="0"
                                y="-98"
                                textAnchor="middle"
                                fill={seg.text}
                                fontSize={seg.isWinner ? '13.5' : '12'}
                                fontWeight="900"
                                letterSpacing="0.5"
                              >
                                {seg.label}
                              </text>
                              {seg.sublabel && (
                                <text
                                  x="0"
                                  y="-81"
                                  textAnchor="middle"
                                  fill={seg.text}
                                  fontSize={seg.isWinner ? '14' : '10.5'}
                                  fontWeight={seg.isWinner ? '900' : '700'}
                                >
                                  {seg.sublabel}
                                </text>
                              )}
                            </g>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Botão central da roleta */}
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={phase === 'spinning'}
                    aria-label="Girar roleta"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-b from-white to-amber-100 border-4 border-amber-500 shadow-lg flex items-center justify-center text-sky-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:cursor-wait z-10"
                  >
                    {phase === 'spinning' ? '...' : 'GIRAR'}
                  </button>
                </div>
              </div>

              {/* Botão Principal para Girar */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={phase === 'spinning'}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-sky-950 font-black text-base sm:text-lg py-3.5 px-5 rounded-2xl shadow-[0_8px_20px_rgba(245,158,11,0.35)] border-b-4 border-amber-600 active:border-b-0 active:translate-y-0.5 transition-all duration-150 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>{phase === 'spinning' ? 'GIRANDO A ROLETA...' : 'GIRAR E GANHAR PRESENTE'}</span>
              </button>
            </>
          ) : (
            /* Tela de Vitória / Comemoração */
            <div className="py-1 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg border-2 border-amber-200">
                <Trophy className="w-9 h-9 text-sky-950" />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prêmio Máximo Liberado</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-sky-950 leading-tight mb-3 uppercase">
                VOCÊ GANHOU UM DESCONTO PARA O{' '}
                <span className="text-emerald-600">COMBO COMPLETO POR R$ 35,90</span>
              </h3>

              {/* Card do Prêmio */}
              <div className="bg-gradient-to-b from-sky-950 to-sky-900 text-white rounded-2xl p-4 mb-4 border-2 border-amber-400/70 shadow-inner">
                <div className="flex items-center justify-center gap-3.5 mb-3">
                  <img
                    src="https://matematica.aprendizadodivertido01.com/imagens/mockup.webp"
                    alt="Combo Completo Premiado"
                    className="w-16 h-16 object-contain rounded-lg border border-white/20 bg-white/5 shrink-0"
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                      Combo Completo + 5 Bônus
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-sky-300 line-through">De R$ 79,90</span>
                      <span className="text-xs text-sky-300 line-through">por R$ 37,90</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-emerald-300 leading-none mt-0.5">
                      R$ 35,90
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-sky-800 text-[11px] text-left text-sky-100 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>360 Atividades (1º ao 5º)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>100 Probleminhas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Tabuada Visual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>+3 Bônus + Vitalício</span>
                  </div>
                </div>
              </div>

              {/* Botão de Checkout para o Link Premiado */}
              <a
                href={prizeCheckoutUrl}
                onClick={onClaimPrize}
                className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base sm:text-lg py-4 px-5 rounded-2xl shadow-[0_8px_24px_rgba(16,185,129,0.4)] border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Gift className="w-5 h-5 text-amber-300 shrink-0" />
                <span>RESGATAR COMBO POR R$ 35,90</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </a>

              <a
                href={basicCheckoutUrl}
                onClick={onProceedBasic}
                className="w-full block text-xs text-gray-500 hover:text-gray-800 font-semibold py-2 mt-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                Não quero o desconto, ir para o Plano Básico (R$ 29,90)
              </a>

              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acesso imediato no e-mail · Garantia total de 7 dias</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
