import { supabase, testConnection } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database connection
 */
export const initializeDatabase = async () => {
  try {
    // Test connection
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Failed to connect to Supabase');
    }
    
    logger.info('Successfully connected to Supabase');
    
    return true;
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

/**
 * Run database migrations
 */
export const runMigrations = async () => {
  try {
    logger.info('Running database migrations...');
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get applied migrations
    const { data: appliedMigrations, error } = await supabase
      .from('migrations')
      .select('name')
      .order('applied_at', { ascending: true });
    
    if (error) {
      // If migrations table doesn't exist, create it
      if (error.code === '42P01') {
        logger.info('Creating migrations table...');
        
        await supabase.rpc('create_migrations_table');
      } else {
        throw error;
      }
    }
    
    const appliedMigrationNames = appliedMigrations?.map(m => m.name) || [];
    
    // Apply pending migrations
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.includes(file)) {
        logger.info(`Applying migration: ${file}`);
        
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute migration
        const { error: migrationError } = await supabase.rpc('run_sql', {
          sql: migrationSql
        });
        
        if (migrationError) {
          throw new Error(`Migration ${file} failed: ${migrationError.message}`);
        }
        
        // Record migration
        await supabase
          .from('migrations')
          .insert([
            {
              name: file,
              applied_at: new Date().toISOString()
            }
          ]);
        
        logger.info(`Migration ${file} applied successfully`);
      }
    }
    
    logger.info('Database migrations completed successfully');
    
    return true;
  } catch (error) {
    logger.error('Database migration error:', error);
    throw error;
  }
};

/**
 * Seed database with initial data
 */
export const seedDatabase = async () => {
  try {
    logger.info('Checking if database needs seeding...');
    
    // Check if users table is empty
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    if (count === 0) {
      logger.info('Seeding database with initial data...');
      
      // Seed admin user
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'admin',
        email: 'admin@metamind.app',
        role: 'admin',
        created_at: new Date().toISOString()
      };
      
      const { error: adminError } = await supabase
        .from('users')
        .insert([adminUser]);
      
      if (adminError) throw adminError;
      
      logger.info('Database seeded successfully');
    } else {
      logger.info('Database already contains data, skipping seed');
    }
    
    return true;
  } catch (error) {
    logger.error('Database seed error:', error);
    throw error;
  }
};