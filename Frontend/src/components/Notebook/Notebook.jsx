import { useCallback, useEffect, useRef } from "react";
import { useIsCompact, usePrefersReducedMotion } from "../../hooks/useMedia.js";
import Book from "./Book.jsx";
import Bookmark from "./Bookmark.jsx";
import Cover from "./Cover.jsx";
import { useBookNavigation } from "./PageTurnController.jsx";
import Tabs from "./Tabs.jsx";
import "./notebook.css";

export default function Notebook({ pages }) {
  const compact = useIsCompact("(max-width: 860px)");
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef(null);
  const tiltFrame = useRef(0);

  const {
    view,
    spreadIndex,
    contentCount,
    maxPosition,
    flip,
    goTo,
    startTurn,
    bindLeaf,
    canGoForward,
    canGoBack,
  } = useBookNavigation({
    pageCount: pages.length,
    compact,
    reducedMotion,
  });

  const closed = view !== "open";

  const onPointerMove = useCallback(
    (event) => {
      if (!closed || reducedMotion || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(tiltFrame.current);
      tiltFrame.current = requestAnimationFrame(() => {
        const node = stageRef.current;
        if (!node) return;
        node.style.setProperty("--rx", `${(py * -5).toFixed(2)}deg`);
        node.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
        node.style.setProperty("--lift", "-8px");
        node.style.setProperty("--shadow-y", "28px");
        node.style.setProperty("--shadow-alpha", "0.5");
        node.style.setProperty("--ribbon-shift", `${(px * 6).toFixed(2)}px`);
      });
    },
    [closed, reducedMotion]
  );

  const resetTilt = useCallback(() => {
    if (!stageRef.current) return;
    stageRef.current.style.setProperty("--rx", "0deg");
    stageRef.current.style.setProperty("--ry", "0deg");
    stageRef.current.style.setProperty("--lift", "0px");
    stageRef.current.style.setProperty("--shadow-y", "22px");
    stageRef.current.style.setProperty("--shadow-alpha", "0.42");
    stageRef.current.style.setProperty("--ribbon-shift", "0px");
  }, []);

  useEffect(() => {
    function onKey(event) {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight") 
      {
        event.preventDefault();
        startTurn("forward");
      } 
      else if (event.key === "ArrowLeft") 
      {
        event.preventDefault();
        startTurn("back");
      } 
      else if (event.key === "Home") 
      {
        event.preventDefault();
        goTo(0);
      } 
      else if (event.key === "End") 
      {
        event.preventDefault();
        goTo(maxPosition);
      } 
      else if (event.key === "Enter" || event.key === " ") 
      {
        if (view === "front") 
        {
          event.preventDefault();
          startTurn("forward");
        } 
        else if (view === "back") 
        {
          event.preventDefault();
          startTurn("back");
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, maxPosition, startTurn, view]);

  const leftBind = bindLeaf("back");
  const rightBind = bindLeaf("forward", { bothDirections: compact });

  const liveLabel =
    view === "front"
      ? "Front cover"
      : view === "back"
        ? "Back cover"
        : compact
          ? `Page ${spreadIndex + 1} of ${contentCount}`
          : `Spread ${spreadIndex + 1} of ${contentCount}`;

  return (
    <div
      id="notebook"
      ref={stageRef}
      className={`notebook-stage view-${view}${closed ? "" : " is-open"}${reducedMotion ? " is-reduced" : ""}`}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="notebook-shadow" aria-hidden="true" />
      <div
        className={`notebook view-${view}${compact ? " is-compact" : ""}${reducedMotion ? " is-reduced" : ""}`}
        role="region"
        aria-label="Sketchbook"
      >
        <div className="boards" aria-hidden="true" />
        <div className="page-edges left" />
        <div className="page-edges" />
        <Bookmark />
        <div className="spread-clip">
          <Book
            pages={pages}
            compact={compact}
            index={view === "back" ? contentCount - 1 : Math.max(0, spreadIndex)}
            flip={flip}
            bindLeft={leftBind}
            bindRight={rightBind}
            canGoBack={view === "open" && canGoBack}
            canGoForward={view === "open" && canGoForward}
          />
        </div>
        <Cover
          variant="front"
          active={view === "front"}
          onActivate={() => startTurn("forward")}
        />
        <Cover
          variant="back"
          active={view === "back"}
          onActivate={() => startTurn("back")}
        />
        {view === "open" ? (
          <Tabs
            count={contentCount}
            activeIndex={spreadIndex}
            onSelect={(index) => goTo(index + 1)}
          />
        ) : null}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {liveLabel}
      </p>
    </div>
  );
}
