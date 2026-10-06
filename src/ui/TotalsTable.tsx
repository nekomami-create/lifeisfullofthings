import { CATEGORIES, sumTotals, type Totals } from '../model/lifeModel';
import { fmtUnit, type Unit } from '../format';
import { t } from '../i18n';
import { useLabel } from '../labels';

interface Props {
  life: Totals;
  used: Totals | null;
  rest: Totals | null;
  unit: Unit;
}

export function TotalsTable({ life, used, rest, unit }: Props) {
  const cols: { label: string; t: Totals }[] = [{ label: t.colLife, t: life }];
  if (used && rest) cols.push({ label: t.colUsed, t: used }, { label: t.colRest, t: rest });
  const sums = cols.map((c) => sumTotals(c.t));
  const label = useLabel();
  return (
    <div class="table-wrap">
      <table class="totals">
        <thead>
          <tr>
            <th class="unit">{t.tableUnit(t.units[unit])}</th>
            {cols.map((c) => (
              <th key={c.label}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.filter((cat) => cat.key !== 'hobby' || life.hobby > 0).map((cat) => (
            <tr key={cat.key} class={cat.key === 'free' ? 'free' : ''}>
              <th>
                <span class="th-in">
                  <i class="sw" style={{ background: `var(--c-${cat.key})` }} />
                  {label(cat.key)}
                </span>
              </th>
              {cols.map((c, i) => (
                <td key={c.label}>{fmtUnit(c.t[cat.key], unit, sums[i], false)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>{t.total}</th>
            {cols.map((c, i) => (
              <td key={c.label}>{fmtUnit(sums[i], unit, sums[i], false)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
