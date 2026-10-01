import { CATEGORIES, dayAt } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmtHoursPerDay } from '../format';

const KIND_LABEL = { workday: '出勤日', schoolday: '登校日', day: '1日' } as const;

export function DayBreakdownView({ params, age }: { params: Params; age: number }) {
  const { kind, hours } = dayAt(params, age);
  const rows = CATEGORIES.filter((c) => hours[c.key] > 0 || c.key === 'free');
  return (
    <div class="day">
      <h3>
        {age}歳の{KIND_LABEL[kind]}
        <span class="day-free">
          自由 <b>{fmtHoursPerDay(Math.max(0, hours.free))}</b>
        </span>
      </h3>
      <div class="day-track" role="img" aria-label={`${age}歳の1日24時間の内訳`}>
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
