/**
 * Camp Alborz 2025 Production Data Seed
 *
 * Imports real 2025 data from the Alborz Master Document Excel file:
 *   - ~116+ members with season enrollments
 *   - ~158 payment transactions
 *   - Build crew assignments across 5 days
 *   - ~45 early arrival passes
 *   - ~38 DGS ticket allocations
 *   - Strike assignments
 *   - Inventory items
 *   - Budget lines
 *   - ~80+ expenses + HUBS shared costs
 *
 * Run with:  npm run seed:2025
 * Set EXCEL_PATH env var to override file location.
 *
 * Idempotent: safe to run multiple times. Uses upserts and
 * findFirst checks to avoid duplicates.
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import { readWorkbook, getSheet } from './lib/excel-reader';
import { printFinalReport } from './lib/report';

// Importers
import { importSeason } from './importers/season';
import { importMembers } from './importers/members';
import { importPayments } from './importers/payments';
import { importBuildCrew } from './importers/build-crew';
import { importEarlyArrival } from './importers/early-arrival';
import { importStrike } from './importers/strike';
import { importTickets } from './importers/tickets';
import { importInventory } from './importers/inventory';
import { importBudget } from './importers/budget';
import { importExpenses } from './importers/expenses';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log(' Camp Alborz 2025 Production Data Seed');
  console.log('========================================\n');

  // Resolve Excel file path
  const excelPath = process.env.EXCEL_PATH || path.resolve(__dirname, '../../../Alborz Master Document 2025.xlsx');
  console.log(`Reading: ${excelPath}\n`);

  // Read workbook
  const sheets = readWorkbook(excelPath);
  console.log(`Found ${sheets.size} sheets: ${[...sheets.keys()].join(', ')}\n`);

  // 1. Season
  console.log('[1/10] Importing season...');
  const season = await importSeason(prisma);

  // 2. Members + SeasonMembers
  console.log('[2/10] Importing members...');
  const alborzians = getSheet(sheets, 'Alborzians');
  if (!alborzians) throw new Error('Missing "Alborzians" sheet');
  const matcher = await importMembers(prisma, alborzians, season.id);

  // 3. Payments
  console.log('[3/10] Importing payments...');
  const duesSheet = getSheet(sheets, 'Dues + Fees Paid');
  if (duesSheet) {
    await importPayments(prisma, duesSheet, season.id, matcher);
  } else {
    console.log('  ⚠ "Dues + Fees Paid" sheet not found, skipping payments');
  }

  // 4. Build Crew
  console.log('[4/10] Importing build crew...');
  const buildSheet = getSheet(sheets, 'Build sheet');
  if (buildSheet) {
    await importBuildCrew(prisma, buildSheet, season.id, matcher);
  } else {
    console.log('  ⚠ "Build sheet" not found, skipping build crew');
  }

  // 5. Early Arrival
  console.log('[5/10] Importing early arrival passes...');
  const eaSheet = getSheet(sheets, 'Early Arrival Passes');
  if (eaSheet) {
    await importEarlyArrival(prisma, eaSheet, season.id, matcher);
  } else {
    console.log('  ⚠ "Early Arrival Passes" sheet not found, skipping');
  }

  // 6. Strike
  console.log('[6/10] Importing strike assignments...');
  await importStrike(prisma, season.id);

  // 7. Tickets (DGS)
  console.log('[7/10] Importing DGS tickets...');
  const dgsSheet = getSheet(sheets, 'DGS');
  if (dgsSheet) {
    await importTickets(prisma, dgsSheet, season.id, matcher);
  } else {
    console.log('  ⚠ "DGS" sheet not found, skipping tickets');
  }

  // 8. Inventory
  console.log('[8/10] Importing inventory...');
  const inventorySheet = getSheet(sheets, 'Inventory');
  if (inventorySheet) {
    await importInventory(prisma, inventorySheet);
  } else {
    console.log('  ⚠ "Inventory" sheet not found, skipping');
  }

  // 9. Budget
  console.log('[9/10] Importing budget...');
  const budgetSheet = getSheet(sheets, 'Budget');
  if (budgetSheet) {
    await importBudget(prisma, budgetSheet, season.id);
  } else {
    console.log('  ⚠ "Budget" sheet not found, skipping');
  }

  // 10. Expenses + HUBS
  console.log('[10/10] Importing expenses...');
  const expensesSheet = getSheet(sheets, 'Expenses');
  const hubsSheet = getSheet(sheets, 'HUBS Shared Costs');
  if (expensesSheet) {
    await importExpenses(prisma, expensesSheet, hubsSheet, season.id);
  } else {
    console.log('  ⚠ "Expenses" sheet not found, skipping');
  }

  // Final report
  printFinalReport();

  // Print database counts for verification
  console.log('Database counts:');
  console.log(`  Members:          ${await prisma.member.count()}`);
  console.log(`  Season Members:   ${await prisma.seasonMember.count()}`);
  console.log(`  Payments:         ${await prisma.payment.count()}`);
  console.log(`  Build Days:       ${await prisma.buildDay.count()}`);
  console.log(`  Build Assigns:    ${await prisma.buildAssignment.count()}`);
  console.log(`  Early Arrival:    ${await prisma.earlyArrivalPass.count()}`);
  console.log(`  Strike Assigns:   ${await prisma.strikeAssignment.count()}`);
  console.log(`  Tickets:          ${await prisma.ticket.count()}`);
  console.log(`  Inventory Items:  ${await prisma.inventoryItem.count()}`);
  console.log(`  Budget Lines:     ${await prisma.budgetLine.count()}`);
  console.log(`  Expenses:         ${await prisma.expense.count()}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
