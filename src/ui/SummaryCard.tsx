import { HOURS_PER_YEAR, sumTotals, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmt1, fmtInt } from '../format';
import { t } from '../i18n';

interface Props {
  params: Params;
  age: number | null;
  life: Totals;
  rest: Totals | null;
  /** 秒単位で更新する残りの自由時間（年齢を丸めずに計算） */
  restFreeLive: number | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function SummaryCard({ params, age, life, rest, restFreeLive }: Props) {
  if (age === null || rest === null || restFreeLive === null) {
    const total = sumTotals(life);
    return (
      <section class="card hero">
        <p class="hero-label">{t.lifeFree}</p>
        <p class="hero-num">
          {fmtInt(life.free)}
          <small>{t.hoursWord}</small>
        </p>
        <p class="hero-sub">
          {t.lifeFreeSub(params.lifespan, fmt1((life.free / total) * 100), fmt1(life.free / HOURS_PER_YEAR))}
        </p>
        <p class="hint">{t.birthHint}</p>
      </section>
    );
  }

  const progress = age / params.lifespan;
  const restYears = params.lifespan - age;
  const restHoursAll = restYears * HOURS_PER_YEAR;
  const perDay = restYears > 0 ? rest.free / (restYears * 365) : 0;

  const freeSec = Math.max(0, Math.floor(restFreeLive * 3600));
  const fh = Math.floor(freeSec / 3600);
  const fm = Math.floor((freeSec % 3600) / 60);
  const fs = freeSec % 60;

  // 寿命までのカウントダウン（秒単位）
  const secLeft = Math.max(0, Math.floor(restHoursAll * 3600));
  const h = Math.floor(secLeft / 3600);
  const m = Math.floor((secLeft % 3600) / 60);
  const s = secLeft % 60;

  return (
    <section class="card hero">
      <p class="hero-label">{t.restFree}</p>
      <p class="hero-num live" aria-live="off">
        <span>
          {fmtInt(fh)}
          <small>{t.hoursWord}</small>
        </span>
        <span class="hero-ms">
          {pad(fm)}
          <small>{t.minWord}</small>
          {pad(fs)}
          <small>{t.secWord}</small>
        </span>
      </p>
      <p class="hero-sub">
        {t.restFreeSub(fmt1(restFreeLive / HOURS_PER_YEAR), fmt1(perDay))}
      </p>

      <div class="progress" role="img" aria-label={t.progressAria(fmt1(progress * 100))}>
        <div class="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div class="progress-meta">
        <span>{t.elapsed(fmt1(progress * 100))}</span>
        <span>
          {t.countdownPrefix(params.lifespan)}
          <b class="tick">{fmtInt(h)}</b>
          {t.countdownH}
          {pad(m)}
          {t.countdownM}
          {pad(s)}
          {t.countdownS}
        </span>
      </div>
    </section>
  );
}
