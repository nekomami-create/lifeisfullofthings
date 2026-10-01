import { CATEGORIES } from '../model/lifeModel';

export function Legend() {
  return (
    <ul class="legend">
      {CATEGORIES.map((c) => (
        <li key={c.key}>
          <i class="sw" style={{ background: `var(--c-${c.key})` }} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}
