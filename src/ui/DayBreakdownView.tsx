import { useState } from 'preact/hooks';
import { CATEGORIES, dayAt } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmtHoursPerDay } from '../format';

const WEEKDAY_LABEL = { workday: '出勤日', schoolday: '登校日' } as const;

export function DayBreakdownView({ params, age }: { params: Params; age: number }) {
  const [holiday, setHoliday] = useState(false);
  const { kind } = dayAt(params, age);
  const hasToggle = kind !== 'day';
  const { hours } = dayAt(params, age, hasToggle && holiday);
  const title = !hasToggle ? '1日' : holiday ? '休日' : WEEKDAY_LABEL[kind];
  const rows = CATEGORIES.filter((c) => hours[c.key] > 0 || c.key === 'free');
  return (
    <div class="day">
      <div class="day-head">
        <h3>
          {age}歳の{title}
        </h3>
        {hasToggle && (
          <div class="seg" role="group" aria-label="出勤日と休日の切り替え">
            <button aria-pressed={!holiday} onClick={() => setHoliday(false)}>
              {WEEKDAY_LABEL[kind]}
            </button>
            <button aria-pressed={holiday} onClick={() => setHoliday(true)}>
              休日
            </button>
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
