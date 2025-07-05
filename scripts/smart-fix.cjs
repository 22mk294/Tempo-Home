#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const http = require('http');

console.log('🚀 DÉMARRAGE INTELLIGENT TEMPO/HOME');
console.log('='.repeat(40));

// Fonction pour vérifier si un service répond
function checkService(host, port, path = '/') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

// Fonction pour tuer les processus Node.js
function killNodeProcesses() {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq node.exe" | find /c "node.exe"', (error, stdout) => {
      const count = parseInt(stdout.trim()) || 0;
      console.log(`🧹 ${count} processus Node.js détectés`);
      
      if (count > 0) {
        exec('taskkill /f /im node.exe', (killError) => {
          if (killError) {
            console.log('⚠️ Certains processus n\'ont pas pu être arrêtés');
          } else {
            console.log('✅ Processus Node.js nettoyés');
          }
          resolve();
        });
      } else {
        console.log('✅ Aucun processus Node.js à nettoyer');
        resolve();
      }
    });
  });
}

// Fonction pour attendre
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour démarrer le backend avec monitoring
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('\n🔧 DÉMARRAGE DU BACKEND...');
    console.log('   Commande: node server/index.js');
    
    const backend = spawn('node', ['server/index.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let started = false;
    let output = '';
    
    backend.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(`   Backend: ${text}`);
      
      if ((text.includes('8888') || text.includes('listening') || text.includes('Server running')) && !started) {
        started = true;
        console.log('✅ Backend démarré avec succès');
        resolve(backend);
      }
    });
    
    backend.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.log(`❌ Erreur backend: ${errorMsg.trim()}`);
      
      if (errorMsg.includes('EADDRINUSE')) {
        console.log('💡 SOLUTION: Port 8888 déjà utilisé');
        console.log('   → Arrêter les autres processus Node.js');
        console.log('   → Ou changer le port dans server/index.js');
      }
      
      if (errorMsg.includes('ECONNREFUSED') && errorMsg.includes('3306')) {
        console.log('💡 SOLUTION: MySQL non accessible');
        console.log('   → Démarrer XAMPP');
        console.log('   → Vérifier que MySQL est en cours d\'exécution');
      }
      
      if (errorMsg.includes('ER_BAD_DB_ERROR') || errorMsg.includes('Unknown database')) {
        console.log('💡 SOLUTION: Base de données manquante');
        console.log('   → Exécuter: npm run db:init');
      }
    });
    
    backend.on('error', (error) => {
      console.log(`❌ Erreur critique backend: ${error.message}`);
      reject(error);
    });
    
    // Timeout de 15 secondes
    setTimeout(() => {
      if (!started) {
        console.log('⏱️ Timeout démarrage backend (15s)');
        console.log('💡 SOLUTIONS POSSIBLES:');
        console.log('   1. Vérifier que XAMPP/MySQL est démarré');
        console.log('   2. Exécuter: npm run db:init');
        console.log('   3. Vérifier server/config/database.js');
        console.log('   4. Arrêter les autres processus: npm run fix:smart kill');
        backend.kill();
        reject(new Error('Backend timeout'));
      }
    }, 15000);
  });
}

// Fonction pour démarrer le frontend avec monitoring
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('\n🎨 DÉMARRAGE DU FRONTEND...');
    console.log('   Commande: npx vite');
    
    const frontend = spawn('npx', ['vite'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let started = false;
    
    frontend.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(`   Frontend: ${text}`);
      
      if ((text.includes('Local:') || text.includes('5173') || text.includes('ready')) && !started) {
        started = true;
        console.log('✅ Frontend démarré avec succès');
        resolve(frontend);
      }
    });
    
    frontend.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      
      if (errorMsg.includes('EADDRINUSE')) {
        console.log('⚠️ Port 5173 occupé - Vite va essayer un autre port');
      } else if (errorMsg.includes('proxy error') || errorMsg.includes('ECONNREFUSED')) {
        console.log('❌ ERREUR PROXY DÉTECTÉE:');
        console.log(errorMsg.trim());
        console.log('💡 SOLUTIONS:');
        console.log('   → Le backend doit être démarré AVANT le frontend');
        console.log('   → Vérifier que l\'API répond: http://localhost:8888/api/maisons');
        console.log('   → Redémarrer dans l\'ordre: Backend puis Frontend');
      } else if (errorMsg.includes('error') || errorMsg.includes('Error')) {
        console.log(`❌ Erreur frontend: ${errorMsg.trim()}`);
      }
    });
    
    frontend.on('error', (error) => {
      console.log(`❌ Erreur critique frontend: ${error.message}`);
      if (error.code === 'ENOENT') {
        console.log('💡 SOLUTION: Vite non installé');
        console.log('   → Exécuter: npm install');
      }
      reject(error);
    });
    
    // Timeout de 20 secondes
    setTimeout(() => {
      if (!started) {
        console.log('⏱️ Timeout démarrage frontend (20s)');
        console.log('💡 SOLUTIONS POSSIBLES:');
        console.log('   1. Vérifier les erreurs de compilation TypeScript');
        console.log('   2. Nettoyer: npm install');
        console.log('   3. Vérifier vite.config.ts');
        frontend.kill();
        reject(new Error('Frontend timeout'));
      }
    }, 20000);
  });
}

