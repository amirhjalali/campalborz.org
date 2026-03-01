export interface ImportReport {
  step: string;
  created: number;
  updated: number;
  skipped: number;
  warnings: string[];
  details?: Record<string, any>;
}

const reports: ImportReport[] = [];

export function addReport(report: ImportReport) {
  reports.push(report);

  const total = report.created + report.updated + report.skipped;
  const parts: string[] = [];
  if (report.created > 0) parts.push(`${report.created} created`);
  if (report.updated > 0) parts.push(`${report.updated} updated`);
  if (report.skipped > 0) parts.push(`${report.skipped} skipped`);

  console.log(`  [${report.step}] ${parts.join(', ') || '0 records'}`);

  if (report.details) {
    for (const [key, val] of Object.entries(report.details)) {
      console.log(`    ${key}: ${val}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log(`    ⚠ ${report.warnings.length} warning(s):`);
    for (const w of report.warnings.slice(0, 10)) {
      console.log(`      - ${w}`);
    }
    if (report.warnings.length > 10) {
      console.log(`      ... and ${report.warnings.length - 10} more`);
    }
  }
}

export function printFinalReport() {
  console.log('\n========================================');
  console.log(' SEED 2025 COMPLETE - Summary');
  console.log('========================================');

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalWarnings = 0;

  for (const r of reports) {
    totalCreated += r.created;
    totalUpdated += r.updated;
    totalSkipped += r.skipped;
    totalWarnings += r.warnings.length;
    const total = r.created + r.updated;
    console.log(`  ${r.step.padEnd(20)} ${String(total).padStart(4)} records`);
  }

  console.log('----------------------------------------');
  console.log(`  Total created:  ${totalCreated}`);
  console.log(`  Total updated:  ${totalUpdated}`);
  console.log(`  Total skipped:  ${totalSkipped}`);
  console.log(`  Warnings:       ${totalWarnings}`);
  console.log('========================================\n');

  if (totalWarnings > 0) {
    console.log('All warnings:');
    for (const r of reports) {
      for (const w of r.warnings) {
        console.log(`  [${r.step}] ${w}`);
      }
    }
    console.log('');
  }
}
