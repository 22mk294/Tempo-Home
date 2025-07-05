import { pool } from './config/database.js';

const verifyData = async () => {
  try {
    // Vérifier les utilisateurs
    const [users] = await pool.execute('SELECT id, email, type FROM users');
    console.log('👥 Utilisateurs dans la base:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.type})`);
    });
    
    // Vérifier les propriétés
    const [properties] = await pool.execute('SELECT id, title, price FROM maisons');
    console.log('\n🏠 Propriétés dans la base:');
    properties.forEach(prop => {
      console.log(`  - ${prop.title} - $${prop.price}`);
    });
    
    // Tester le hash du mot de passe admin
    const [admin] = await pool.execute('SELECT password FROM users WHERE email = ?', ['admin@tempo-home.com']);
    if (admin.length > 0) {
      console.log('\n🔑 Hash du mot de passe admin:', admin[0].password.substring(0, 30) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
};

verifyData();
