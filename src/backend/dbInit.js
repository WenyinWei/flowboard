import db from './db.js';

// Create a shorthand for the query function
const { query } = db;

async function initializeDatabase() {
  try {
    // Create workflows table
    await query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index on updated_at for faster sorting
    await query(`
      CREATE INDEX IF NOT EXISTS idx_workflows_updated_at 
      ON workflows (updated_at DESC)
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Database features will be disabled until PostgreSQL is configured properly');
  }
}

// Run database initialization
initializeDatabase();

export { initializeDatabase };