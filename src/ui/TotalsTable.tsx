import { CATEGORIES, sumTotals, type Totals } from '../model/lifeModel';
import { fmtUnit, UNIT_LABELS, type Unit } from '../format';

interface Props {
  life: Totals;
  used: Totals | null;
  rest: Totals | null;
  unit: Unit;
}

export function TotalsTable({ life, used, rest, unit }: Props) {
  const cols: { label: string; t: Totals }[] = [{ label: '生涯', t: life }];
  if (used && rest) cols.push({ label: '消費', t: used }, { label: '残り', t: rest });
  const sums = cols.map((c) => sumTotals(c.t));
  return (
    <div class="table-wrap">
      <table class="totals">
        <thead>
          <tr>
            <th class="unit">単位：{UNIT_LABELS[unit]}</th>
            {cols.map((c) => (
              <th key={c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat) => (
            <tr key={cat.key} class={cat.key === 'free' ? 'free' : ''}>
              <th>
                <i class="sw" style={{ background: `var(--c-${cat.key})` }} />
                {cat.label}
              </th>
              {cols.map((c, i) => (
                <td key={c.label}>{fmtUnit(c.t[cat.key], unit, sums[i], false)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>合計</th>
            {cols.map((c, i) => (
              <td key={c.label}>{fmtUnit(sums[i], unit, sums[i], false)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
