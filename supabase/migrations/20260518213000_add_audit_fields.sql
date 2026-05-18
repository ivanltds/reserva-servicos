-- Migration to add audit columns for triaging process
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS audit_checklist jsonb;
