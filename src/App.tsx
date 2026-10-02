import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  ageFromBirthDate,
  lifeTotals,
  overbookedAges,
  totalsBetween,
} from './model/lifeModel';
import type { Params } from './model/params';
import { loadParams, saveParams } from './storage';
import { UNIT_LABELS, type Unit } from './format';
import { Header } from './ui/Header';
import { SummaryCard } from './ui/SummaryCard';
import { LifeBars } from './ui/LifeBars';
import { AgeChart } from './ui/AgeChart';
import { DayBreakdownView } from './ui/DayBreakdownView';
import { TotalsTable } from './ui/TotalsTable';
import { LifePie } from './ui/LifePie';
import { ParamSheet } from './ui/ParamSheet';

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function App() {
  const [params, setParams] = useState<Params>(loadParams);
  const [unit, setUnit] = useState<Unit>('h');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedAge, setPickedAge] = useState<number | null>(null);
  const now = useNow(1000);

  useEffect(() => saveParams(params), [params]);

  const rawAge = ageFromBirthDate(params.birthDate, now);
  const age = rawAge === null ? null : Math.min(rawAge, params.lifespan);

  const life = useMemo(() => lifeTotals(params), [params]);
  // 1秒ごとに更新されるので、年齢は日単位に丸めてから集計する
  const ageKey = age === null ? null : Math.floor(age * 365) / 365;
  const used = useMemo(
    () => (ageKey === null ? null : totalsBetween(params, 0, ageKey)),
    [params, ageKey],
  );
  const rest = useMemo(
    () => (ageKey === null ? null : totalsBetween(params, ageKey, params.lifespan)),
    [params, ageKey],
  );
  const overbooked = useMemo(() => overbookedAges(params), [params]);

  const focusAge = Math.min(
    Math.floor(pickedAge ?? age ?? 40),
    Math.ceil(params.lifespan) - 1,
  );

  return (
    <>
      <Header params={params} age={rawAge} onChange={setParams} />
      <main>
        {overbooked.length > 0 && (
          <p class="warn" role="alert">
            ⚠ {overbooked[0]}歳{overbooked.length > 1 ? `ほか${overbooked.length - 1}年` : ''}
            は1日の合計が24時間を超えています。パラメータを見直してください。
          </p>
        )}

        <LifePie params={params} life={life} age={age} />

        <SummaryCard params={params} age={age} now={now} life={life} rest={rest} />

        <section class="card">
          <h2 class="mb">消費した時間と残りの時間</h2>
          <LifeBars life={life} used={used} rest={rest} />
        </section>

        <section class="card">
          <h2>年齢ごとの1日の使い方</h2>
          <p class="sub">グラフをタップ・なぞると、その年齢の平日を下に表示</p>
          <AgeChart params={params} age={age} focusAge={focusAge} onPick={setPickedAge} />
          <DayBreakdownView params={params} age={focusAge} />
        </section>

        <section class="card">
          <div class="card-head">
            <h2>集計表</h2>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <TotalsTable life={life} used={used} rest={rest} unit={unit} />
        </section>

        <p class="foot">
          分類は総務省「社会生活基本調査」の1次・2次・3次活動に準拠。1年＝365日で計算。
        </p>
      </main>

      <button class="fab" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
        ⚙ パラメータ
      </button>
      <ParamSheet
        open={sheetOpen}
        params={params}
        onChange={setParams}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  const units: Unit[] = ['h', 'd', 'y', '%'];
  return (
    <div class="seg" role="group" aria-label="表示単位">
      {units.map((u) => (
        <button key={u} aria-pressed={u === unit} onClick={() => onChange(u)}>
          {UNIT_LABELS[u]}
        </button>
      ))}
    </div>
  );
}
