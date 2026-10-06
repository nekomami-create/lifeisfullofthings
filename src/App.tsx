import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  ageFromBirthDate,
  lifeTotals,
  overbookedAges,
  totalsBetween,
} from './model/lifeModel';
import type { Params } from './model/params';
import { loadParams, saveParams } from './storage';
import type { Unit } from './format';
import { t } from './i18n';
import { Header } from './ui/Header';
import { SummaryCard } from './ui/SummaryCard';
import { LifeBars } from './ui/LifeBars';
import { AgeChart } from './ui/AgeChart';
import { DayBreakdownView } from './ui/DayBreakdownView';
import { TotalsTable } from './ui/TotalsTable';
import { LifePie } from './ui/LifePie';
import { LabelsContext } from './labels';
import { categoryLabels } from './model/lifeModel';
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

  const labels = useMemo(() => categoryLabels(params, t.categories), [params]);

  return (
    <LabelsContext.Provider value={labels}>
      <Header params={params} age={rawAge} onChange={setParams} />
      <main>
        {overbooked.length > 0 && (
          <p class="warn" role="alert">
            {t.overbooked(overbooked[0], overbooked.length - 1)}
          </p>
        )}

        <LifePie params={params} life={life} age={age} />

        <SummaryCard
          params={params}
          age={age}
          life={life}
          rest={rest}
          restFreeLive={age === null ? null : totalsBetween(params, age, params.lifespan).free}
        />

        <section class="card">
          <h2 class="mb">{t.barsTitle}</h2>
          <LifeBars life={life} used={used} rest={rest} />
        </section>

        <section class="card">
          <h2>{t.ageChartTitle}</h2>
          <p class="sub">{t.ageChartSub}</p>
          <AgeChart params={params} age={age} focusAge={focusAge} onPick={setPickedAge} />
          <DayBreakdownView params={params} age={focusAge} />
        </section>

        <section class="card">
          <div class="card-head">
            <h2>{t.tableTitle}</h2>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <TotalsTable life={life} used={used} rest={rest} unit={unit} />
        </section>

        <p class="foot">
          {t.foot}
          <br />
          <a href={t.otherLangHref}>{t.otherLangLabel}</a>
        </p>
      </main>

      <button class="fab" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
        {t.paramsButton}
      </button>
      <ParamSheet
        open={sheetOpen}
        params={params}
        onChange={setParams}
        onClose={() => setSheetOpen(false)}
      />
    </LabelsContext.Provider>
  );
}

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  const units: Unit[] = ['h', 'd', 'y', '%'];
  return (
    <div class="seg" role="group" aria-label={t.unitAria}>
      {units.map((u) => (
        <button key={u} aria-pressed={u === unit} onClick={() => onChange(u)}>
          {t.units[u]}
        </button>
      ))}
    </div>
  );
}
