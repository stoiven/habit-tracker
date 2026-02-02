const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface YearRetrospectiveProps {
  year: number;
  donePct?: number;
}

const YearRetrospective = ({ year, donePct = 0 }: YearRetrospectiveProps) => {
  const monthData = MONTHS.map((month, i) => ({ month, pct: 0 }));
  return (
  <div className="bg-card rounded-sm shadow-card p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {year} Retrospective
      </h3>
      <span className="text-sm font-semibold text-foreground">{donePct}% Done</span>
    </div>
    <div className="grid grid-cols-4 gap-2 mb-4">
      {monthData.map(({ month, pct }) => (
        <div
          key={month}
          className="bg-muted/50 rounded-sm p-2 text-center"
        >
          <p className="text-[10px] font-medium text-foreground truncate">{month}</p>
          <p className="text-xs font-bold text-foreground">{pct}%</p>
          {pct > 0 && (
            <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
    <p className="text-sm text-muted-foreground italic">
      &ldquo;Consistency is the signature of greatness.&rdquo;
    </p>
  </div>
  );
};

export default YearRetrospective;
