import { dayAt, sumTotals, totalsBetween, type Totals } from '../model/lifeModel';
import type { Params } from '../model/params';
import { fmt1 } from '../format';

interface Props {
  params: Params;
  life: Totals;
  age: number | null;
  rest: Totals | null;
}

const pct = (v: number, total: number) => `${fmt1((v / total) * 100)}%`;

export function Insights({ params, life, age, rest }: Props) {
  const total = sumTotals(life);
  const upkeep = life.care + life.housework + life.childcare + life.commute;
  const items: { head: string; body: string }[] = [];

  if (life.work > 0) {
    items.push({
      head: `労働は人生の ${pct(life.work, total)}`,
      body: `約${Math.round(total / life.work)}分の1。寝ている時間（${pct(life.sleep, total)}）の方が多い。`,
    });
  }
  items.push({
    head: `睡眠と生活維持で ${pct(life.sleep + upkeep, total)}`,
    body: `睡眠 ${pct(life.sleep, total)} に、食事・身支度・家事・育児・移動の ${pct(upkeep, total)} が乗る。`,
  });
  if (life.study > 0 && life.work > 0) {
    items.push({
      head: `勉強：仕事 ＝ 1 : ${fmt1(life.work / life.study)}`,
      body: `学生時代の学習 ${Math.round(life.study / 1000)}千時間に対して、労働は ${Math.round(life.work / 1000)}千時間。`,
    });
  }

  // 現役期の平日と老後の1日を比べる
  const midWork = Math.floor((params.workStart + Math.min(params.workEnd, params.lifespan)) / 2);
  if (params.workEnd > params.workStart && midWork < params.lifespan) {
    const work = dayAt(params, midWork).hours.free;
    const after = params.workEnd < params.lifespan ? dayAt(params, params.workEnd).hours.free : null;
    items.push({
      head: `現役の平日の自由は ${fmt1(Math.max(0, work))}時間`,
      body:
        after !== null
          ? `${midWork}歳の出勤日の場合。退職後は1日 ${fmt1(after)}時間になり、自由時間は老後に偏る。`
          : `${midWork}歳の出勤日の場合。通勤や家事を削るのが一番効くレバー。`,
    });
  }

  if (age !== null && age < params.workEnd && rest && rest.free > 0 && params.workEnd < params.lifespan) {
    const afterRetire = totalsBetween(params, params.workEnd, params.lifespan).free;
    items.push({
      head: `残りの自由時間の ${pct(afterRetire, rest.free)} は退職後`,
      body: `${params.workEnd}歳以降に受け取る分。今使える自由は思ったより少ない。`,
    });
  }

  return (
    <ol class="insights">
      {items.map((it) => (
        <li key={it.head}>
          <b>{it.head}</b>
          <span>{it.body}</span>
        </li>
      ))}
    </ol>
  );
}
