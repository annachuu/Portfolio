export default function Page({ page, side, showCue, showBackCue, showTape }) {
  if (!page) 
  {
    return <div className={`sheet sheet-${side}`} aria-hidden="true" />;
  }

  return (
    <article className={`sheet sheet-${side}`} data-page-id={page.id}>
      {showTape ? <span className="tape" aria-hidden="true" /> : null}
      {showCue ? <span className="corner-cue corner-cue-next" aria-hidden="true" /> : null}
      {showBackCue ? <span className="corner-cue corner-cue-prev" aria-hidden="true" /> : null}
      <div className="sheet-content">
        <div className={`placeholder-page placeholder-${side}`}>
          <div className="placeholder-rule" />
          <span className="placeholder-mark">{String(page.id).replace("p-", "")}</span>
          {side === "right" ? (
            <span className="placeholder-note">flip pages →</span>
          ) : (
            <span className="placeholder-note">←</span>
          )}
        </div>
      </div>
    </article>
  );
}
