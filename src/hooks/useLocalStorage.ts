import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: unknown): Array<T> {
  
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const storeValue = (value:any) => {
    try {
      const persist = value.instanceof === Function ? value(state) : value;
      setState(persist);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(persist));
      }
    } catch (error) {
      console.log(error);
    }
  }

  return [state, storeValue]
}
