import { Select } from '@/shared/components/ui/select';
import { DASHBOARD_PERIODS, PERIOD_LABELS, type DashboardPeriod } from '../../domain';

/** Period filter for the dashboard. */
export function PeriodFilter({
  period,
  onChange,
}: {
  period: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <Select
      options={DASHBOARD_PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
      value={period}
      onChange={(e) => onChange(e.target.value as DashboardPeriod)}
      aria-label="Período"
      className="w-44"
    />
  );
}
