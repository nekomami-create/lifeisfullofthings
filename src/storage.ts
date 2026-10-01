import { DEFAULT_PARAMS, type Params } from './model/params';

const KEY = 'lifeisfullofthings:params:v1';

export function loadParams(): Params {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PARAMS, ...JSON.parse(raw) };
  } catch {
    // 保存領域が使えない環境ではデフォルトで動かす
  }
  return DEFAULT_PARAMS;
}

export function saveParams(p: Params): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // 無視
  }
}
