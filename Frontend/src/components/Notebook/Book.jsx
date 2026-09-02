import Page from "./Page.jsx";

function pageAt(pages, index) 
{
  return pages[index] ?? null;
}

export default function Book({
  pages,
  compact,
  index,
  flip,
  bindLeft,
  bindRight,
  canGoBack,
  canGoForward,
}) {
  const leftIndex = compact ? index : index * 2;
  const rightIndex = compact ? index : index * 2 + 1;

  let underLeft = pageAt(pages, leftIndex);
  let underRight = pageAt(pages, rightIndex);
  let flipFront = null;
  let flipBack = null;
  let flipSide = null;

  if (flip && !compact) 
  {
    if (flip.direction === "forward") 
    {
      underRight = pageAt(pages, rightIndex + 2);
      flipFront = pageAt(pages, rightIndex);
      flipBack = pageAt(pages, rightIndex + 1);
      flipSide = "forward";
    } 
    else 
    {
      underLeft = pageAt(pages, leftIndex - 2);
      flipFront = pageAt(pages, leftIndex);
      flipBack = pageAt(pages, leftIndex - 1);
      flipSide = "back";
    }
  }

  if (flip && compact) 
  {
    if (flip.direction === "forward") 
    {
      underRight = pageAt(pages, index + 1);
      flipFront = pageAt(pages, index);
      flipBack = pageAt(pages, index + 1);
      flipSide = "forward";
    } 
    else 
    {
      underRight = pageAt(pages, index - 1);
      flipFront = pageAt(pages, index);
      flipBack = pageAt(pages, index - 1);
      flipSide = "back";
    }
  }

  const leftBind = bindLeft;
  const rightBind = bindRight;
  const flipping = Boolean(flip);
  const shade = flip ? Math.sin(flip.progress * Math.PI) : 0;

  return (
    <div className="spread" aria-hidden={false}>
      <div className="gutter" />
      <div
        className={`leaf leaf-left${leftBind.enabled && !flipping ? " is-turnable" : ""}`}
        role={leftBind.enabled ? "button" : undefined}
        tabIndex={leftBind.enabled ? 0 : -1}
        aria-label="Turn to previous page"

        onPointerDown={leftBind.onPointerDown}
        onPointerMove={leftBind.onPointerMove}
        onPointerUp={leftBind.onPointerUp}
        onPointerCancel={leftBind.onPointerUp}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") 
          {
            event.preventDefault();
            leftBind.enabled && bindLeft.onActivate?.();
          }
        }}
      >
        <Page
          page={underLeft}
          side="left"
          showCue={false}
          showBackCue={canGoBack && !flipping}
          showTape={underLeft?.id === "p-03"}
        />
      </div>
      <div
        className={`leaf leaf-right${rightBind.enabled && !flipping ? " is-turnable" : ""}`}
        role={rightBind.enabled ? "button" : undefined}
        tabIndex={rightBind.enabled ? 0 : -1}
        aria-label="Turn to next page"
        
        onPointerDown={rightBind.onPointerDown}
        onPointerMove={rightBind.onPointerMove}
        onPointerUp={rightBind.onPointerUp}
        onPointerCancel={rightBind.onPointerUp}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") 
          {
            event.preventDefault();
            rightBind.enabled && bindRight.onActivate?.();
          }
        }}
      >
        <Page
          page={underRight}
          side="right"
          showCue={canGoForward && !flipping}
          showBackCue={compact && canGoBack && !flipping}
          showTape={underRight?.id === "p-03"}
        />
      </div>
      {flip && flipFront ? (
        <div
          className={`flipper is-${flipSide}`}
          style={{
            "--flip": flip.progress,
            "--shade": shade,
          }}
        >
          <div className="flip-face front">
            <Page page={flipFront} side={flipSide === "back" ? "left" : "right"} />
            <span className="flip-shade" style={{ opacity: shade * 0.85 }} />
          </div>
          <div className="flip-face back">
            <Page page={flipBack} side={flipSide === "back" ? "right" : "left"} />
            <span className="flip-shade" style={{ opacity: shade * 0.5 }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
