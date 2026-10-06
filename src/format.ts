import { HOURS_PER_YEAR } from './model/lifeModel';
import { t } from './i18n';

export type Unit = 'h' | 'd' | 'y' | '%';

const nf0 = new Intl.NumberFormat(t.numberLocale, { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat(t.numberLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtInt = (n: number) => nf0.format(Math.round(n));
export const fmt1 = (n: number) => nf1.format(n);

/** 時間数を単位つきの文字列に。% のときは total に対する割合 */
export function fmtUnit(hours: number, unit: Unit, total: number, suffix = true): string {
  const s = (x: string) => (suffix ? x : '');
  switch (unit) {
    case 'h':
      return `${fmtInt(hours)}${s('h')}`;
    case 'd':
      return `${fmtInt(hours / 24)}${s(t.unitSuffix.d)}`;
    case 'y':
      return `${fmt1(hours / HOURS_PER_YEAR)}${s(t.unitSuffix.y)}`;
    case '%':
      return total > 0 ? `${fmt1((hours / total) * 100)}${s('%')}` : '—';
  }
}

export const fmtHoursPerDay = (h: number) => `${fmt1(h)}h`;
