import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { categoryLabels, type Category } from './model/lifeModel';
import { t } from './i18n';

export const LabelsContext = createContext<Record<Category, string>>(categoryLabels(t.defaults, t.categories));

export function useLabel(): (key: Category) => string {
  const labels = useContext(LabelsContext);
  return (key) => labels[key];
}
