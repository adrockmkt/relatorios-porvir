alter table reports
  drop constraint if exists reports_period_type_check;

alter table reports
  add constraint reports_period_type_check
  check (period_type in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual'));
