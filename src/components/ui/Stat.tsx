interface StatProps {
  value: string;
  label: string;
}

export function Stat({ value, label }: StatProps) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
