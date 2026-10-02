import { CATEGORIES, sumTotals, type Totals } from '../model/lifeModel';
import { fmtUnit, type Unit } from '../format';

interface Props {
  life: Totals;
  used: Totals | null;
  rest: Totals | null;
  unit: Unit;
}

/** 1本の100%積み上げ横棒。区切りは2pxの隙間 */
function StackBar({ totals, label, unit, dim }: { totals: Totals; label: string; unit: Unit; dim?: boolean }) {
  const total = sumTotals(totals);
  return (
    <div class={`lbar${dim ? ' dim' : ''}`}>
      <div class="lbar-head">
        <span>{label}</span>
        <span class="num">{fmtUnit(total, unit === '%' ? 'h' : unit, total)}</span>
      </div>
      <div class="lbar-track" role="img" aria-label={`${label}の内訳`}>
        {total > 0 &&
          CATEGORIES.map((c) => {
            const v = totals[c.key];
            if (v <= 0) return null;
            const pct = (v / total) * 100;
            return (
              <div
                key={c.key}
                class="lbar-seg"
                style={{ flexGrow: v, background: `var(--c-${c.key})` }}
                title={`${c.label} ${fmtUnit(v, unit, total)}`}
              >
                {pct >= 9 && <span>{Math.round(pct)}%</span>}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function LifeBars({ life, used, rest, unit }: Props) {
  return (
    <div class="lbars">
      <StackBar totals={life} label="生涯" unit={unit} />
      {used && rest && (
        <>
          <StackBar totals={used} label="消費した時間" unit={unit} dim />
          <StackBar totals={rest} label="残りの時間" unit={unit} />
        </>
      )}
    </div>
  );
}
