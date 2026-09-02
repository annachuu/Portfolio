export default function Cover({ variant = "front", active, onActivate }) {
  const isFront = variant === "front";
  const label = isFront ? "Open notebook" : "Open notebook from the back cover";

  return (
    <button
      type="button"
      className={`cover cover-board-${variant}${active ? " is-active" : ""}`}
      onClick={() => {
        if (active) 
          onActivate();
      }}
      tabIndex={active ? 0 : -1}
      aria-hidden={!active}
      aria-label={label}
    >
      <span className="cover-3d">
        <span className="cover-front">
          <span className="cover-grain" aria-hidden="true" />
          <span className="cover-wear" aria-hidden="true" />
          {isFront ? <span className="elastic" aria-hidden="true" /> : null}
          <span className="cover-face">
            {isFront ? (
              <>
                <span className="cover-title">Anna</span>
                <span className="cover-subtitle">things i've researched, designed, built, and broke</span>
              </>
            ) : (
              <span className="cover-plate" aria-hidden="true" />
            )}
          </span>
        </span>
        <span className="cover-inside" aria-hidden="true" />
      </span>
    </button>
  );
}
