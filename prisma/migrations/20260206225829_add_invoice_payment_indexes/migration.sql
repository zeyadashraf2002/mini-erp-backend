-- CreateIndex
CREATE INDEX "invoices_companyId_createdAt_idx" ON "invoices"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_companyId_createdAt_idx" ON "payments"("companyId", "createdAt");
