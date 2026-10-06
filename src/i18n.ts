import type { Category } from './model/lifeModel';
import type { DayKind } from './model/lifeModel';
import { DEFAULT_PARAMS, DEFAULT_PARAMS_EN, type Education, type Params, type SchoolSystem } from './model/params';

export type Locale = 'ja' | 'en';

/** ページの <html lang> で言語を決める。ページごとに固定なので実行時の切り替えはしない */
export const LOCALE: Locale =
  typeof document !== 'undefined' && document.documentElement.lang.startsWith('en') ? 'en' : 'ja';

type NumParam = { [K in keyof Params]: Params[K] extends number ? K : never }[keyof Params];

export interface Messages {
  numberLocale: string;
  storageKey: string;
  defaults: Params;
  otherLangLabel: string;
  otherLangHref: string;

  categories: Record<Category, string>;

  birthDate: string;
  notEntered: string;
  ageUnit: string;

  overbooked: (firstAge: number, more: number) => string;

  pieTitle: (lifespan: number) => string;
  pieAria: string;
  pieCenter: string;
  pieRingNote: (pct: string) => string;

  lifeFree: string;
  lifeFreeSub: (lifespan: number, pct: string, years: string) => string;
  birthHint: string;
  restFree: string;
  hoursWord: string;
  minWord: string;
  secWord: string;
  restFreeSub: (years: string, perDay: string) => string;
  progressAria: (pct: string) => string;
  elapsed: (pct: string) => string;
  countdownPrefix: (lifespan: number) => string;
  countdownH: string;
  countdownM: string;
  countdownS: string;

  barsTitle: string;
  barLife: string;
  barUsed: string;
  barRest: string;
  barAria: (label: string) => string;

  ageChartTitle: string;
  ageChartSub: string;
  ageChartAria: string;
  phaseStudent: string;
  phaseWorking: string;
  phaseRetired: string;
  now: string;

  dayTitle: (age: number, kind: string) => string;
  dayKinds: Record<DayKind | 'avg' | 'holiday', string>;
  dayModeAvg: string;
  dayModeWeekday: Record<'workday' | 'schoolday', string>;
  dayModeHoliday: string;
  dayToggleAria: string;
  dayFree: string;
  dayAria: (title: string) => string;

  tableTitle: string;
  unitAria: string;
  units: Record<'h' | 'd' | 'y' | '%', string>;
  unitSuffix: Record<'d' | 'y', string>;
  tableUnit: (u: string) => string;
  colLife: string;
  colUsed: string;
  colRest: string;
  total: string;

  foot: string;

  paramsButton: string;
  paramsTitle: string;
  reset: string;
  close: string;
  changedDot: string;
  decrease: (label: string) => string;
  increase: (label: string) => string;
  hobbyNameLabel: string;
  hobbyNamePlaceholder: string;
  schoolSystemLabel: string;
  schoolSystems: Partial<Record<SchoolSystem, string>>;
  educationLabel: string;
  educationLabels: (system: SchoolSystem) => Record<Education, string>;
  groups: {
    life: string;
    body: string;
    work: string;
    hobby: string;
    home: string;
    school: string;
  };
  fields: Partial<Record<NumParam, string>>;
  stageFields: (system: SchoolSystem) => Partial<Record<NumParam, string>>;
  unitsShort: { age: string; hPerDay: string; hPerMonth: string; hPerYear: string; days: string };
}

