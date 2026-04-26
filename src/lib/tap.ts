import type { MouseEvent, PointerEvent } from "react";

type TapProps<E extends HTMLElement> = {
  onPointerUp: (event: PointerEvent<E>) => void;
  onClick: (event: MouseEvent<E>) => void;
};

export function bindTap<E extends HTMLElement>(handler: () => void): TapProps<E> {
  let handledByPointer = false;

  return {
    onPointerUp(event) {
      if (event.pointerType === "mouse") {
        return;
      }
      handledByPointer = true;
      event.preventDefault();
      handler();
    },
    onClick(event) {
      if (handledByPointer) {
        handledByPointer = false;
        event.preventDefault();
        return;
      }
      handler();
    },
  };
}