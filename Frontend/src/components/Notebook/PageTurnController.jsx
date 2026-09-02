import { useCallback, useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD = 10;
const COMPLETE_AT = 0.22;
const FLIP_MS = 820;
const COVER_MS = 1150;

function easeOutCubic(value) 
{
  return 1 - (1 - value) ** 3;
}

export function useBookNavigation({ pageCount, compact, reducedMotion }) {
  const contentCount = compact
    ? Math.max(1, pageCount)
    : Math.max(1, Math.ceil(pageCount / 2));
  const maxPosition = contentCount + 1;
  const [position, setPosition] = useState(0);
  const [flip, setFlip] = useState(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const flipRef = useRef(null);
  const pointerRef = useRef(null);
  const frameRef = useRef(0);
  const coverTimer = useRef(0);
  const widthRef = useRef(320);

  useEffect(() => {
    flipRef.current = flip;
  }, [flip]);

  useEffect(() => {
    setPosition((current) => Math.min(current, maxPosition));
  }, [maxPosition]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(coverTimer.current);
    };
  }, []);

  const view = position === 0 ? "front" : position === maxPosition ? "back" : "open";
  const spreadIndex = Math.max(0, position - 1);
  const busy = coverBusy || Boolean(flip && !flip.dragging);

  const animateTo = useCallback((from, to, onDone) => {
    cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / FLIP_MS);
      const progress = from + (to - from) * easeOutCubic(t);
      setFlip((current) =>
        current ? { ...current, progress, dragging: false } : current
      );
      if (t < 1) 
      {
        frameRef.current = requestAnimationFrame(tick);
      } 
      else 
      {
        onDone();
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  const moveCover = useCallback(
    (nextPosition) => {
      window.clearTimeout(coverTimer.current);
      setPosition(nextPosition);
      if (reducedMotion) 
      {
        setCoverBusy(false);
        return;
      }
      setCoverBusy(true);
      coverTimer.current = window.setTimeout(() => {
        setCoverBusy(false);
      }, COVER_MS);
    },
    [reducedMotion]
  );

  const finishTurn = useCallback(
    (direction) => {
      setPosition((current) =>
        direction === "forward"
          ? Math.min(maxPosition, current + 1)
          : Math.max(0, current - 1)
      );
      setFlip(null);
    },
    [maxPosition]
  );

  const startTurn = useCallback(
    (direction) => {
      if (busy) return;

      if (direction === "forward") 
      {
        if (position >= maxPosition) return;
        if (position === 0 || position === maxPosition - 1) 
        {
          moveCover(position + 1);
          return;
        }
      } 
      else 
      {
        if (position <= 0) return;
        if (position === maxPosition || position === 1) 
        {
          moveCover(position - 1);
          return;
        }
      }

      if (reducedMotion) 
      {
        finishTurn(direction);
        return;
      }

      setFlip({ direction, progress: 0, dragging: false });
      animateTo(0, 1, () => finishTurn(direction));
    },
    [
      animateTo,
      busy,
      finishTurn,
      maxPosition,
      moveCover,
      position,
      reducedMotion,
    ]
  );

  const goTo = useCallback(
    (nextPosition) => {
      if (busy) return;
      const clamped = Math.max(0, Math.min(maxPosition, nextPosition));
      if (clamped === position) return;

      const towardCover =
        clamped === 0 ||
        clamped === maxPosition ||
        position === 0 ||
        position === maxPosition;

      if (reducedMotion || Math.abs(clamped - position) !== 1 || towardCover) 
      {
        if (towardCover && Math.abs(clamped - position) === 1) 
        {
          moveCover(clamped);
          return;
        }
        setPosition(clamped);
        setFlip(null);
        return;
      }
      startTurn(clamped > position ? "forward" : "back");
    },
    [busy, maxPosition, moveCover, position, reducedMotion, startTurn]
  );

  const bindLeaf = useCallback(
    (direction, { bothDirections = false } = {}) => {
      const enabled = view === "open";

      return {
        enabled,
        onActivate() {
          startTurn(bothDirections ? "forward" : direction);
        },
        onPointerDown(event) {
          if (!enabled || busy) return;
          widthRef.current =
            event.currentTarget.getBoundingClientRect().width || 320;
          pointerRef.current = {
            id: event.pointerId,
            x: event.clientX,
            direction,
            bothDirections,
            dragging: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove(event) {
          const pointer = pointerRef.current;
          if (!pointer || pointer.id !== event.pointerId) return;
          const dx = event.clientX - pointer.x;
          if (!pointer.dragging && Math.abs(dx) < DRAG_THRESHOLD) return;

          if (!pointer.dragging) 
          {
            const inferred = dx < 0 ? "forward" : "back";
            const nextDirection = pointer.bothDirections
              ? inferred
              : pointer.direction;
            if (nextDirection === "forward" && position >= maxPosition) return;
            if (nextDirection === "back" && position <= 0) return;
            pointer.direction = nextDirection;
            pointer.dragging = true;

            const coverTurn =
              (nextDirection === "forward" &&
                (position === 0 || position === maxPosition - 1)) ||
              (nextDirection === "back" &&
                (position === maxPosition || position === 1));
            if (coverTurn || reducedMotion) return;
            setFlip({ direction: pointer.direction, progress: 0, dragging: true });
          }

          const coverTurn =
            (pointer.direction === "forward" &&
              (position === 0 || position === maxPosition - 1)) ||
            (pointer.direction === "back" &&
              (position === maxPosition || position === 1));
          if (reducedMotion || coverTurn) return;

          const width = widthRef.current;
          const progress =
            pointer.direction === "forward"
              ? Math.min(1, Math.max(0, -dx / width))
              : Math.min(1, Math.max(0, dx / width));
          setFlip({
            direction: pointer.direction,
            progress,
            dragging: true,
          });
        },
        onPointerUp(event) {
          const pointer = pointerRef.current;
          if (!pointer || pointer.id !== event.pointerId) return;
          pointerRef.current = null;

          if (!pointer.dragging) 
          {
            if (pointer.bothDirections) 
            {
              const rect = event.currentTarget.getBoundingClientRect();
              const towardEnd = (event.clientX - rect.left) / rect.width > 0.45;
              startTurn(towardEnd ? "forward" : "back");
            } 
            else 
            {
              startTurn(pointer.direction);
            }
            return;
          }

          const coverTurn =
            (pointer.direction === "forward" &&
              (position === 0 || position === maxPosition - 1)) ||
            (pointer.direction === "back" &&
              (position === maxPosition || position === 1));
          if (coverTurn) 
          {
            startTurn(pointer.direction);
            return;
          }

          const current = flipRef.current;
          const progress = current?.progress ?? 0;
          if (reducedMotion) 
          {
            if (progress > COMPLETE_AT) finishTurn(pointer.direction);
            else setFlip(null);
            return;
          }

          if (progress > COMPLETE_AT) 
          {
            setFlip({
              direction: pointer.direction,
              progress,
              dragging: false,
            });
            animateTo(progress, 1, () => finishTurn(pointer.direction));
          } 
          else 
          {
            animateTo(progress, 0, () => setFlip(null));
          }
        },
      };
    },
    [
      animateTo,
      busy,
      finishTurn,
      maxPosition,
      position,
      reducedMotion,
      startTurn,
      view,
    ]
  );

  return {
    position,
    view,
    spreadIndex,
    contentCount,
    maxPosition,
    flip,
    goTo,
    startTurn,
    bindLeaf,
    canGoForward: position < maxPosition,
    canGoBack: position > 0,
    busy,
  };
}
