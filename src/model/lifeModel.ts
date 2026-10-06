import type { Education, Params, SchoolSystem } from './params';

export const HOURS_PER_YEAR = 365 * 24;

export type Category =
  | 'hobby'
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
  { key: 'hobby', label: '趣味', tier: 3 },
  { key: 'housework', label: '家事・買い物', tier: 2 },
  { key: 'childcare', label: '育児', tier: 2 },
  { key: 'study', label: '学校・勉強', tier: 2 },
  { key: 'commute', label: '通勤・通学', tier: 2 },
  { key: 'care', label: '食事・身支度', tier: 1 },
  { key: 'sleep', label: '睡眠', tier: 1 },
  { key: 'work', label: '労働', tier: 2 },
];

/** ある年齢区間 [start, end) で 1年あたり perYear 時間を使う */
interface Segment {
  start: number;
  end: number;
  perYear: number;
}

export interface SchoolStage {
  start: number;
  end: number;
  perYear: (p: Params) => number;
}

/** 5段階（初等・前期中等・後期中等・学士・修士）の [開始, 終了) 年齢 */
export const STAGE_AGES: Record<SchoolSystem, [number, number][]> = {
  // 小学校・中学校・高校・大学4年・大学院（修士）2年
  jp: [[6, 12], [12, 15], [15, 18], [18, 22], [22, 24]],
  // Kindergarten〜5th・Middle 6th〜8th・High 9th〜12th・Bachelor's 4年・Master's 2年
  us: [[5, 11], [11, 14], [14, 18], [18, 22], [22, 24]],
  // Primary（Reception〜Year 6）・Secondary（Year 7〜11, GCSE）・Sixth form・Bachelor's 3年・Master's 1年
  uk: [[4, 11], [11, 16], [16, 18], [18, 21], [21, 22]],
};

const STAGE_HOURS: ((p: Params) => number)[] = [
  (p) => p.schoolDays * p.elemHours,
  (p) => p.schoolDays * p.juniorHours,
  (p) => p.schoolDays * p.highHours,
  (p) => p.univHours,
  (p) => p.univHours,
];

const STAGE_COUNT: Record<Education, number> = { junior: 2, high: 3, univ: 4, grad: 5 };

/** 制度ごとに選べる最終学歴。米国は義務教育が高校までなので「中学まで」は出さない */
export const EDUCATION_OPTIONS: Record<SchoolSystem, Education[]> = {
  jp: ['junior', 'high', 'univ', 'grad'],
  us: ['high', 'univ', 'grad'],
  uk: ['junior', 'high', 'univ', 'grad'],
};

export function effectiveEducation(p: Params): Education {
  const opts = EDUCATION_OPTIONS[p.schoolSystem] ?? EDUCATION_OPTIONS.jp;
  return opts.includes(p.education) ? p.education : opts[0];
}

export function schoolStages(p: Params): SchoolStage[] {
  const ages = STAGE_AGES[p.schoolSystem] ?? STAGE_AGES.jp;
  return ages
    .slice(0, STAGE_COUNT[effectiveEducation(p)])
    .map(([start, end], i) => ({ start, end, perYear: STAGE_HOURS[i] }));
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
    hobby: [daily(p.hobby, p.hobbyStart, p.hobbyEnd)],
    housework: [daily(p.housework, 0, L)],
    childcare: [daily(p.childcare, p.childcareStart, p.childcareEnd)],
    work: [work],
    study: schoolStages(p).map((s) => ({ start: s.start, end: s.end, perYear: s.perYear(p) })),
    commute: [
      { start: p.workStart, end: p.workEnd, perYear: p.workDays * p.commute },
      { start: schoolStages(p)[0].start, end: gradAge, perYear: p.schoolDays * p.schoolCommute },
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
    hobby: age >= p.hobbyStart && age < p.hobbyEnd ? p.hobby : 0,
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

/** 表示名。趣味だけはユーザーが名前を付けられる */
export function categoryLabels(
  p: Params,
  base: Record<Category, string> = JA_LABELS,
): Record<Category, string> {
  const out = { ...base };
  const name = p.hobbyName.trim();
  if (name) out.hobby = name;
  return out;
}

const JA_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])) as Record<Category, string>;
