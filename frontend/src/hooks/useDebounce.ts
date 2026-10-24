import { useEffect, useState } from 'react';

/**
 * Retarde la mise à jour d'une valeur.
 * Utile pour éviter de lancer une requête à chaque frappe au clavier.
 *
 * @param value La valeur à debouncer
 * @param delay Délai en millisecondes (par défaut 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}