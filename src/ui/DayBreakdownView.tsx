import { useState } from 'preact/hooks';
import { CATEGORIES, dayAt, totalsBetween, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmtHoursPerDay } from '../format';
import { useLabel } from '../labels';
import { t } from '../i18n';

type Mode = 'avg' | 'weekday' | 'holiday';

/** その年齢の1年間を365で割った「平均的な1日」。上の年齢グラフと同じ値 */
function averageDay(params: Params, age: number): Totals {
  const y = totalsBetween(params, age, age + 1);
  const out = {} as Totals;
  for (const c of CATEGORIES) out[c.key] = y[c.key] / 365;
  return out;
}

export function DayBreakdownView({ params, age }: { params: Params; age: number }) {
  const [mode, setMode] = useState<Mode>('avg');
  const label = useLabel();
  const { kind } = dayAt(params, age);
  const hasToggle = kind !== 'day';
  const m: Mode = hasToggle ? mode : 'avg';
  const hours = m === 'avg' ? averageDay(params, age) : dayAt(params, age, m === 'holiday').hours;
  const title = t.dayTitle(age, !hasToggle ? t.dayKinds.day : m === 'weekday' ? t.dayKinds[kind] : t.dayKinds[m]);
  const rows = CATEGORIES.filter((c) => hours[c.key] > 0 || c.key === 'free');
  return (
    <div class="day">
      <div class="day-head">
        <h3>{title}</h3>
        {hasToggle && (
          <div class="seg" role="group" aria-label={t.dayToggleAria}>
            {(
              [
                ['avg', t.dayModeAvg],
                ['weekday', t.dayModeWeekday[kind as 'workday' | 'schoolday']],
                ['holiday', t.dayModeHoliday],
              ] as const
            ).map(([k, label]) => (
              <button key={k} aria-pressed={m === k} onClick={() => setMode(k)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p class="day-free">
        {t.dayFree} <b>{fmtHoursPerDay(Math.max(0, hours.free))}</b>
      </p>
      <div class="day-track" role="img" aria-label={t.dayAria(title)}>
        {rows.map((c) => (
          <div
            key={c.key}
            class="day-seg"
            style={{ flexGrow: Math.max(0, hours[c.key]), background: `var(--c-${c.key})` }}
          />
        ))}
      </div>
      <div class="day-ticks">
        <span>0h</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24h</span>
      </div>
      <ul class="day-list">
        {rows.map((c) => (
          <li key={c.key}>
            <i class="sw" style={{ background: `var(--c-${c.key})` }} />
            <span>{label(c.key)}</span>
            <span class="num">{fmtHoursPerDay(hours[c.key])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
