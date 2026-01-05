import { dbUtils } from '../utils/db.js';

async function updateMathRecordsTable() {
  console.log('Updating math_practice_records table schema...');
  try {
    const tableInfo = await dbUtils.all("PRAGMA table_info(math_practice_records)");
    const columns = tableInfo.map(col => col.name);

    if (!columns.includes('total_questions')) {
      console.log('Adding total_questions column...');
      await dbUtils.run("ALTER TABLE math_practice_records ADD COLUMN total_questions INTEGER DEFAULT 0");
    }
    
    if (!columns.includes('wrong_count')) {
      console.log('Adding wrong_count column...');
      await dbUtils.run("ALTER TABLE math_practice_records ADD COLUMN wrong_count INTEGER DEFAULT 0");
    }

    if (!columns.includes('wrong_details')) {
      console.log('Adding wrong_details column...');
      await dbUtils.run("ALTER TABLE math_practice_records ADD COLUMN wrong_details TEXT");
    }

    console.log('Table schema updated successfully.');
  } catch (err) {
    console.error('Failed to update table schema:', err.message);
  } finally {
    process.exit(0);
  }
}

updateMathRecordsTable();
