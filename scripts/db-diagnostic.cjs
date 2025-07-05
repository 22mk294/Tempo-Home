#!/usr/bin/env node

const mysql = require('mysql2/promise');

console.log('💾 DIAGNOSTIC BASE DE DONNÉES TEMPO/HOME');
console.log('='.repeat(45));

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'tempo_home'
};

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection(config);
    
    // Compter les enregistrements
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [propertyCount] = await connection.execute('SELECT COUNT(*) as count FROM maisons');
    const [messageCount] = await connection.execute('SELECT COUNT(*) as count FROM messages');
    
    console.log('✅ Base de données opérationnelle');
    console.log(`📊 ${userCount[0].count} utilisateurs`);
    console.log(`🏠 ${propertyCount[0].count} propriétés`);
    console.log(`📨 ${messageCount[0].count} messages`);
    
    // Afficher les utilisateurs
    const [users] = await connection.execute('SELECT name, email, type FROM users');
    console.log('\n👥 Comptes utilisateurs:');
    users.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.type}`);
    });
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

checkDatabase().catch(console.error);
