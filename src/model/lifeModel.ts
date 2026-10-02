import type { Education, Params } from './params';

export const HOURS_PER_YEAR = 365 * 24;

export type Category =
  | 'sleep'
  | 'care'
  | 'work'
  | 'housework'
  | 'childcare'
  | 'study'
  | 'commute'
  | 'free';

export type Tier = 1 | 2 | 3;

export interface CategoryInfo {
  key: Category;
  label: string;
  tier: Tier;
}

/**
 * 並び順はグラフの積み上げ順（下/左から）。色の隣接ペアを検証済みの順なので、
 * 入れ替えるときは styles.css の --c-* も合わせて再検証すること
 */
export const CATEGORIES: CategoryInfo[] = [
  { key: 'free', label: '自由時間', tier: 3 },
  { key: 'housework', label: '家事・買い物', tier: 2 },
  { key: 'childcare', label: '育児', tier: 2 },
  { key: 'study', label: '学校・勉強', tier: 2 },
  { key: 'commute', label: '通勤・通学', tier: 2 },
  { key: 'care', label: '食事・身支度', tier: 1 },
  { key: 'sleep', label: '睡眠', tier: 1 },
  { key: 'work', label: '労働', tier: 2 },
];

export const TIER_LABELS: Record<Tier, string> = {
  1: '1次活動（生理維持）',
  2: '2次活動（義務・拘束）',
  3: '3次活動（自由）',
};

/** ある年齢区間 [start, end) で 1年あたり perYear 時間を使う */
interface Segment {
  start: number;
  end: number;
  perYear: number;
}

interface SchoolStage {
  label: string;
  start: number;
  end: number;
  perYear: (p: Params) => number;
}

const SCHOOL_STAGES: SchoolStage[] = [
  { label: '小学校', start: 6, end: 12, perYear: (p) => p.schoolDays * p.elemHours },
  { label: '中学校', start: 12, end: 15, perYear: (p) => p.schoolDays * p.juniorHours },
  { label: '高校', start: 15, end: 18, perYear: (p) => p.schoolDays * p.highHours },
  { label: '大学', start: 18, end: 22, perYear: (p) => p.univHours },
  { label: '大学院', start: 22, end: 24, perYear: (p) => p.univHours },
];

const STAGE_COUNT: Record<Education, number> = { junior: 2, high: 3, univ: 4, grad: 5 };

export function schoolStages(p: Params): SchoolStage[] {
  return SCHOOL_STAGES.slice(0, STAGE_COUNT[p.education]);
}

export function graduationAge(p: Params): number {
  const stages = schoolStages(p);
  return stages[stages.length - 1].end;
}

const daily = (h: number, start: number, end: number): Segment => ({
  start,
  end,
  perYear: h * 365,
});

function segments(p: Params): Record<Exclude<Category, 'free'>, Segment[]> {
  const L = p.lifespan;
  const gradAge = graduationAge(p);
  const work: Segment = {
    start: p.workStart,
    end: p.workEnd,
    perYear: p.workDays * p.workHours + p.overtime * 12,
  };
  return {
    sleep: [daily(p.sleep, 0, L)],
    care: [daily(p.meal + p.hygiene, 0, L)],
    housework: [daily(p.housework, 0, L)],
    childcare: [daily(p.childcare, p.childcareStart, p.childcareEnd)],
    work: [work],
    study: schoolStages(p).map((s) => ({ start: s.start, end: s.end, perYear: s.perYear(p) })),
    commute: [
      { start: p.workStart, end: p.workEnd, perYear: p.workDays * p.commute },
      { start: 6, end: gradAge, perYear: p.schoolDays * p.schoolCommute },
    ],
  };
}

/** [from, to) の区間で使う時間（寿命でクリップ） */
function sumSegments(segs: Segment[], from: number, to: number, lifespan: number): number {
  let total = 0;
  for (const s of segs) {
    const a = Math.max(s.start, from, 0);
    const b = Math.min(s.end, to, lifespan);
    if (b > a) total += s.perYear * (b - a);
  }
  return total;
}

export type Totals = Record<Category, number>;

/** 年齢区間 [from, to) の各カテゴリ合計時間 */
export function totalsBetween(p: Params, from: number, to: number): Totals {
  const segs = segments(p);
  const out = {} as Totals;
  let used = 0;
  for (const c of CATEGORIES) {
    if (c.key === 'free') continue;
    const v = sumSegments(segs[c.key], from, to, p.lifespan);
    out[c.key] = v;
    used += v;
  }
  const span = Math.max(0, Math.min(to, p.lifespan) - Math.max(from, 0));
  out.free = span * HOURS_PER_YEAR - used;
  return out;
}

export function lifeTotals(p: Params): Totals {
  return totalsBetween(p, 0, p.lifespan);
}

export function sumTotals(t: Totals): number {
  return CATEGORIES.reduce((s, c) => s + t[c.key], 0);
}

/** 1歳刻みの年間配分。グラフ用 */
export function yearlyBreakdown(p: Params): Totals[] {
  const years: Totals[] = [];
  for (let a = 0; a < Math.ceil(p.lifespan); a++) years.push(totalsBetween(p, a, a + 1));
  return years;
}

/** 自由時間がマイナスになる年齢（設定が1日24時間を超えている） */
export function overbookedAges(p: Params): number[] {
  return yearlyBreakdown(p)
    .map((t, age) => ({ age, free: t.free }))
    .filter((x) => x.free < -1e-6)
    .map((x) => x.age);
}

export type DayKind = 'workday' | 'schoolday' | 'day';

export interface DayBreakdown {
  kind: DayKind;
  hours: Totals;
}

/**
 * 指定年齢の1日の内訳。kind はその年齢の平日の種類（出勤日・登校日・どちらでもない日）。
 * holiday なら労働・学業・通勤通学を除いた休日の内訳を返す
 */
export function dayAt(p: Params, age: number, holiday = false): DayBreakdown {
  const h: Totals = {
    sleep: p.sleep,
    care: p.meal + p.hygiene,
    housework: p.housework,
    childcare: age >= p.childcareStart && age < p.childcareEnd ? p.childcare : 0,
    work: 0,
    study: 0,
    commute: 0,
    free: 0,
  };
  let kind: DayKind = 'day';
  if (age >= p.workStart && age < p.workEnd && p.workDays > 0) {
    kind = 'workday';
    h.work = p.workHours + (p.overtime * 12) / p.workDays;
    h.commute = p.commute;
  } else {
    const stage = schoolStages(p).find((s) => age >= s.start && age < s.end);
    if (stage && p.schoolDays > 0) {
      kind = 'schoolday';
      h.study = stage.perYear(p) / p.schoolDays;
      h.commute = p.schoolCommute;
    }
  }
  if (holiday) h.work = h.study = h.commute = 0;
  h.free = 24 - sumTotals(h);
  return { kind, hours: h };
}

const MS_PER_YEAR = 365.2425 * 24 * 3600 * 1000;

/** 生年月日から現在の年齢（小数）。未入力・不正なら null */
export function ageFromBirthDate(birthDate: string, now: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  if (isNaN(birth.getTime())) return null;
  const age = (now.getTime() - birth.getTime()) / MS_PER_YEAR;
  return age >= 0 ? age : null;
}
