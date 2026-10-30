// Hairline row that opens every section: index, name, a rule, an aside.
export default function SectionBar({ no, label, aside, className = "" }) {
  return (
    <div className={`sbar t-label ${className}`}>
      <span className="sbar__no tnum">[{no}]</span>
      <span className="sbar__label">{label}</span>
      <span className="sbar__rule" aria-hidden="true" />
      {aside && <span className="sbar__aside">{aside}</span>}
    </div>
  );
}
