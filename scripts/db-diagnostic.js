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

async function testConnection() {
  console.log('\n🔌 TEST DE CONNEXION');
  console.log('-'.repeat(25));
  
  try {
    console.log(`📡 Tentative de connexion à ${config.host}:${config.port}...`);
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    console.log('✅ Connexion MySQL réussie');
    
    // Test de la base de données
    try {
      await connection.execute(`USE ${config.database}`);
      console.log(`✅ Base de données '${config.database}' accessible`);
      await connection.end();
      return true;
    } catch (dbError) {
      console.log(`❌ Base de données '${config.database}' non trouvée`);
      console.log(`💡 Créer la base: CREATE DATABASE ${config.database};`);
      await connection.end();
      return false;
    }
    
  } catch (error) {
    console.log('❌ Connexion MySQL échouée');
    console.log(`   Erreur: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 MySQL n\'est pas démarré - vérifier XAMPP');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Problème d\'authentification MySQL');
      console.log('   Vérifier user/password dans server/config/database.js');
    }
    
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 VÉRIFICATION DES TABLES');
  console.log('-'.repeat(30));
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Lister toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log(`📊 ${tableNames.length} tables trouvées:`);
    tableNames.forEach(table => console.log(`   📝 ${table}`));
    
    // Vérifier les tables requises
    const requiredTables = ['users', 'maisons', 'messages', 'property_views'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`\n❌ Tables manquantes: ${missingTables.join(', ')}`);
      console.log('💡 Exécuter: npm run db:init');
    } else {
      console.log('\n✅ Toutes les tables requises sont présentes');
    }
    
    // Vérifier la structure de chaque table
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`\n📋 Structure de ${table}:`);
        columns.forEach(col => {
          console.log(`   🔹 ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
    }
    
    await connection.end();
    return missingTables.length === 0;
    
  } catch (error) {
    console.log(`❌ Erreur vérification tables: ${error.message}`);
    return false;
  }
}

async function checkData() {
  console.log('\n📊 VÉRIFICATION DES DONNÉES');
  console.log('-'.repeat(30));
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Compter les enregistrements dans chaque table
    const tables = ['users', 'maisons', 'messages', 'property_views'];
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const total = count[0].count;
        
        console.log(`📈 ${table}: ${total} enregistrements`);
        
        if (table === 'users' && total > 0) {
          const [users] = await connection.execute('SELECT id, name, email, type FROM users LIMIT 3');
          console.log('   👥 Utilisateurs:');
          users.forEach(user => {
            console.log(`     • ${user.name} (${user.email}) - ${user.type}`);
          });
        }
        
        if (table === 'maisons' && total > 0) {
          const [properties] = await connection.execute('SELECT id, title, price, location FROM maisons LIMIT 3');
          console.log('   🏠 Propriétés:');
          properties.forEach(prop => {
            console.log(`     • ${prop.title} - $${prop.price} (${prop.location})`);
          });
        }
        
      } catch (tableError) {
        console.log(`❌ ${table}: Table non accessible`);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.log(`❌ Erreur vérification données: ${error.message}`);
  }
}

async function testQueries() {
  console.log('\n🔍 TEST DES REQUÊTES API');
  console.log('-'.repeat(28));
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Test requête pour /api/maisons
    console.log('📡 Test requête principale (GET /api/maisons):');
    try {
      const [properties] = await connection.execute(`
        SELECT m.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone 
        FROM maisons m 
        LEFT JOIN users u ON m.ownerId = u.id 
        LIMIT 5
      `);
      
      console.log(`✅ ${properties.length} propriétés récupérées`);
      if (properties.length > 0) {
        console.log(`   📋 Première propriété: ${properties[0].title}`);
        console.log(`   👤 Propriétaire: ${properties[0].ownerName || 'Non trouvé'}`);
      }
      
    } catch (queryError) {
      console.log(`❌ Erreur requête propriétés: ${queryError.message}`);
      if (queryError.message.includes('ownerId')) {
        console.log('💡 Colonne ownerId manquante dans table maisons');
      }
    }
    
    // Test authentification
    console.log('\n🔐 Test authentification:');
    try {
      const [adminUser] = await connection.execute(
        'SELECT * FROM users WHERE email = ? AND type = ?',
        ['admin@test.com', 'admin']
      );
      
      if (adminUser.length > 0) {
        console.log('✅ Compte admin trouvé');
        console.log(`   📧 Email: ${adminUser[0].email}`);
        console.log(`   👤 Nom: ${adminUser[0].name}`);
      } else {
        console.log('❌ Aucun compte admin trouvé');
        console.log('💡 Créer un compte admin ou exécuter npm run db:init');
      }
      
    } catch (authError) {
      console.log(`❌ Erreur test authentification: ${authError.message}`);
    }
    
    // Test messages
    console.log('\n📨 Test système de messages:');
    try {
      const [messages] = await connection.execute(`
        SELECT m.*, ma.title as propertyTitle 
        FROM messages m 
        LEFT JOIN maisons ma ON m.maisonId = ma.id 
        LIMIT 3
      `);
      
      console.log(`✅ ${messages.length} messages trouvés`);
      
    } catch (msgError) {
      console.log(`❌ Erreur requête messages: ${msgError.message}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log(`❌ Erreur test requêtes: ${error.message}`);
  }
}

async function runDatabaseDiagnostic() {
  console.log('🚀 Début du diagnostic base de données...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n🚨 DIAGNOSTIC ARRÊTÉ - Problème de connexion');
    console.log('Actions requises:');
    console.log('1. Démarrer XAMPP');
    console.log('2. Vérifier que MySQL est actif');
    console.log('3. Créer la base de données si nécessaire');
    return;
  }
  
  const tablesOk = await checkTables();
  await checkData();
  await testQueries();
  
  console.log('\n📝 RÉSUMÉ');
  console.log('='.repeat(20));
  
  if (tablesOk) {
    console.log('✅ Base de données opérationnelle');
    console.log('🎯 Toutes les tables et données sont prêtes');
    console.log('🚀 Vous pouvez démarrer l\'application');
  } else {
    console.log('⚠️ Base de données incomplète');
    console.log('🔧 Exécuter: npm run db:init');
    console.log('📋 Puis relancer ce diagnostic');
  }
  
  console.log('\n🔧 COMMANDES UTILES:');
  console.log('• Diagnostic DB: node scripts/db-diagnostic.js');
  console.log('• Initialiser DB: npm run db:init');
  console.log('• Test complet: node scripts/diagnostic.js');
}

runDatabaseDiagnostic().catch(console.error);
