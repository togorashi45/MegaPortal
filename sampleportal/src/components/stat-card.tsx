export function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <article className="stat-card">
      <p className="title">{title}</p>
      <p className="value">{value}</p>
      {note ? <p className="note muted">{note}</p> : null}
    </article>
  );
}
