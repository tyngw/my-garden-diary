import type { MouseEvent, PointerEvent } from "react";

type TapProps<E extends HTMLElement> = {
  onPointerUp: (event: PointerEvent<E>) => void;
  onClick: (event: MouseEvent<E>) => void;
};

let lastPointerHandledAt = 0;

export function bindTap<E extends HTMLElement>(handler: () => void): TapProps<E> {
  return {
    onPointerUp(event) {
      if (event.pointerType === "mouse") {
        return;
      }
      lastPointerHandledAt = Date.now();
      event.preventDefault();
      handler();
    },
    onClick(event) {
      // Ignore synthetic click that follows touch/pen pointerup on iOS.
      if (Date.now() - lastPointerHandledAt < 500) {
        event.preventDefault();
        return;
      }
      handler();
    },
  };
}