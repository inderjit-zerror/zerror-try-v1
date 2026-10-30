// Letters roll up on hover while an identical row rolls in from below.
// Pure CSS: it triggers when the text itself, or any link, button or
// .roll-trigger around it, is hovered. Use on single-line text only.
export default function RollText({ text, className = "" }) {
  const chars = Array.from(text);
  const row = (key) => (
    <span className={`roll__row roll__row--${key}`} aria-hidden="true">
      {chars.map((c, i) => (
        <span key={i} className="roll__c" style={{ "--i": i }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );

  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{text}</span>
      {row("a")}
      {row("b")}
    </span>
  );
}
