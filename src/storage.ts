import type { Params } from './model/params';
import { t } from './i18n';

export function loadParams(): Params {
  try {
    const raw = localStorage.getItem(t.storageKey);
    if (raw) return { ...t.defaults, ...JSON.parse(raw) };
  } catch {
    // 保存領域が使えない環境ではデフォルトで動かす
  }
  return t.defaults;
}

export function saveParams(p: Params): void {
  try {
    localStorage.setItem(t.storageKey, JSON.stringify(p));
  } catch {
    // 無視
  }
}
