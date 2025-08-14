import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flowboard',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
    console.log('Database features will be disabled until PostgreSQL is configured properly');
  } else {
    console.log('Successfully connected to PostgreSQL database');
  }
});

export default {
  query: (text, params) => {
    // Return a rejected promise if pool is not available
    if (!pool) {
      return Promise.reject(new Error('Database connection not available'));
    }
    return pool.query(text, params);
  },
};