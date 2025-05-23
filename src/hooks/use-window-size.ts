"use client";

import { useState, useEffect } from "react";
import throttle from "lodash/throttle";
import { usePopupStore } from "@/stores/use-popup-state";
import { useWindowSizeStore } from "@/stores/use-window-size.store";

export function useWindowSize(): {
  width: number | undefined;
  height: number | undefined;
} {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  const { popups, setRemainingScreenWidth } = usePopupStore();
  const setWindowSizeStore = useWindowSizeStore((state) => state.setSize);

  useEffect(() => {
    const updateSize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setWindowSizeStore({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const snapWidth = popups.reduce((acc, p) => {
        if (p.isOpen && p.snappedSide !== "none") {
          return acc + p.size.width;
        }
        return acc;
      }, 0);
      setRemainingScreenWidth(() => window.innerWidth - snapWidth);
    }, 200);

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
      updateSize.cancel();
    };
  }, []);

  return windowSize;
}
