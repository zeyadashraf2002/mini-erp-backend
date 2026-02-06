-- CreateIndex
CREATE INDEX "journal_entries_companyId_status_date_idx" ON "journal_entries"("companyId", "status", "date");

-- CreateIndex
CREATE INDEX "journal_lines_accountId_idx" ON "journal_lines"("accountId");
