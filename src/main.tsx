import { render } from 'preact';
import { App } from './App';
import { LOCALE } from './i18n';
import './styles.css';

render(<App />, document.getElementById('app')!);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // 英語版は /en/ にあるので、ルートの sw.js を登録してサイト全体をカバーする
  const swUrl = LOCALE === 'en' ? '../sw.js' : './sw.js';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}
