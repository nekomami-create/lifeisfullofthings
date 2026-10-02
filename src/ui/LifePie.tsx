import { CATEGORIES, sumTotals, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmt1 } from '../format';

interface Props {
  params: Params;
  life: Totals;
  age: number | null;
}

const S = 240;
const C = S / 2;
const R_OUT = 96;
const R_IN = 60;
const R_RING = 108;

/** 12時の位置から時計回りに angle(0〜1) 進んだ点 */
function pt(r: number, f: number): [number, number] {
  const a = f * 2 * Math.PI - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function sector(f0: number, f1: number): string {
  // 1周ちょうどだと円弧が描けないので僅かに縮める
  const e = Math.min(f1, f0 + 0.99999);
  const large = e - f0 > 0.5 ? 1 : 0;
  const [x0, y0] = pt(R_OUT, f0);
  const [x1, y1] = pt(R_OUT, e);
  const [x2, y2] = pt(R_IN, e);
  const [x3, y3] = pt(R_IN, f0);
  return `M${x0},${y0}A${R_OUT},${R_OUT} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${R_IN},${R_IN} 0 ${large} 0 ${x3},${y3}Z`;
}

function arc(r: number, f0: number, f1: number): string {
  const e = Math.min(f1, f0 + 0.99999);
  const [x0, y0] = pt(r, f0);
  const [x1, y1] = pt(r, e);
  return `M${x0},${y0}A${r},${r} 0 ${e - f0 > 0.5 ? 1 : 0} 1 ${x1},${y1}`;
}

export function LifePie({ params, life, age }: Props) {
  const total = sumTotals(life);
  let acc = 0;
  const slices = CATEGORIES.map((c) => {
    const f = Math.max(0, life[c.key]) / total;
    const s = { ...c, f0: acc, f1: acc + f, f };
    acc += f;
    return s;
  }).filter((s) => s.f > 0);
  const progress = age === null ? null : Math.min(1, age / params.lifespan);

  return (
    <section class="card pie-card">
      <h2>人生{params.lifespan}年の内訳</h2>
      <svg class="pie" viewBox={`0 0 ${S} ${S}`} role="img" aria-label="生涯の時間配分の円グラフ">
        <circle class="pie-track" cx={C} cy={C} r={R_RING} />
        {progress !== null && progress > 0 && (
          <>
            <path class="pie-progress" d={arc(R_RING, 0, progress)} />
            <circle class="pie-now" cx={pt(R_RING, progress)[0]} cy={pt(R_RING, progress)[1]} r={5} />
          </>
        )}
        {slices.map((s) => (
          <path key={s.key} d={sector(s.f0, s.f1)} fill={`var(--c-${s.key})`} class="pie-seg">
            <title>
              {s.label} {fmt1(s.f * 100)}%
            </title>
          </path>
        ))}
        {slices
          .filter((s) => s.f >= 0.06)
          .map((s) => {
            const [x, y] = pt((R_OUT + R_IN) / 2, (s.f0 + s.f1) / 2);
            return (
              <text key={s.key} class="pie-pct" x={x} y={y + 4}>
                {Math.round(s.f * 100)}%
              </text>
            );
          })}
        <text class="pie-c1" x={C} y={C - 8}>
          自由時間
        </text>
        <text class="pie-c2" x={C} y={C + 18}>
          {fmt1((life.free / total) * 100)}%
        </text>
      </svg>
      {progress !== null && (
        <p class="pie-note">
          <i class="ring-sw" />
          外周は経過した人生（{fmt1(progress * 100)}%）
        </p>
      )}
      <ul class="pie-legend">
        {slices.map((s) => (
          <li key={s.key}>
            <i class="sw" style={{ background: `var(--c-${s.key})` }} />
            <span>{s.label}</span>
            <span class="num">{fmt1(s.f * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
