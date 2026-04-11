import * as ExcelJS from 'exceljs';
import * as path from 'path';

async function run() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Scope');
  sheet.addRow(['Requirement Name', 'Req Description', 'Input Type']);
  sheet.addRow(['Access Review', 'Check user access logs', 'Multiple Choice']);
  sheet.addRow(['Firewall Audit', 'Review firewall rules', 'Free Text']);
  
  const filePath = path.join(process.cwd(), 'test_scope.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created at ${filePath}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
