export function EmptyReviewLedger({ reviewCount }: { reviewCount: number }) {
  if (reviewCount > 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {reviewCount} review{reviewCount === 1 ? "" : "s"} on the ledger. Ratings
        appear only from recorded reviews — never as decoration.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm">
      <p className="font-medium">Reviews unlock after completion.</p>
      <p className="mt-1 text-muted-foreground">
        This review ledger is empty. We do not show placeholder stars or scores
        while there are no completed matters on record.
      </p>
    </div>
  );
}
