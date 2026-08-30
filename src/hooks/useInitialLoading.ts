import { useEffect, useState } from "react";

/**
 * True only until the very first fetch settles.
 * Subsequent fetches (search, pagination, filters, refetch) are "refreshing",
 * so pages show the loading overlay instead of the page skeleton again.
 */
export function useInitialLoading(isFetching: boolean): boolean {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!isFetching) setSettled(true);
  }, [isFetching]);

  return !settled;
}
