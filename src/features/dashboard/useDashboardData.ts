import { useEffect, useMemo, useRef, useState } from "react";
import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";
import type { License } from "../../types/license";
import { getQuarries, refreshQuarries } from "../../services/quarryApi";
import { getLicenses, getOperators } from "../../services/licenseApi";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes, per spec §4

interface UseDashboardDataResult {
  quarries: Quarry[];
  operatorsById: Map<string, Operator>;
  licensesById: Map<string, License>;
  isLoading: boolean;
  lastRefreshedAt: Date | null;
}

/**
 * Loads quarries + operators + licenses through the service layer and keeps
 * quarries "live" via a simulated 5-minute refresh (status jitter, no backend).
 */
export function useDashboardData(): UseDashboardDataResult {
  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    Promise.all([getQuarries(), getOperators(), getLicenses()]).then(([q, o, l]) => {
      if (!mounted.current) return;
      setQuarries(q);
      setOperators(o);
      setLicenses(l);
      setIsLoading(false);
      setLastRefreshedAt(new Date());
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuarries().then((q) => {
        if (!mounted.current) return;
        setQuarries(q);
        setLastRefreshedAt(new Date());
      });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const operatorsById = useMemo(() => new Map(operators.map((o) => [o.id, o])), [operators]);
  const licensesById = useMemo(() => new Map(licenses.map((l) => [l.quarryId, l])), [licenses]);

  return { quarries, operatorsById, licensesById, isLoading, lastRefreshedAt };
}
