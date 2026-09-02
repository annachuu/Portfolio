export default function Tabs({ count, activeIndex, onSelect }) {
  return (
    <div className="tabs" role="tablist" aria-label="Notebook sections">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          className={`tab${index === activeIndex ? " is-active" : ""}`}
          aria-selected={index === activeIndex}
          aria-label={`Go to section ${index + 1}`}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
