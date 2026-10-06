import type { Params } from '../model/params';
import { fmt1 } from '../format';
import { LOCALE, t } from '../i18n';

interface Props {
  params: Params;
  age: number | null;
  onChange: (p: Params) => void;
}

export function Header({ params, age, onChange }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <header class="top">
      <label class="birth">
        <span>{t.birthDate}</span>
        <input
          id="birth-date"
          type="date"
          max={today}
          value={params.birthDate}
          onInput={(e) => onChange({ ...params, birthDate: e.currentTarget.value })}
        />
      </label>
      <div class="age" aria-live="polite">
        {age === null ? (
          <span class="muted">{t.notEntered}</span>
        ) : (
          <>
            <b>{fmt1(age)}</b>
            <small>{t.ageUnit}</small>
          </>
        )}
      </div>
      <a class="lang" href={t.otherLangHref} hreflang={LOCALE === 'ja' ? 'en' : 'ja'} aria-label={t.otherLangLabel}>
        {LOCALE === 'ja' ? 'EN' : 'JA'}
      </a>
    </header>
  );
}
