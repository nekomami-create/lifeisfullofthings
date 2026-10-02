import { HOURS_PER_YEAR } from './model/lifeModel';

export type Unit = 'h' | 'd' | 'y' | '%';

export const UNIT_LABELS: Record<Unit, string> = { h: '時間', d: '日', y: '年', '%': '%' };

const nf0 = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtInt = (n: number) => nf0.format(Math.round(n));
export const fmt1 = (n: number) => nf1.format(n);

/** 時間数を単位つきの文字列に。% のときは total に対する割合 */
export function fmtUnit(hours: number, unit: Unit, total: number, suffix = true): string {
  const s = (t: string) => (suffix ? t : '');
  switch (unit) {
    case 'h':
      return `${fmtInt(hours)}${s('h')}`;
    case 'd':
      return `${fmtInt(hours / 24)}${s('日')}`;
    case 'y':
      return `${fmt1(hours / HOURS_PER_YEAR)}${s('年')}`;
    case '%':
      return total > 0 ? `${fmt1((hours / total) * 100)}${s('%')}` : '—';
  }
}

export const fmtHoursPerDay = (h: number) => `${fmt1(h)}h`;
