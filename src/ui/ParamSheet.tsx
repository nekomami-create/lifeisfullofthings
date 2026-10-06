import { useEffect } from 'preact/hooks';
import type { Params, SchoolSystem } from '../model/params';
import { EDUCATION_OPTIONS, effectiveEducation } from '../model/lifeModel';
import { t } from '../i18n';

type NumKey = { [K in keyof Params]: Params[K] extends number ? K : never }[keyof Params];
type UnitKind = keyof typeof t.unitsShort;

interface FieldDef {
  key: NumKey;
  min: number;
  max: number;
  step: number;
  unit: UnitKind;
}

interface Field extends FieldDef {
  label: string;
}

interface GroupDef {
  id: keyof typeof t.groups;
  fields: FieldDef[];
  education?: boolean;
  hobbyName?: boolean;
}

const GROUPS: GroupDef[] = [
  { id: 'life', fields: [{ key: 'lifespan', min: 50, max: 100, step: 1, unit: 'age' }] },
  {
    id: 'body',
    fields: [
      { key: 'sleep', min: 4, max: 10, step: 0.1, unit: 'hPerDay' },
      { key: 'meal', min: 0.5, max: 3, step: 0.1, unit: 'hPerDay' },
      { key: 'hygiene', min: 0.3, max: 3, step: 0.1, unit: 'hPerDay' },
    ],
  },
  {
    id: 'work',
    fields: [
      { key: 'workStart', min: 15, max: 35, step: 1, unit: 'age' },
      { key: 'workEnd', min: 40, max: 85, step: 1, unit: 'age' },
      { key: 'workDays', min: 100, max: 320, step: 1, unit: 'days' },
      { key: 'workHours', min: 2, max: 12, step: 0.5, unit: 'hPerDay' },
      { key: 'overtime', min: 0, max: 100, step: 1, unit: 'hPerMonth' },
      { key: 'commute', min: 0, max: 4, step: 0.1, unit: 'hPerDay' },
    ],
  },
  {
    id: 'hobby',
    hobbyName: true,
    fields: [
      { key: 'hobby', min: 0, max: 8, step: 0.1, unit: 'hPerDay' },
      { key: 'hobbyStart', min: 0, max: 100, step: 1, unit: 'age' },
      { key: 'hobbyEnd', min: 0, max: 100, step: 1, unit: 'age' },
    ],
  },
  {
    id: 'home',
    fields: [
      { key: 'housework', min: 0, max: 5, step: 0.1, unit: 'hPerDay' },
      { key: 'childcare', min: 0, max: 8, step: 0.1, unit: 'hPerDay' },
      { key: 'childcareStart', min: 15, max: 60, step: 1, unit: 'age' },
      { key: 'childcareEnd', min: 15, max: 80, step: 1, unit: 'age' },
    ],
  },
  {
    id: 'school',
    education: true,
    fields: [
      { key: 'schoolDays', min: 150, max: 250, step: 1, unit: 'days' },
      { key: 'schoolCommute', min: 0, max: 3, step: 0.1, unit: 'hPerDay' },
      { key: 'elemHours', min: 3, max: 10, step: 0.5, unit: 'hPerDay' },
      { key: 'juniorHours', min: 3, max: 12, step: 0.5, unit: 'hPerDay' },
      { key: 'highHours', min: 3, max: 12, step: 0.5, unit: 'hPerDay' },
      { key: 'univHours', min: 0, max: 3000, step: 50, unit: 'hPerYear' },
    ],
  },
];

/** 制度を切り替えたときの年間登校日数の目安 */
const SCHOOL_DAYS: Record<SchoolSystem, number> = { jp: 200, us: 180, uk: 190 };

interface Props {
  open: boolean;
  params: Params;
  onChange: (p: Params) => void;
  onClose: () => void;
}

