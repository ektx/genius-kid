import { dbUtils } from '../utils/db.js';

async function fixSchema() {
  console.log('Checking for missing columns...');
  try {
    const tableInfo = await dbUtils.all("PRAGMA table_info(users)");
    const hasEmail = tableInfo.some(col => col.name === 'email');

    if (!hasEmail) {
      console.log('Adding missing email column to users table...');
      await dbUtils.run("ALTER TABLE users ADD COLUMN email TEXT UNIQUE");
      console.log('Email column added successfully.');
    } else {
      console.log('Email column already exists.');
    }
  } catch (err) {
    console.error('Failed to fix schema:', err.message);
  } finally {
    process.exit(0);
  }
}

fixSchema();
