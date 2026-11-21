const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runSeed() {
  console.log('[WWIL Migration] Starting database schema & seed execution...');

  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const seedPath = path.join(__dirname, '../seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('[WWIL Migration] Running schema.sql DDL...');
    await pool.query(schemaSql);
    console.log('[WWIL Migration] Schema created successfully.');

    console.log('[WWIL Migration] Running seed.sql DML...');
    await pool.query(seedSql);
    console.log('[WWIL Migration] Seed records inserted successfully.');

    console.log('[WWIL Migration] Completed! Database is fully initialized.');
  } catch (error) {
    console.error('[WWIL Migration Error]:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
