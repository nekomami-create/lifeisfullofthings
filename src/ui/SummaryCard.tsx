import { HOURS_PER_YEAR, sumTotals, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmt1, fmtInt } from '../format';

interface Props {
  params: Params;
  age: number | null;
  now: Date;
  life: Totals;
  rest: Totals | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function SummaryCard({ params, age, life, rest }: Props) {
  if (age === null || rest === null) {
    const total = sumTotals(life);
    return (
      <section class="card hero">
        <p class="hero-label">生涯の自由時間</p>
        <p class="hero-num">
          {fmtInt(life.free)}
          <small>時間</small>
        </p>
        <p class="hero-sub">
          人生{params.lifespan}年のうち {fmt1((life.free / total) * 100)}%（約{fmt1(life.free / HOURS_PER_YEAR)}年分）
        </p>
        <p class="hint">↑ 生年月日を入れると、使った時間と残りの時間に分かれます</p>
      </section>
    );
  }

  const progress = age / params.lifespan;
  const restYears = params.lifespan - age;
  const restHoursAll = restYears * HOURS_PER_YEAR;
  const perDay = restYears > 0 ? rest.free / (restYears * 365) : 0;

  // 寿命までのカウントダウン（秒単位）
  const secLeft = Math.max(0, Math.floor(restHoursAll * 3600));
  const h = Math.floor(secLeft / 3600);
  const m = Math.floor((secLeft % 3600) / 60);
  const s = secLeft % 60;

  return (
    <section class="card hero">
      <p class="hero-label">残りの自由時間</p>
      <p class="hero-num">
        {fmtInt(rest.free)}
        <small>時間</small>
      </p>
      <p class="hero-sub">
        約{fmt1(rest.free / HOURS_PER_YEAR)}年分　寿命まで1日平均 {fmt1(perDay)}時間
      </p>

      <div class="progress" role="img" aria-label={`人生の${fmt1(progress * 100)}%を経過`}>
        <div class="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div class="progress-meta">
        <span>経過 {fmt1(progress * 100)}%</span>
        <span>
          {params.lifespan}歳まで あと <b class="tick">{fmtInt(h)}</b>時間{pad(m)}分{pad(s)}秒
        </span>
      </div>
    </section>
  );
}
