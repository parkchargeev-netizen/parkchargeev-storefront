ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'payment_failed';

ALTER TABLE "paytr_transactions"
  ADD COLUMN IF NOT EXISTS "failed_reason_code" varchar(40),
  ADD COLUMN IF NOT EXISTS "failed_reason_msg" text;
