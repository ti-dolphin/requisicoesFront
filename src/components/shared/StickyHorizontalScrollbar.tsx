import { Box } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface StickyHorizontalScrollbarProps {
  /**
   * Ref para o elemento que envolve o DataGrid. É usado para localizar o
   * scroller virtual da tabela e para alinhar a barra flutuante.
   */
  wrapperRef: React.RefObject<HTMLElement | null>;
}

const SCROLLER_SELECTOR = ".MuiDataGrid-virtualScroller";

/**
 * Barra de rolagem horizontal flutuante, fixada ao final da tela (viewport).
 *
 * Quando a tabela é maior que a área visível, a barra de rolagem horizontal
 * nativa do DataGrid fica no fim da tabela, obrigando o usuário a rolar a
 * página inteira para baixo para conseguir rolar lateralmente. Este componente
 * espelha esse scroll em uma barra `position: fixed` no rodapé da tela,
 * mantendo o scroll sempre acessível independentemente do tamanho da lista.
 *
 * A barra só aparece quando há overflow horizontal E quando a barra nativa
 * está fora da área visível (abaixo do viewport).
 */
const StickyHorizontalScrollbar = ({
  wrapperRef,
}: StickyHorizontalScrollbarProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [layout, setLayout] = useState({ left: 0, width: 0, show: false });

  const recompute = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      setLayout((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const hasOverflow = scroller.scrollWidth - scroller.clientWidth > 1;
    const rect = scroller.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // A barra nativa está fora da tela quando o rodapé do scroller está
    // abaixo do viewport.
    const nativeBarBelowViewport = rect.bottom > viewportHeight;
    // O scroller precisa estar ao menos parcialmente visível.
    const visibleOnScreen = rect.top < viewportHeight && rect.bottom > 0;

    const show = hasOverflow && nativeBarBelowViewport && visibleOnScreen;

    setContentWidth(scroller.scrollWidth);
    setLayout((prev) => {
      if (
        prev.left === rect.left &&
        prev.width === rect.width &&
        prev.show === show
      ) {
        return prev;
      }
      return { left: rect.left, width: rect.width, show };
    });
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onScrollerScroll = () => {
      const bar = barRef.current;
      const scroller = scrollerRef.current;
      if (bar && scroller && bar.scrollLeft !== scroller.scrollLeft) {
        bar.scrollLeft = scroller.scrollLeft;
      }
    };

    const attachScroller = (scroller: HTMLElement) => {
      scrollerRef.current = scroller;
      scroller.addEventListener("scroll", onScrollerScroll, { passive: true });
      resizeObserver.observe(scroller);
    };

    const resizeObserver = new ResizeObserver(() => recompute());
    resizeObserver.observe(wrapper);

    const initialScroller = wrapper.querySelector(
      SCROLLER_SELECTOR
    ) as HTMLElement | null;
    if (initialScroller) {
      attachScroller(initialScroller);
    }
    recompute();

    // O scroller pode ser remontado (ex.: troca de colunas/linhas). Observamos
    // mutações para reanexar os listeners e recalcular as dimensões.
    const mutationObserver = new MutationObserver(() => {
      const current = wrapper.querySelector(
        SCROLLER_SELECTOR
      ) as HTMLElement | null;
      if (current && current !== scrollerRef.current) {
        scrollerRef.current?.removeEventListener("scroll", onScrollerScroll);
        attachScroller(current);
      }
      recompute();
    });
    mutationObserver.observe(wrapper, { childList: true, subtree: true });

    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);

    return () => {
      scrollerRef.current?.removeEventListener("scroll", onScrollerScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, [wrapperRef, recompute]);

  const handleBarScroll = () => {
    const bar = barRef.current;
    const scroller = scrollerRef.current;
    if (bar && scroller && scroller.scrollLeft !== bar.scrollLeft) {
      scroller.scrollLeft = bar.scrollLeft;
    }
  };

  return (
    <Box
      ref={barRef}
      onScroll={handleBarScroll}
      sx={{
        position: "fixed",
        bottom: 0,
        left: layout.left,
        width: layout.width,
        height: 16,
        overflowX: "auto",
        overflowY: "hidden",
        display: layout.show ? "block" : "none",
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 -2px 6px rgba(0, 0, 0, 0.12)",
      }}
    >
      <Box sx={{ width: contentWidth, height: 1 }} />
    </Box>
  );
};

export default StickyHorizontalScrollbar;
