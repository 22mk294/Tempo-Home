#!/usr/bin/env node

import http from 'http';
import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      resolve({
        status: 'error',
        code: err.code,
        message: `❌ API ${endpoint} erreur: ${err.message}`,
        suggestion: err.code === 'ECONNREFUSED' ? 'Le serveur backend n\'est pas démarré' : 'Problème de réseau'
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
    return {
      status: 'error',
      message: `❌ Erreur base de données: ${error.message}`,
      suggestion: error.code === 'ECONNREFUSED' 
        ? 'XAMPP/MySQL n\'est pas démarré' 
        : error.code === 'ER_ACCESS_DENIED_ERROR'
        ? 'Problème d\'authentification MySQL'
        : 'Vérifier la configuration de la base de données'
    };
  }
}

// Fonction pour vérifier les fichiers de configuration
async function checkFiles() {
  const files = [
    'package.json',
    'vite.config.ts',
    'server/index.js',
    'server/config/database.js',
    'src/App.tsx'
  ];
  
  const results = [];
  
  for (const file of files) {
    try {
      await fs.access(path.join(process.cwd(), file));
      results.push(`✅ ${file} existe`);
    } catch {
      results.push(`❌ ${file} manquant`);
    }
  }
  
  return {
    status: results.every(r => r.includes('✅')) ? 'success' : 'error',
    message: 'Vérification des fichiers',
    details: results
  };
}

// Fonction pour vérifier les processus Node.js
async function checkProcesses() {
  return new Promise((resolve) => {
    import('child_process').then(({ exec }) => {
      exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout, stderr) => {
        if (error) {
          resolve({
            status: 'error',
            message: '❌ Impossible de vérifier les processus Node.js',
            suggestion: 'Problème avec tasklist ou pas de processus Node.js'
          });
          return;
        }
        
        const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
        const processCount = lines.length - 1; // Enlever l'en-tête
        
        resolve({
          status: processCount > 0 ? 'info' : 'warning',
          message: `📊 ${processCount} processus Node.js actifs`,
          details: lines.slice(1).map(line => {
            const parts = line.split(',');
            return parts.length > 1 ? `PID: ${parts[1]?.replace(/"/g, '')}` : line;
          }).filter(Boolean),
          suggestion: processCount === 0 ? 'Aucun serveur Node.js démarré' : null
        });
      });
    });
  });
}

// Fonction principale de diagnostic
async function runDiagnostic() {
  console.log('\n1️⃣ VÉRIFICATION DES FICHIERS DE CONFIGURATION');
  console.log('-'.repeat(50));
  const fileCheck = await checkFiles();
  console.log(fileCheck.message);
  fileCheck.details?.forEach(detail => console.log(`   ${detail}`));
  
  console.log('\n2️⃣ VÉRIFICATION DES PROCESSUS NODE.JS');
  console.log('-'.repeat(50));
  const processCheck = await checkProcesses();
  console.log(processCheck.message);
  if (processCheck.details) {
    processCheck.details.forEach(detail => console.log(`   ${detail}`));
  }
  if (processCheck.suggestion) {
    console.log(`   💡 ${processCheck.suggestion}`);
  }
  
  console.log('\n3️⃣ VÉRIFICATION DE LA BASE DE DONNÉES');
  console.log('-'.repeat(50));
  const dbCheck = await checkDatabase();
  console.log(dbCheck.message);
  if (dbCheck.details) {
    Object.entries(dbCheck.details).forEach(([key, value]) => {
      console.log(`   📊 ${key}: ${value}`);
    });
  }
  if (dbCheck.suggestion) {
    console.log(`   💡 Suggestion: ${dbCheck.suggestion}`);
  }
  
  console.log('\n4️⃣ VÉRIFICATION DU SERVEUR BACKEND (Port 8888)');
  console.log('-'.repeat(50));
  const backendCheck = await checkPort(config.backend.host, config.backend.port);
  console.log(backendCheck.message);
  
  if (backendCheck.status === 'success') {
    console.log('\n   🔍 Test des API endpoints:');
    const endpoints = ['/api/maisons', '/api/auth/profile', '/api/admin/stats'];
    
    for (const endpoint of endpoints) {
      const apiCheck = await checkAPI(endpoint);
      console.log(`   ${apiCheck.message}`);
      if (apiCheck.data) {
        console.log(`     📊 ${apiCheck.data}`);
      }
      if (apiCheck.suggestion) {
        console.log(`     💡 ${apiCheck.suggestion}`);
      }
    }
  } else {
    console.log('   💡 Suggestion: Démarrer le serveur backend avec "npm run dev:server"');
  }
  
  console.log('\n5️⃣ VÉRIFICATION DU SERVEUR FRONTEND (Port 5173)');
  console.log('-'.repeat(50));
  const frontendCheck = await checkPort(config.frontend.host, config.frontend.port);
  console.log(frontendCheck.message);
  if (frontendCheck.status !== 'success') {
    console.log('   💡 Suggestion: Démarrer le serveur frontend avec "npm run dev:client"');
  }
  
  console.log('\n6️⃣ RÉSUMÉ ET RECOMMANDATIONS');
  console.log('-'.repeat(50));
  
  if (dbCheck.status !== 'success') {
    console.log('🚨 PROBLÈME CRITIQUE: Base de données non accessible');
    console.log('   1. Démarrer XAMPP');
    console.log('   2. Vérifier que MySQL est actif');
    console.log('   3. Exécuter: npm run db:init');
  } else if (backendCheck.status !== 'success') {
    console.log('🚨 PROBLÈME CRITIQUE: Serveur backend non accessible');
    console.log('   1. Exécuter: npm run dev:server');
    console.log('   2. Vérifier les logs pour erreurs');
  } else if (frontendCheck.status !== 'success') {
    console.log('⚠️ PROBLÈME: Serveur frontend non accessible');
    console.log('   1. Exécuter: npm run dev:client');
    console.log('   2. Vérifier les erreurs de compilation');
  } else {
    console.log('✅ TOUS LES SERVICES SONT OPÉRATIONNELS');
    console.log('   🌐 Frontend: http://localhost:5173');
    console.log('   🔧 Backend: http://localhost:8888');
    console.log('   💾 Base de données: Connectée');
  }
  
  console.log('\n📝 COMMANDES UTILES:');
  console.log('   • Diagnostic complet: node scripts/diagnostic.js');
  console.log('   • Initialiser la DB: npm run db:init');
  console.log('   • Démarrer tout: npm run dev');
  console.log('   • Backend seul: npm run dev:server');
  console.log('   • Frontend seul: npm run dev:client');
  console.log('   • Nettoyer les processus: taskkill /f /im node.exe');
}

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('\n💥 ERREUR CRITIQUE:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 PROMESSE REJETÉE:', reason);
  process.exit(1);
});

// Lancer le diagnostic
runDiagnostic().catch(console.error);
