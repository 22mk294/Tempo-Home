#!/usr/bin/env node

const http = require('http');

console.log('🔍 TEST DE CONNECTIVITÉ API');
console.log('='.repeat(40));

const API_BASE = 'http://localhost:8888';
const endpoints = [
  { path: '/api/maisons', name: 'Liste des propriétés', method: 'GET' },
  { path: '/api/auth/login', name: 'Connexion utilisateur', method: 'POST', 
    data: { email: 'admin@test.com', password: 'password' } },
  { path: '/api/admin/stats', name: 'Statistiques admin', method: 'GET', requiresAuth: true },
  { path: '/api/messages', name: 'Messages', method: 'GET' },
  { path: '/uploads/test.jpg', name: 'Serveur de fichiers', method: 'GET' }
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, API_BASE);
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Diagnostic-Script'
      },
      timeout: 5000
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let result = {
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          headers: res.headers,
          dataLength: data.length
        };

        try {
          const jsonData = JSON.parse(data);
          result.response = jsonData;
          result.responseType = Array.isArray(jsonData) ? 'array' : 'object';
          if (Array.isArray(jsonData)) {
            result.count = jsonData.length;
          }
        } catch (e) {
          result.response = data.substring(0, 200);
          result.responseType = 'text';
        }

        resolve(result);
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        error: true,
        errorCode: err.code,
        errorMessage: err.message,
        success: false,
        diagnosis: getDiagnosis(err.code)
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        error: true,
        errorCode: 'TIMEOUT',
        errorMessage: 'Request timeout',
        success: false,
        diagnosis: 'Le serveur est trop lent ou ne répond pas'
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function getDiagnosis(errorCode) {
  switch (errorCode) {
    case 'ECONNREFUSED':
      return '❌ Le serveur backend n\'est pas démarré sur le port 8888';
    case 'ENOTFOUND':
      return '❌ Nom d\'hôte localhost non résolu';
    case 'ETIMEDOUT':
      return '⏱️ Timeout de connexion - serveur surchargé ou bloqué';
    case 'ECONNRESET':
      return '🔄 Connexion réinitialisée par le serveur';
    default:
      return `❓ Erreur inconnue: ${errorCode}`;
  }
}

function printResult(result) {
  const icon = result.success ? '✅' : '❌';
  console.log(`\n${icon} ${result.endpoint}`);
  console.log(`   URL: ${result.method} ${result.path}`);
  
  if (result.error) {
    console.log(`   ❌ Erreur: ${result.errorMessage} (${result.errorCode})`);
    console.log(`   💡 ${result.diagnosis}`);
    return;
  }
  
  console.log(`   📊 Status: ${result.status}`);
  
  if (result.success) {
    if (result.responseType === 'array') {
      console.log(`   📋 Réponse: ${result.count} éléments`);
    } else if (result.responseType === 'object') {
      console.log(`   📋 Réponse: Objet JSON valide`);
      if (result.response.token) {
        console.log(`   🔑 Token reçu: ${result.response.token.substring(0, 20)}...`);
      }
    } else {
      console.log(`   📋 Réponse: ${result.dataLength} caractères`);
    }
  } else {
    console.log(`   ⚠️ Status non-success: ${result.status}`);
    if (result.response) {
      console.log(`   📝 Message: ${typeof result.response === 'string' ? result.response : JSON.stringify(result.response)}`);
    }
  }
  
  // Suggestions spécifiques
  if (result.path === '/api/maisons' && !result.success) {
    console.log(`   💡 Cette API est cruciale pour afficher les propriétés sur la page d'accueil`);
  }
  if (result.path === '/api/auth/login' && result.status === 401) {
    console.log(`   💡 Vérifier les identifiants de test dans la base de données`);
  }
  if (result.path === '/api/admin/stats' && result.status === 401) {
    console.log(`   💡 Cette API nécessite une authentification admin`);
  }
}

async function testProxy() {
  console.log('\n🔄 TEST DU PROXY VITE');
  console.log('-'.repeat(30));
  
  try {
    const result = await makeRequest({ 
      path: '/api/maisons', 
      name: 'Test proxy Vite -> Backend',
      method: 'GET'
    });
    
    // Simuler une requête via le proxy Vite
    const viteResult = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5173,
        path: '/api/maisons',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: true,
            status: res.statusCode,
            data: data.length
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          success: false,
          error: err.code,
          message: err.message
        });
      });

      req.end();
    });

    if (viteResult.success) {
      console.log('✅ Proxy Vite fonctionne');
      console.log(`   📊 Status: ${viteResult.status}`);
      console.log(`   📦 Données reçues: ${viteResult.data} caractères`);
    } else {
      console.log('❌ Proxy Vite ne fonctionne pas');
      console.log(`   ❌ Erreur: ${viteResult.message} (${viteResult.error})`);
      console.log('   💡 Vérifier que Vite est démarré sur le port 5173');
      console.log('   💡 Vérifier la configuration proxy dans vite.config.ts');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test proxy');
    console.log(`   ${error.message}`);
  }
}

async function runApiTests() {
  console.log('🚀 Début des tests API...\n');
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint);
    printResult(result);
    
    // Pause courte entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  await testProxy();
  
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(40));
  console.log('Si toutes les API du backend fonctionnent mais que le proxy Vite échoue:');
  console.log('1. Vérifier que Vite est démarré: npm run dev:client');
  console.log('2. Vérifier vite.config.ts proxy configuration');
  console.log('3. Redémarrer Vite si nécessaire');
  console.log('\nSi les API du backend échouent:');
  console.log('1. Démarrer le backend: npm run dev:server');
  console.log('2. Vérifier la base de données: npm run db:init');
  console.log('3. Vérifier les logs du serveur backend');
}

runApiTests().catch(console.error);