async function smartStart() {
  try {
    // Étape 1: Nettoyage
    console.log('🧹 NETTOYAGE PRÉALABLE...');
    await killNodeProcesses();
    await sleep(2000);
    
    // Étape 2: Vérification préalable
    console.log('\n🔍 VÉRIFICATION PRÉALABLE...');
    const backendRunning = await checkService('localhost', 8888);
    const frontendRunning = await checkService('localhost', 5173);
    
    if (backendRunning) {
      console.log('⚠️ Backend déjà en cours sur port 8888');
    }
    if (frontendRunning) {
      console.log('⚠️ Frontend déjà en cours sur port 5173');
    }
    
    // Étape 3: Démarrage du backend
    let backend;
    try {
      backend = await startBackend();
    } catch (error) {
      console.log('\n💥 ÉCHEC DÉMARRAGE BACKEND');
      console.log('🔧 ÉTAPES DE DÉPANNAGE:');
      console.log('   1. npm run diagnostic        (diagnostic complet)');
      console.log('   2. npm run check:db          (vérifier base de données)');
      console.log('   3. npm run db:init           (initialiser la base)');
      console.log('   4. Démarrer XAMPP manuellement');
      return;
    }
    
    // Étape 4: Attendre stabilisation backend
    console.log('\n⏳ STABILISATION BACKEND...');
    await sleep(3000);
    
    // Étape 5: Vérifier que l'API répond
    console.log('🔍 Test API backend...');
    const apiWorking = await checkService('localhost', 8888, '/api/maisons');
    if (!apiWorking) {
      console.log('❌ API backend ne répond pas');
      console.log('💡 Vérifier les logs backend ci-dessus');
      backend?.kill();
      return;
    }
    console.log('✅ API backend opérationnelle');
    
    // Étape 6: Démarrage du frontend
    let frontend;
    try {
      frontend = await startFrontend();
    } catch (error) {
      console.log('\n💥 ÉCHEC DÉMARRAGE FRONTEND');
      console.log('🔧 Le backend reste actif, vous pouvez:');
      console.log('   1. Corriger les erreurs TypeScript');
      console.log('   2. Relancer: npm run dev:client');
      console.log('   3. Tester l\'API: http://localhost:8888/api/maisons');
      return;
    }
    
    // Étape 7: Succès !
    console.log('\n🎉 DÉMARRAGE RÉUSSI !');
    console.log('='.repeat(30));
    console.log('🌐 Application: http://localhost:5173');
    console.log('🔧 API Backend: http://localhost:8888');
    console.log('📊 Test API: http://localhost:8888/api/maisons');
    console.log('\n⌨️ Appuyez sur Ctrl+C pour arrêter');
    
    // Monitoring en continu
    let monitoringActive = true;
    const monitorInterval = setInterval(async () => {
      if (!monitoringActive) return;
      
      const backendOk = await checkService('localhost', 8888, '/api/maisons');
      const frontendOk = await checkService('localhost', 5173);
      
      if (!backendOk || !frontendOk) {
        console.log(`\n⚠️ PROBLÈME DÉTECTÉ: Backend ${backendOk ? '✅' : '❌'} | Frontend ${frontendOk ? '✅' : '❌'}`);
        
        if (!backendOk) {
          console.log('💡 Backend non accessible - vérifier les logs');
        }
        if (!frontendOk) {
          console.log('💡 Frontend non accessible - erreur de compilation ?');
        }
      }
    }, 10000);
    
    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 ARRÊT DES SERVICES...');
      monitoringActive = false;
      clearInterval(monitorInterval);
      backend?.kill();
      frontend?.kill();
      setTimeout(() => process.exit(0), 1000);
    });
    
  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message);
    console.log('\n🆘 AIDE:');
    console.log('   npm run diagnostic  - Diagnostic complet');
    console.log('   npm run check:db    - Vérifier base de données');
    process.exit(1);
  }
}

// Interface de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'start':
    smartStart();
    break;
  case 'kill':
    console.log('🧹 Nettoyage des processus Node.js...');
    killNodeProcesses().then(() => {
      console.log('✅ Nettoyage terminé');
    });
    break;
  default:
    console.log('🤖 COMMANDES DE DÉMARRAGE INTELLIGENT:');
    console.log('   npm run fix:smart start  - Démarrage complet avec diagnostic');
    console.log('   npm run fix:smart kill   - Nettoyer les processus Node.js');
    console.log('\n📚 AUTRES OUTILS:');
    console.log('   npm run diagnostic       - Diagnostic complet du système');
    console.log('   npm run check:db         - Vérification base de données');
    console.log('   npm run test:api         - Test des API backend');
}
