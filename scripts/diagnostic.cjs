#!/usr/bin/env node

const http = require('http');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

console.log('🔍 DIAGNOSTIC COMPLET DE LA PLATEFORME TEMPO/HOME');
console.log('='.repeat(60));

// Configuration
const config = {
  backend: {
    host: 'localhost',
    port: 8888
  },
  frontend: {
    host: 'localhost',
    port: 5173
  },
  database: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'tempo_home'
  }
};

// Fonction utilitaire pour vérifier un port
function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve({
        status: 'success',
        code: res.statusCode,
        message: `✅ Port ${port} accessible`
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'error',
        code: err.code,
        message: `❌ Port ${port} inaccessible: ${err.message}`
      });
    });

    req.on('timeout', () => {
      resolve({
        status: 'error',
        code: 'TIMEOUT',
        message: `⏱️ Port ${port} timeout - service probablement arrêté`
      });
    });

    req.end();
  });
}

// Fonction pour vérifier l'API
function checkAPI(endpoint) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: config.backend.host,
      port: config.backend.port,
      path: endpoint,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: 'success',
            code: res.statusCode,
            message: `✅ API ${endpoint} fonctionne`,
            data: Array.isArray(jsonData) ? `${jsonData.length} éléments retournés` : 'Réponse valide'
          });
        } catch (e) {
          resolve({
            status: 'warning',
            code: res.statusCode,
            message: `⚠️ API ${endpoint} répond mais format JSON invalide`,
            data: data.substring(0, 100) + '...'
          });
        }
      });
    });

    req.on('error', (err) => {
      let diagnosis = '';
      switch(err.code) {
        case 'ECONNREFUSED':
          diagnosis = 'Le serveur backend n\'est pas démarré';
          break;
        case 'ENOTFOUND':
          diagnosis = 'Nom d\'hôte non résolu';
          break;
        default:
          diagnosis = 'Problème de réseau';
      }
      
      resolve({
        status: 'error',
        code: err.code,
        message: `❌ API ${endpoint} erreur: ${err.message}`,
        suggestion: diagnosis
      });
    });

    req.on('timeout', () => {
      resolve({
        status: 'error',
        code: 'TIMEOUT',
        message: `⏱️ API ${endpoint} timeout`,
        suggestion: 'Le serveur backend est lent ou bloqué'
      });
    });

    req.end();
  });
}

// Fonction pour vérifier la base de données
async function checkDatabase() {
  try {
    const connection = await mysql.createConnection(config.database);
    
    // Test de connexion
    await connection.execute('SELECT 1');
    
    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    const requiredTables = ['users', 'maisons', 'messages', 'property_views'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    // Vérifier les données
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [propertyCount] = await connection.execute('SELECT COUNT(*) as count FROM maisons');
    const [messageCount] = await connection.execute('SELECT COUNT(*) as count FROM messages');
    
    await connection.end();
    
    return {
      status: missingTables.length === 0 ? 'success' : 'warning',
      message: missingTables.length === 0 
        ? '✅ Base de données opérationnelle' 
        : `⚠️ Tables manquantes: ${missingTables.join(', ')}`,
      details: {
        tables: `${tableNames.length} tables trouvées: ${tableNames.join(', ')}`,
        users: `${userCount[0].count} utilisateurs`,
        properties: `${propertyCount[0].count} propriétés`,
        messages: `${messageCount[0].count} messages`
      },
      suggestion: missingTables.length > 0 ? 'Exécuter: npm run db:init' : null
    };
    
  } catch (error) {
    let suggestion = '';
    switch(error.code) {
      case 'ECONNREFUSED':
        suggestion = 'XAMPP/MySQL n\'est pas démarré';
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        suggestion = 'Problème d\'authentification MySQL';
        break;
      default:
        suggestion = 'Vérifier la configuration de la base de données';
    }
    
    return {
      status: 'error',
      message: `❌ Erreur base de données: ${error.message}`,
      suggestion: suggestion
    };
  }
}

// Fonction principale de diagnostic
async function runDiagnostic() {
  console.log('\n🔍 DIAGNOSTIC RAPIDE');
  console.log('-'.repeat(25));
  
  // 1. Vérifier la base de données
  console.log('1️⃣ Base de données...');
  const dbCheck = await checkDatabase();
  console.log(`   ${dbCheck.message}`);
  if (dbCheck.suggestion) {
    console.log(`   💡 ${dbCheck.suggestion}`);
  }
  
  // 2. Vérifier le backend
  console.log('\n2️⃣ Serveur backend...');
  const backendCheck = await checkPort(config.backend.host, config.backend.port);
  console.log(`   ${backendCheck.message}`);
  
  if (backendCheck.status === 'success') {
    console.log('   🔍 Test API...');
    const apiCheck = await checkAPI('/api/maisons');
    console.log(`   ${apiCheck.message}`);
    if (apiCheck.suggestion) {
      console.log(`   💡 ${apiCheck.suggestion}`);
    }
  }
  
  // 3. Vérifier le frontend
  console.log('\n3️⃣ Serveur frontend...');
  const frontendCheck = await checkPort(config.frontend.host, config.frontend.port);
  console.log(`   ${frontendCheck.message}`);
  
  // 4. Résumé
  console.log('\n📊 RÉSUMÉ');
  console.log('='.repeat(15));
  
  if (dbCheck.status !== 'success') {
    console.log('🚨 PROBLÈME: Base de données');
    console.log('   → Démarrer XAMPP et exécuter: npm run db:init');
  } else if (backendCheck.status !== 'success') {
    console.log('🚨 PROBLÈME: Backend non accessible');
    console.log('   → Exécuter: npm run dev:server');
  } else if (frontendCheck.status !== 'success') {
    console.log('⚠️ PROBLÈME: Frontend non accessible');
    console.log('   → Exécuter: npm run dev:client');
  } else {
    console.log('✅ TOUS LES SERVICES OPÉRATIONNELS');
    console.log('   🌐 http://localhost:5173');
  }
  
  console.log('\n🔧 COMMANDES UTILES:');
  console.log('   npm run fix:smart start  - Démarrage intelligent');
  console.log('   npm run check:db         - Diagnostic DB détaillé');
  console.log('   npm run test:api         - Test API complet');
}

runDiagnostic().catch(console.error);
