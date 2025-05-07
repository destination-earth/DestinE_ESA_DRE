import { useCallback } from "react";

export const useSessionStorage = (key: string) => {
  const setItem = useCallback(
    (value: unknown) => {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.log(error);
      }
    },
    [key],
  );

  const getItem = useCallback(() => {
    try {
      const item = window.sessionStorage.getItem(key);

      if (item) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const removeItem = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return { setItem, getItem, removeItem };
};
