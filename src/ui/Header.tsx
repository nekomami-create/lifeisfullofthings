import type { Params } from '../model/params';
import { fmt1 } from '../format';

interface Props {
  params: Params;
  age: number | null;
  onChange: (p: Params) => void;
}

export function Header({ params, age, onChange }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <header class="top">
      <h1>Life is full of things</h1>
      <label class="birth">
        <span>生年月日</span>
        <input
          type="date"
          max={today}
          value={params.birthDate}
          onInput={(e) => onChange({ ...params, birthDate: e.currentTarget.value })}
        />
      </label>
      <div class="age" aria-live="polite">
        {age === null ? (
          <span class="muted">未入力</span>
        ) : (
          <>
            <b>{fmt1(age)}</b>
            <small>歳</small>
          </>
        )}
      </div>
    </header>
  );
}
