export type Education = 'junior' | 'high' | 'univ' | 'grad';

export interface Params {
  /** 生年月日 YYYY-MM-DD。空なら「今」を使わない */
  birthDate: string;
  lifespan: number;

  sleep: number; // h/日
  meal: number; // h/日
  hygiene: number; // h/日

  hobbyName: string; // 趣味の名前（自由記述）
  hobby: number; // h/日（期間中は毎日）
  hobbyStart: number;
  hobbyEnd: number;

  housework: number; // 家事・買い物 h/日（全期間）
  childcare: number; // 育児 h/日（育児期のみ）
  childcareStart: number;
  childcareEnd: number;

  workStart: number;
  workEnd: number;
  workDays: number; // 日/年
  workHours: number; // h/日
  overtime: number; // h/月
  commute: number; // 往復 h/日

  education: Education;
  schoolDays: number; // 日/年
  schoolCommute: number; // 往復 h/日
  elemHours: number; // h/日
  juniorHours: number; // h/日
  highHours: number; // h/日
  univHours: number; // h/年
}

export const DEFAULT_PARAMS: Params = {
  birthDate: '',
  lifespan: 75,

  sleep: 7,
  meal: 1.5,
  hygiene: 1.2,

  // 趣味は初期値0。自由時間の中から切り出して色分けする
  hobbyName: '',
  hobby: 0,
  hobbyStart: 20,
  hobbyEnd: 75,

  // 元モデルの「家事・育児 1.3h/日 × 75年」と同じ総量になるよう分割
  // 1.0h × 75年 + 1.5h × 15年 = 35,587.5h
  housework: 1.0,
  childcare: 1.5,
  childcareStart: 30,
  childcareEnd: 45,

  workStart: 22,
  workEnd: 65,
  workDays: 245,
  workHours: 8,
  overtime: 20,
  commute: 1.5,

  education: 'univ',
  schoolDays: 200,
  schoolCommute: 1.0,
  elemHours: 5,
  juniorHours: 7,
  highHours: 8,
  univHours: 1250,
};

export const EDUCATION_LABELS: Record<Education, string> = {
  junior: '中卒',
  high: '高卒',
  univ: '大卒',
  grad: '院卒',
};
