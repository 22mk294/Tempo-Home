import { pool } from './config/database.js';

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    // Try to use the database directly
    try {
      await pool.execute('USE rental_platform');
      console.log('📊 Database rental_platform: ACCESSIBLE');
      
      // Check users count
      const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
      console.log('👥 Users count:', users[0].count);
      
      // Check properties count
      const [properties] = await pool.execute('SELECT COUNT(*) as count FROM maisons');
      console.log('🏠 Properties count:', properties[0].count);
      
      // Show some sample data
      const [sampleUsers] = await pool.execute('SELECT email, type FROM users LIMIT 3');
      console.log('👤 Sample users:', sampleUsers);
      
    } catch (dbError) {
      console.log('❌ Database rental_platform not found or empty');
      console.log('🔧 Need to run: npm run db:init');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('📝 Make sure XAMPP MySQL is running and accessible');
  } finally {
    await pool.end();
  }
};

testConnection();