export function ParamSheet({ open, params, onChange, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const systems = Object.keys(t.schoolSystems) as SchoolSystem[];
  const eduLabels = t.educationLabels(params.schoolSystem);
  const fieldLabels = { ...t.fields, ...t.stageFields(params.schoolSystem) };

  const set = (key: NumKey, v: number) => {
    const next = { ...params, [key]: v };
    // 前後関係が逆転しないよう相方を押し出す
    if (key === 'workStart' && next.workEnd <= v) next.workEnd = v + 1;
    if (key === 'workEnd' && next.workStart >= v) next.workStart = v - 1;
    if (key === 'childcareStart' && next.childcareEnd < v) next.childcareEnd = v;
    if (key === 'childcareEnd' && next.childcareStart > v) next.childcareStart = v;
    if (key === 'hobbyStart' && next.hobbyEnd < v) next.hobbyEnd = v;
    if (key === 'hobbyEnd' && next.hobbyStart > v) next.hobbyStart = v;
    onChange(next);
  };

  return (
    <div class={`sheet-root${open ? ' open' : ''}`} aria-hidden={!open}>
      <div class="scrim" onClick={onClose} />
      <div class="sheet" role="dialog" aria-modal="true" aria-label={t.paramsTitle}>
        <div class="sheet-head">
          <span class="grip" />
          <h2>{t.paramsTitle}</h2>
          <button
            class="ghost"
            onClick={() => onChange({ ...t.defaults, birthDate: params.birthDate })}
          >
            {t.reset}
          </button>
          <button class="close" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
        </div>
        <div class="sheet-body">
          {GROUPS.map((g) => (
            <details key={g.id} open={g.id === 'life' || g.id === 'work'}>
              <summary>{t.groups[g.id]}</summary>
              {g.hobbyName && (
                <div class="field">
                  <label class="f-label" for="p-hobbyName">
                    {t.hobbyNameLabel}
                  </label>
                  <input
                    id="p-hobbyName"
                    class="f-text"
                    type="text"
                    maxLength={16}
                    placeholder={t.hobbyNamePlaceholder}
                    value={params.hobbyName}
                    onInput={(e) => onChange({ ...params, hobbyName: e.currentTarget.value })}
                  />
                </div>
              )}
              {g.education && systems.length > 1 && (
                <div class="field">
                  <span class="f-label">{t.schoolSystemLabel}</span>
                  <div class="seg" role="group" aria-label={t.schoolSystemLabel}>
                    {systems.map((sys) => (
                      <button
                        key={sys}
                        aria-pressed={params.schoolSystem === sys}
                        onClick={() =>
                          onChange({ ...params, schoolSystem: sys, schoolDays: SCHOOL_DAYS[sys] })
                        }
                      >
                        {t.schoolSystems[sys]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {g.education && (
                <div class="field">
                  <span class="f-label">{t.educationLabel}</span>
                  <div class="seg wrap" role="group" aria-label={t.educationLabel}>
                    {EDUCATION_OPTIONS[params.schoolSystem].map((e) => (
                      <button
                        key={e}
                        aria-pressed={effectiveEducation(params) === e}
                        onClick={() => onChange({ ...params, education: e })}
                      >
                        {eduLabels[e]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {g.fields.map((f) => (
                <Slider
                  key={f.key}
                  field={{ ...f, label: fieldLabels[f.key] ?? f.key }}
                  value={params[f.key]}
                  onInput={(v) => set(f.key, v)}
                />
              ))}
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slider({ field: f, value, onInput }: { field: Field; value: number; onInput: (v: number) => void }) {
  const decimals = f.step < 1 ? 1 : 0;
  const clamp = (v: number) => Math.min(f.max, Math.max(f.min, Number(v.toFixed(decimals))));
  const changed = value !== t.defaults[f.key];
  return (
    <div class="field">
      <label class="f-label" for={`p-${f.key}`}>
        {f.label}
        {changed && <span class="dot" title={t.changedDot} />}
      </label>
      <div class="f-row">
        <button class="step" aria-label={t.decrease(f.label)} onClick={() => onInput(clamp(value - f.step))}>
          −
        </button>
        <input
          id={`p-${f.key}`}
          type="range"
          min={f.min}
          max={f.max}
          step={f.step}
          value={value}
          onInput={(e) => onInput(clamp(Number(e.currentTarget.value)))}
        />
        <button class="step" aria-label={t.increase(f.label)} onClick={() => onInput(clamp(value + f.step))}>
          ＋
        </button>
        <output class="f-val">
          {value.toLocaleString(t.numberLocale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          <small>{t.unitsShort[f.unit]}</small>
        </output>
      </div>
    </div>
  );
}
