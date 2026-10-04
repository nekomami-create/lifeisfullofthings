import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { categoryLabels, type Category } from './model/lifeModel';
import { DEFAULT_PARAMS } from './model/params';

export const LabelsContext = createContext<Record<Category, string>>(categoryLabels(DEFAULT_PARAMS));

export function useLabel(): (key: Category) => string {
  const labels = useContext(LabelsContext);
  return (key) => labels[key];
}
