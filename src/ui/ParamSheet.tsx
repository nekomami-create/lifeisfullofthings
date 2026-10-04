import { useEffect } from 'preact/hooks';
import { DEFAULT_PARAMS, EDUCATION_LABELS, type Education, type Params } from '../model/params';

type NumKey = { [K in keyof Params]: Params[K] extends number ? K : never }[keyof Params];

interface Field {
  key: NumKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

interface Group {
  title: string;
  fields: Field[];
  education?: boolean;
  hobbyName?: boolean;
}

const GROUPS: Group[] = [
  {
    title: '人生',
    fields: [{ key: 'lifespan', label: '寿命', min: 50, max: 100, step: 1, unit: '歳' }],
  },
  {
    title: '睡眠・食事・身支度',
    fields: [
      { key: 'sleep', label: '睡眠', min: 4, max: 10, step: 0.1, unit: 'h/日' },
      { key: 'meal', label: '食事', min: 0.5, max: 3, step: 0.1, unit: 'h/日' },
      { key: 'hygiene', label: '身支度・入浴・衛生', min: 0.3, max: 3, step: 0.1, unit: 'h/日' },
    ],
  },
  {
    title: '労働',
    fields: [
      { key: 'workStart', label: '就職', min: 15, max: 35, step: 1, unit: '歳' },
      { key: 'workEnd', label: '退職', min: 40, max: 85, step: 1, unit: '歳' },
      { key: 'workDays', label: '年間勤務日数', min: 100, max: 320, step: 1, unit: '日' },
      { key: 'workHours', label: '所定労働時間', min: 2, max: 12, step: 0.5, unit: 'h/日' },
      { key: 'overtime', label: '残業', min: 0, max: 100, step: 1, unit: 'h/月' },
      { key: 'commute', label: '通勤（往復）', min: 0, max: 4, step: 0.1, unit: 'h/日' },
    ],
  },
  {
    title: '趣味',
    hobbyName: true,
    fields: [
      { key: 'hobby', label: '1日の時間', min: 0, max: 8, step: 0.1, unit: 'h/日' },
      { key: 'hobbyStart', label: '何歳から', min: 0, max: 100, step: 1, unit: '歳' },
      { key: 'hobbyEnd', label: '何歳まで', min: 0, max: 100, step: 1, unit: '歳' },
    ],
  },
  {
    title: '家事・育児',
    fields: [
      { key: 'housework', label: '家事・買い物', min: 0, max: 5, step: 0.1, unit: 'h/日' },
      { key: 'childcare', label: '育児', min: 0, max: 8, step: 0.1, unit: 'h/日' },
      { key: 'childcareStart', label: '育児の開始', min: 15, max: 60, step: 1, unit: '歳' },
      { key: 'childcareEnd', label: '育児の終了', min: 15, max: 80, step: 1, unit: '歳' },
    ],
  },
  {
    title: '学業',
    education: true,
    fields: [
      { key: 'schoolDays', label: '年間登校日数', min: 150, max: 250, step: 1, unit: '日' },
      { key: 'schoolCommute', label: '通学（往復）', min: 0, max: 3, step: 0.1, unit: 'h/日' },
      { key: 'elemHours', label: '小学校', min: 3, max: 10, step: 0.5, unit: 'h/日' },
      { key: 'juniorHours', label: '中学校（部活含む）', min: 3, max: 12, step: 0.5, unit: 'h/日' },
      { key: 'highHours', label: '高校（部活・受験含む）', min: 3, max: 12, step: 0.5, unit: 'h/日' },
      { key: 'univHours', label: '大学・大学院', min: 0, max: 3000, step: 50, unit: 'h/年' },
    ],
  },
];

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
      <div class="sheet" role="dialog" aria-modal="true" aria-label="パラメータ">
        <div class="sheet-head">
          <span class="grip" />
          <h2>パラメータ</h2>
          <button
            class="ghost"
            onClick={() => onChange({ ...DEFAULT_PARAMS, birthDate: params.birthDate })}
          >
            初期値に戻す
          </button>
          <button class="close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>
        <div class="sheet-body">
          {GROUPS.map((g) => (
            <details key={g.title} open={g.title === '人生' || g.title === '労働'}>
              <summary>{g.title}</summary>
              {g.hobbyName && (
                <div class="field">
                  <label class="f-label" for="p-hobbyName">
                    名前
                  </label>
                  <input
                    id="p-hobbyName"
                    class="f-text"
                    type="text"
                    maxLength={16}
                    placeholder="例：執筆、ランニング"
                    value={params.hobbyName}
                    onInput={(e) => onChange({ ...params, hobbyName: e.currentTarget.value })}
                  />
                </div>
              )}
              {g.education && (
                <div class="field">
                  <span class="f-label">最終学歴</span>
                  <div class="seg" role="group" aria-label="最終学歴">
                    {(Object.keys(EDUCATION_LABELS) as Education[]).map((e) => (
                      <button
                        key={e}
                        aria-pressed={params.education === e}
                        onClick={() => onChange({ ...params, education: e })}
                      >
                        {EDUCATION_LABELS[e]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {g.fields.map((f) => (
                <Slider key={f.key} field={f} value={params[f.key]} onInput={(v) => set(f.key, v)} />
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
  const changed = value !== DEFAULT_PARAMS[f.key];
  return (
    <div class="field">
      <label class="f-label" for={`p-${f.key}`}>
        {f.label}
        {changed && <span class="dot" title="初期値から変更" />}
      </label>
      <div class="f-row">
        <button class="step" aria-label={`${f.label}を減らす`} onClick={() => onInput(clamp(value - f.step))}>
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
        <button class="step" aria-label={`${f.label}を増やす`} onClick={() => onInput(clamp(value + f.step))}>
          ＋
        </button>
        <output class="f-val">
          {value.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          <small>{f.unit}</small>
        </output>
      </div>
    </div>
  );
}
