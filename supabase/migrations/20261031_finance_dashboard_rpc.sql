-- Migration: 20261031_finance_dashboard_rpc.sql
-- Description: Calculate finance revenue, outstanding balances, and overdue totals entirely in the database

create or replace function public.get_finance_summary()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active_subs bigint;
  v_total_subs bigint;
  v_revenue numeric;
  v_outstanding numeric;
  v_outstanding_count bigint;
  v_overdue_count bigint;
  v_overdue_amount numeric;
begin
  -- 1. Subscriptions counts
  select count(*) into v_total_subs from public.subscriptions;
  select count(*) into v_active_subs from public.subscriptions where status = 'active';

  -- 2. Total collected revenue computed directly in PostgreSQL
  select coalesce(sum(amount), 0) into v_revenue from public.payments;

  -- 3. Outstanding and Overdue balances computed via database-side aggregate
  with inv_totals as (
    select
      i.id,
      i.total,
      coalesce(sum(p.amount), 0) as paid_amount,
      greatest(0, i.total - coalesce(sum(p.amount), 0)) as balance,
      i.status,
      i.due_date
    from public.invoices i
    left join public.payments p on p.invoice_id = i.id
    where i.status in ('confirmed', 'draft')
    group by i.id, i.total, i.status, i.due_date
  )
  select
    count(*) filter (where balance > 0),
    coalesce(sum(balance), 0),
    count(*) filter (where balance > 0 and due_date < current_date),
    coalesce(sum(balance) filter (where balance > 0 and due_date < current_date), 0)
  into
    v_outstanding_count,
    v_outstanding,
    v_overdue_count,
    v_overdue_amount
  from inv_totals;

  return json_build_object(
    'active_subscriptions_count', coalesce(v_active_subs, 0),
    'total_subscriptions_count', coalesce(v_total_subs, 0),
    'total_revenue_collected', coalesce(round(v_revenue, 2), 0),
    'outstanding_balance', coalesce(round(v_outstanding, 2), 0),
    'outstanding_invoices_count', coalesce(v_outstanding_count, 0),
    'overdue_invoices_count', coalesce(v_overdue_count, 0),
    'overdue_invoices_amount', coalesce(round(v_overdue_amount, 2), 0)
  );
end;
$$;

grant execute on function public.get_finance_summary() to authenticated, anon, service_role;
