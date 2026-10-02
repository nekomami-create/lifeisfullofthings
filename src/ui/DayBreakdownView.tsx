import { useState } from 'preact/hooks';
import { CATEGORIES, dayAt, totalsBetween, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmtHoursPerDay } from '../format';

const WEEKDAY_LABEL = { workday: '出勤日', schoolday: '登校日' } as const;

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
  const { kind } = dayAt(params, age);
  const hasToggle = kind !== 'day';
  const m: Mode = hasToggle ? mode : 'avg';
  const hours = m === 'avg' ? averageDay(params, age) : dayAt(params, age, m === 'holiday').hours;
  const title = !hasToggle ? '1日' : m === 'avg' ? '平均的な1日' : m === 'holiday' ? '休日' : WEEKDAY_LABEL[kind];
  const rows = CATEGORIES.filter((c) => hours[c.key] > 0 || c.key === 'free');
  return (
    <div class="day">
      <div class="day-head">
        <h3>
          {age}歳の{title}
        </h3>
        {hasToggle && (
          <div class="seg" role="group" aria-label="1日の種類の切り替え">
            {(
              [
                ['avg', '平均'],
                ['weekday', WEEKDAY_LABEL[kind]],
                ['holiday', '休日'],
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
        自由 <b>{fmtHoursPerDay(Math.max(0, hours.free))}</b>
      </p>
      <div class="day-track" role="img" aria-label={`${age}歳の${title}24時間の内訳`}>
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
            <span>{c.label}</span>
            <span class="num">{fmtHoursPerDay(hours[c.key])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
