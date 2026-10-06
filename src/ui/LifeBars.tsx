import { CATEGORIES, sumTotals, type Totals } from '../model/lifeModel';
import { fmtInt } from '../format';
import { useLabel } from '../labels';
import { t } from '../i18n';

interface Props {
  life: Totals;
  used: Totals | null;
  rest: Totals | null;
}

/** 1本の100%積み上げ横棒。区切りは2pxの隙間 */
function StackBar({ totals, label, dim }: { totals: Totals; label: string; dim?: boolean }) {
  const total = sumTotals(totals);
  const nameOf = useLabel();
  return (
    <div class={`lbar${dim ? ' dim' : ''}`}>
      <div class="lbar-head">
        <span>{label}</span>
        <span class="num">{fmtInt(total)}h</span>
      </div>
      <div class="lbar-track" role="img" aria-label={t.barAria(label)}>
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
                title={`${nameOf(c.key)} ${fmtInt(v)}h (${Math.round(pct)}%)`}
              >
                {pct >= 9 && <span>{Math.round(pct)}%</span>}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function LifeBars({ life, used, rest }: Props) {
  return (
    <div class="lbars">
      <StackBar totals={life} label={t.barLife} />
      {used && rest && (
        <>
          <StackBar totals={used} label={t.barUsed} dim />
          <StackBar totals={rest} label={t.barRest} />
        </>
      )}
    </div>
  );
}
