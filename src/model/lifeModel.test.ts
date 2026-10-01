import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from './params';
import {
  ageFromBirthDate,
  dayAt,
  lifeTotals,
  overbookedAges,
  sumTotals,
  totalsBetween,
  yearlyBreakdown,
} from './lifeModel';

const p = DEFAULT_PARAMS;

describe('デフォルト値で元モデルを再現する', () => {
  const t = lifeTotals(p);

  it('生涯総時間は 657,000h', () => {
    expect(sumTotals(t)).toBeCloseTo(657_000);
  });

  it.each([
    ['sleep', 191_625],
    ['care', 41_062.5 + 32_850],
    ['work', 94_600],
    ['study', 20_000],
    ['commute', 19_002.5],
  ] as const)('%s = %d', (key, expected) => {
    expect(t[key]).toBeCloseTo(expected);
  });

  it('家事＋育児は元の 1.3h/日 × 75年 と同じ総量', () => {
    expect(t.housework + t.childcare).toBeCloseTo(35_587.5);
  });

  it('自由時間は約 222,271h（元表は各項目を切り上げているので ±2）', () => {
    expect(Math.abs(t.free - 222_271)).toBeLessThanOrEqual(2);
    expect(t.free / 657_000).toBeCloseTo(0.338, 3);
  });

  it('設定が24時間を超える年齢はない', () => {
    expect(overbookedAges(p)).toEqual([]);
  });
});

describe('今で分割', () => {
  it('消費済み＋残り＝生涯', () => {
    const now = 38.4;
    const used = totalsBetween(p, 0, now);
    const rest = totalsBetween(p, now, p.lifespan);
    const life = lifeTotals(p);
    for (const k of Object.keys(life) as (keyof typeof life)[]) {
      expect(used[k] + rest[k]).toBeCloseTo(life[k]);
    }
  });

  it('寿命を超えた年齢は残り0', () => {
    expect(sumTotals(totalsBetween(p, 80, p.lifespan))).toBe(0);
  });
});

describe('年ごとの内訳', () => {
  it('長さは寿命、各年 8,760h', () => {
    const ys = yearlyBreakdown(p);
    expect(ys).toHaveLength(75);
    for (const y of ys) expect(sumTotals(y)).toBeCloseTo(8760);
  });
});

describe('平日1日', () => {
  it('現役・育児期外の平日は約2.8h自由', () => {
    const d = dayAt(p, 25);
    expect(d.kind).toBe('workday');
    expect(d.hours.work).toBeCloseTo(8 + 240 / 245);
    expect(sumTotals(d.hours)).toBeCloseTo(24);
    expect(d.hours.free).toBeCloseTo(24 - 7 - 1.5 - 1.2 - 1.0 - 1.5 - (8 + 240 / 245));
  });

  it('育児期は育児分だけ減る', () => {
    expect(dayAt(p, 35).hours.free).toBeCloseTo(dayAt(p, 25).hours.free - 1.5);
  });

  it('学生は登校日', () => {
    const d = dayAt(p, 16);
    expect(d.kind).toBe('schoolday');
    expect(d.hours.study).toBe(8);
  });
});

describe('生年月日', () => {
  it('年齢を小数で返す', () => {
    const age = ageFromBirthDate('1990-04-01', new Date(2026, 9, 1))!;
    expect(age).toBeGreaterThan(36.4);
    expect(age).toBeLessThan(36.6);
  });

  it('不正値・未来日は null', () => {
    expect(ageFromBirthDate('')).toBeNull();
    expect(ageFromBirthDate('abc')).toBeNull();
    expect(ageFromBirthDate('2999-01-01')).toBeNull();
  });
});
