import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows a toast once per failure transition for a query.
 * Mirrors the manual try/catch toasts used on the Experts page.
 */
export function useErrorToast(isError: boolean, message: string) {
  const shown = useRef(false);

  useEffect(() => {
    if (isError && !shown.current) {
      shown.current = true;
      toast.error(message);
    }
    if (!isError) shown.current = false;
  }, [isError, message]);
}
