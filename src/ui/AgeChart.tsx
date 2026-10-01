import { useMemo, useRef } from 'preact/hooks';
import { CATEGORIES, graduationAge, yearlyBreakdown } from '../model/lifeModel';
import type { Params } from '../model/params';

interface Props {
  params: Params;
  age: number | null;
  focusAge: number;
  onPick: (age: number) => void;
}

const W = 340;
const H = 210;
const PAD = { l: 26, r: 8, t: 22, b: 22 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;

export function AgeChart({ params, age, focusAge, onPick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const L = params.lifespan;
  const years = useMemo(() => yearlyBreakdown(params), [params]);
  const x = (a: number) => PAD.l + (Math.min(a, L) / L) * PW;
  const y = (hPerDay: number) => PAD.t + PH - (Math.max(0, Math.min(24, hPerDay)) / 24) * PH;

  // 下から積み上げた階段状エリア
  const areas = useMemo(() => {
    const base = years.map(() => 0);
    return CATEGORIES.map((c) => {
      const lower = [...base];
      years.forEach((t, i) => (base[i] += Math.max(0, t[c.key]) / 365));
      const upper = [...base];
      let d = '';
      years.forEach((_, i) => {
        d += `${i === 0 ? 'M' : 'L'}${x(i)},${y(upper[i])}L${x(i + 1)},${y(upper[i])}`;
      });
      for (let i = years.length - 1; i >= 0; i--) {
        d += `L${x(i + 1)},${y(lower[i])}L${x(i)},${y(lower[i])}`;
      }
      return { key: c.key, d: d + 'Z' };
    });
  }, [years]);

  const pick = (e: PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const a = Math.floor(((vx - PAD.l) / PW) * L);
    onPick(Math.max(0, Math.min(Math.ceil(L) - 1, a)));
  };

  const grad = graduationAge(params);
  const phases = [
    { label: '学生', from: 6, to: Math.min(grad, params.workStart) },
    { label: '現役', from: params.workStart, to: params.workEnd },
    { label: '老後', from: params.workEnd, to: L },
  ].filter((p) => p.to > p.from && p.from < L);

  const xTicks: number[] = [];
  for (let a = 0; a <= L; a += 10) xTicks.push(a);

  return (
    <svg
      ref={svgRef}
      class="agechart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="年齢ごとの1日あたり時間配分"
      onPointerDown={(e) => {
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => e.buttons && pick(e)}
    >
      {phases.map((p) => (
        <g key={p.label}>
          <line class="phase" x1={x(p.from) + 1} x2={x(p.to) - 1} y1={PAD.t - 12} y2={PAD.t - 12} />
          <text class="phase-t" x={(x(p.from) + x(p.to)) / 2} y={PAD.t - 16}>
            {p.label}
          </text>
        </g>
      ))}

      {areas.map((a) => (
        <path key={a.key} d={a.d} fill={`var(--c-${a.key})`} class="area" />
      ))}

      {[0, 6, 12, 18, 24].map((h) => (
        <g key={h}>
          <line class="grid" x1={PAD.l} x2={W - PAD.r} y1={y(h)} y2={y(h)} />
          <text class="ax" x={PAD.l - 4} y={y(h) + 3} text-anchor="end">
            {h}
          </text>
        </g>
      ))}
      {xTicks.map((a) => (
        <text key={a} class="ax" x={x(a)} y={H - 6} text-anchor="middle">
          {a}
        </text>
      ))}
      <text class="ax" x={PAD.l - 4} y={PAD.t - 4 + 0} text-anchor="end">
        h
      </text>

      {age !== null && (
        <>
          <rect class="past" x={PAD.l} y={PAD.t} width={x(age) - PAD.l} height={PH} />
          <line class="now" x1={x(age)} x2={x(age)} y1={PAD.t - 4} y2={PAD.t + PH} />
          <text class="now-t" x={x(age)} y={PAD.t + PH + 0} dy="-4" text-anchor="middle">
            今
          </text>
        </>
      )}

      <rect
        class="focus"
        x={x(focusAge)}
        y={PAD.t}
        width={Math.max(1, x(focusAge + 1) - x(focusAge))}
        height={PH}
      />
    </svg>
  );
}