const ja: Messages = {
  numberLocale: 'ja-JP',
  storageKey: 'lifeisfullofthings:params:v1',
  defaults: DEFAULT_PARAMS,
  otherLangLabel: 'English',
  otherLangHref: './en/',

  categories: {
    free: '自由時間',
    hobby: '趣味',
    housework: '家事・買い物',
    childcare: '育児',
    study: '学校・勉強',
    commute: '通勤・通学',
    care: '食事・身支度',
    sleep: '睡眠',
    work: '労働',
  },

  birthDate: '生年月日',
  notEntered: '未入力',
  ageUnit: '歳',

  overbooked: (a, more) =>
    `⚠ ${a}歳${more > 0 ? `ほか${more}年` : ''}は1日の合計が24時間を超えています。パラメータを見直してください。`,

  pieTitle: (l) => `人生${l}年の内訳`,
  pieAria: '生涯の時間配分の円グラフ',
  pieCenter: '自由時間',
  pieRingNote: (p) => `外周は経過した人生（${p}%）`,

  lifeFree: '生涯の自由時間',
  lifeFreeSub: (l, p, y) => `人生${l}年のうち ${p}%（約${y}年分）`,
  birthHint: '↑ 生年月日を入れると、消費した時間と残りの時間に分かれます',
  restFree: '残りの自由時間',
  hoursWord: '時間',
  minWord: '分',
  secWord: '秒',
  restFreeSub: (y, d) => `約${y}年分　寿命まで1日平均 ${d}時間`,
  progressAria: (p) => `人生の${p}%を経過`,
  elapsed: (p) => `経過 ${p}%`,
  countdownPrefix: (l) => `${l}歳まで あと `,
  countdownH: '時間',
  countdownM: '分',
  countdownS: '秒',

  barsTitle: '消費した時間と残りの時間',
  barLife: '生涯',
  barUsed: '消費した時間',
  barRest: '残りの時間',
  barAria: (l) => `${l}の内訳`,

  ageChartTitle: '年齢ごとの1日の使い方',
  ageChartSub: 'グラフをタップ・なぞると、その年齢の1日を下に表示（グラフは出勤日と休日をならした平均）',
  ageChartAria: '年齢ごとの1日あたり時間配分',
  phaseStudent: '学生',
  phaseWorking: '現役',
  phaseRetired: '老後',
  now: '今',

  dayTitle: (a, k) => `${a}歳の${k}`,
  dayKinds: { workday: '出勤日', schoolday: '登校日', day: '1日', avg: '平均的な1日', holiday: '休日' },
  dayModeAvg: '平均',
  dayModeWeekday: { workday: '出勤日', schoolday: '登校日' },
  dayModeHoliday: '休日',
  dayToggleAria: '1日の種類の切り替え',
  dayFree: '自由',
  dayAria: (t) => `${t}の24時間の内訳`,

  tableTitle: '集計表',
  unitAria: '表示単位',
  units: { h: '時間', d: '日', y: '年', '%': '%' },
  unitSuffix: { d: '日', y: '年' },
  tableUnit: (u) => `単位：${u}`,
  colLife: '生涯',
  colUsed: '消費',
  colRest: '残り',
  total: '合計',

  foot: '分類は総務省「社会生活基本調査」の1次・2次・3次活動に準拠。1年＝365日で計算。',

  paramsButton: '⚙ パラメータ',
  paramsTitle: 'パラメータ',
  reset: '初期値に戻す',
  close: '閉じる',
  changedDot: '初期値から変更',
  decrease: (l) => `${l}を減らす`,
  increase: (l) => `${l}を増やす`,
  hobbyNameLabel: '名前',
  hobbyNamePlaceholder: '例：執筆、ランニング',
  schoolSystemLabel: '学校制度',
  schoolSystems: {},
  educationLabel: '最終学歴',
  educationLabels: () => ({ junior: '中卒', high: '高卒', univ: '大卒', grad: '院卒' }),
  groups: {
    life: '人生',
    body: '睡眠・食事・身支度',
    work: '労働',
    hobby: '趣味',
    home: '家事・育児',
    school: '学業',
  },
  fields: {
    lifespan: '寿命',
    sleep: '睡眠',
    meal: '食事',
    hygiene: '身支度・入浴・衛生',
    workStart: '就職',
    workEnd: '退職',
    workDays: '年間勤務日数',
    workHours: '所定労働時間',
    overtime: '残業',
    commute: '通勤（往復）',
    hobby: '1日の時間',
    hobbyStart: '何歳から',
    hobbyEnd: '何歳まで',
    housework: '家事・買い物',
    childcare: '育児',
    childcareStart: '育児の開始',
    childcareEnd: '育児の終了',
    schoolDays: '年間登校日数',
    schoolCommute: '通学（往復）',
  },
  stageFields: () => ({
    elemHours: '小学校',
    juniorHours: '中学校（部活含む）',
    highHours: '高校（部活・受験含む）',
    univHours: '大学・大学院',
  }),
  unitsShort: { age: '歳', hPerDay: 'h/日', hPerMonth: 'h/月', hPerYear: 'h/年', days: '日' },
};

