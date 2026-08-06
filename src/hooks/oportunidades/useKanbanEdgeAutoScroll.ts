import { useEffect } from "react";

const EDGE_SIZE = 80;
const MAX_SPEED = 18;

export function useKanbanEdgeAutoScroll(scrollContainerSelector: string) {
  useEffect(() => {
    let isDragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let rafId: number;

    const getContainer = () => document.querySelector(scrollContainerSelector) as HTMLElement | null;

    const tick = () => {
      if (isDragging) {
        const container = getContainer();
        if (container) {
          const rect = container.getBoundingClientRect();
          const withinBounds = pointerY >= rect.top && pointerY <= rect.bottom;
          const distanceFromLeft = pointerX - rect.left;
          const distanceFromRight = rect.right - pointerX;

          if (withinBounds && distanceFromLeft >= 0 && distanceFromLeft < EDGE_SIZE) {
            container.scrollLeft -= MAX_SPEED * (1 - distanceFromLeft / EDGE_SIZE);
          } else if (withinBounds && distanceFromRight >= 0 && distanceFromRight < EDGE_SIZE) {
            container.scrollLeft += MAX_SPEED * (1 - distanceFromRight / EDGE_SIZE);
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-rfd-drag-handle-draggable-id]")) {
        isDragging = true;
      }
    };
    const handlePointerMove = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      cancelAnimationFrame(rafId);
    };
  }, [scrollContainerSelector]);
}