const en: Messages = {
  numberLocale: 'en-US',
  storageKey: 'lifeisfullofthings:params:en:v1',
  defaults: DEFAULT_PARAMS_EN,
  otherLangLabel: '日本語',
  otherLangHref: '../',

  categories: {
    free: 'Free time',
    hobby: 'Hobby',
    housework: 'Chores & errands',
    childcare: 'Childcare',
    study: 'School & study',
    commute: 'Commute',
    care: 'Meals & self-care',
    sleep: 'Sleep',
    work: 'Work',
  },

  birthDate: 'Born',
  notEntered: 'Not set',
  ageUnit: 'yrs',

  overbooked: (a, more) =>
    `⚠ At age ${a}${more > 0 ? ` (and ${more} more year${more > 1 ? 's' : ''})` : ''}, the day adds up to more than 24 hours. Please adjust the settings.`,

  pieTitle: (l) => `A ${l}-year life`,
  pieAria: 'Pie chart of how a lifetime is spent',
  pieCenter: 'Free time',
  pieRingNote: (p) => `Outer ring: life so far (${p}%)`,

  lifeFree: 'Lifetime free time',
  lifeFreeSub: (l, p, y) => `${p}% of ${l} years (about ${y} years)`,
  birthHint: '↑ Enter your birth date to split your life into time spent and time left',
  restFree: 'Free time left',
  hoursWord: 'hours',
  minWord: 'm',
  secWord: 's',
  restFreeSub: (y, d) => `About ${y} years · ${d} hours a day on average from now on`,
  progressAria: (p) => `${p}% of life elapsed`,
  elapsed: (p) => `${p}% elapsed`,
  countdownPrefix: (l) => `Until ${l}: `,
  countdownH: 'h ',
  countdownM: 'm ',
  countdownS: 's',

  barsTitle: 'Time spent and time left',
  barLife: 'Lifetime',
  barUsed: 'Time spent',
  barRest: 'Time left',
  barAria: (l) => `Breakdown of ${l.toLowerCase()}`,

  ageChartTitle: 'A day at each age',
  ageChartSub: 'Tap or drag the chart to see a day at that age below (the chart averages workdays and days off)',
  ageChartAria: 'Hours per day by age',
  phaseStudent: 'School',
  phaseWorking: 'Working',
  phaseRetired: 'Retired',
  now: 'Now',

  dayTitle: (a, k) => `${k} at ${a}`,
  dayKinds: { workday: 'A workday', schoolday: 'A school day', day: 'A day', avg: 'An average day', holiday: 'A day off' },
  dayModeAvg: 'Average',
  dayModeWeekday: { workday: 'Workday', schoolday: 'School day' },
  dayModeHoliday: 'Day off',
  dayToggleAria: 'Choose the kind of day',
  dayFree: 'Free',
  dayAria: (t) => `24-hour breakdown of ${t.toLowerCase()}`,

  tableTitle: 'Totals',
  unitAria: 'Display unit',
  units: { h: 'Hours', d: 'Days', y: 'Years', '%': '%' },
  unitSuffix: { d: 'd', y: 'y' },
  tableUnit: (u) => `Unit: ${u.toLowerCase()}`,
  colLife: 'Lifetime',
  colUsed: 'Spent',
  colRest: 'Left',
  total: 'Total',

  foot: 'Categories follow the primary, secondary and tertiary activities of Japan’s Survey on Time Use and Leisure Activities. A year is counted as 365 days.',

  paramsButton: '⚙ Settings',
  paramsTitle: 'Settings',
  reset: 'Reset to defaults',
  close: 'Close',
  changedDot: 'Changed from default',
  decrease: (l) => `Decrease ${l.toLowerCase()}`,
  increase: (l) => `Increase ${l.toLowerCase()}`,
  hobbyNameLabel: 'Name',
  hobbyNamePlaceholder: 'e.g. Writing, Running',
  schoolSystemLabel: 'School system',
  schoolSystems: { us: 'US', uk: 'UK', jp: 'Japan' },
  educationLabel: 'Education',
  educationLabels: (system) =>
    system === 'uk'
      ? { junior: 'GCSEs (16)', high: 'A-levels (18)', univ: 'Bachelor’s', grad: 'Master’s' }
      : system === 'jp'
        ? { junior: 'Junior high', high: 'High school', univ: 'Bachelor’s', grad: 'Master’s' }
        : { junior: 'Middle school', high: 'High school', univ: 'Bachelor’s', grad: 'Master’s' },
  groups: {
    life: 'Life',
    body: 'Sleep, meals & self-care',
    work: 'Work',
    hobby: 'Hobby',
    home: 'Chores & childcare',
    school: 'School',
  },
  fields: {
    lifespan: 'Life expectancy',
    sleep: 'Sleep',
    meal: 'Meals',
    hygiene: 'Getting ready & bathing',
    workStart: 'Start working',
    workEnd: 'Retire',
    workDays: 'Workdays per year',
    workHours: 'Contract hours',
    overtime: 'Overtime',
    commute: 'Commute (round trip)',
    hobby: 'Time per day',
    hobbyStart: 'From age',
    hobbyEnd: 'Until age',
    housework: 'Chores & errands',
    childcare: 'Childcare',
    childcareStart: 'Childcare starts',
    childcareEnd: 'Childcare ends',
    schoolDays: 'School days per year',
    schoolCommute: 'School commute (round trip)',
  },
  stageFields: (system) =>
    system === 'uk'
      ? {
          elemHours: 'Primary (Reception–Year 6)',
          juniorHours: 'Secondary (Years 7–11)',
          highHours: 'Sixth form (Years 12–13)',
          univHours: 'University',
        }
      : system === 'jp'
        ? {
            elemHours: 'Elementary (6–12)',
            juniorHours: 'Junior high (12–15)',
            highHours: 'High school (15–18)',
            univHours: 'University',
          }
        : {
            elemHours: 'Elementary (K–5th grade)',
            juniorHours: 'Middle school (6th–8th)',
            highHours: 'High school (9th–12th)',
            univHours: 'College & grad school',
          },
  unitsShort: { age: 'yrs', hPerDay: 'h/day', hPerMonth: 'h/mo', hPerYear: 'h/yr', days: 'days' },
};

export const t: Messages = LOCALE === 'en' ? en : ja;
export const MESSAGES = { ja, en };
