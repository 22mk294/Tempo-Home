#!/usr/bin/env node

console.log('🔧 SCRIPTS DE DÉPANNAGE TEMPO/HOME');
console.log('='.repeat(50));

console.log('\n🚀 DÉMARRAGE INTELLIGENT DES SERVICES');
console.log('-'.repeat(40));

const { spawn, exec } = require('child_process');
const http = require('http');

// Fonction pour vérifier si un port est libre
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, (err) => {
      if (err) {
        resolve(false);
      } else {
        server.once('close', () => resolve(true));
        server.close();
      }
    });
    server.on('error', () => resolve(false));
  });
}

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
    exec('taskkill /f /im node.exe', (error) => {
      // Ignore les erreurs si aucun processus à tuer
      resolve();
    });
  });
}

// Fonction pour attendre un délai
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour démarrer le backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Démarrage du serveur backend...');
    
    const backend = spawn('node', ['server/index.js'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let started = false;
    
    backend.stdout.on('data', (data) => {
      output += data.toString();
      if (data.toString().includes('8888') || data.toString().includes('listening')) {
        if (!started) {
          started = true;
          console.log('✅ Backend démarré sur le port 8888');
          resolve(backend);
        }
      }
    });
    
    backend.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.log(`❌ Erreur backend: ${errorMsg}`);
      
      if (errorMsg.includes('EADDRINUSE')) {
        console.log('💡 Port 8888 déjà utilisé - tentative de nettoyage...');
        killNodeProcesses().then(() => {
          console.log('🔄 Retry dans 2 secondes...');
        });
      }
      
      if (errorMsg.includes('ECONNREFUSED') && errorMsg.includes('3306')) {
        console.log('💡 MySQL non accessible - vérifier XAMPP');
      }
    });
    
    backend.on('error', (error) => {
      console.log(`❌ Erreur de démarrage backend: ${error.message}`);
      reject(error);
    });
    
    // Timeout de 10 secondes
    setTimeout(() => {
      if (!started) {
        console.log('⏱️ Timeout démarrage backend');
        backend.kill();
        reject(new Error('Backend timeout'));
      }
    }, 10000);
  });
}

// Fonction pour démarrer le frontend
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('🎨 Démarrage du serveur frontend...');
    
    const frontend = spawn('npx', ['vite'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let started = false;
    
    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Frontend: ${output.trim()}`);
      
      if ((output.includes('5173') || output.includes('Local:')) && !started) {
        started = true;
        console.log('✅ Frontend démarré');
        resolve(frontend);
      }
    });
    
    frontend.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      
      if (errorMsg.includes('EADDRINUSE')) {
        console.log('⚠️ Port 5173 occupé - essai du port suivant...');
      } else if (errorMsg.includes('proxy error')) {
        console.log('❌ Erreur proxy détectée:');
        console.log(errorMsg);
        console.log('💡 Le backend est-il démarré?');
      } else {
        console.log(`Frontend error: ${errorMsg}`);
      }
    });
    
    frontend.on('error', (error) => {
      console.log(`❌ Erreur démarrage frontend: ${error.message}`);
      reject(error);
    });
    
    // Timeout de 15 secondes
    setTimeout(() => {
      if (!started) {
        console.log('⏱️ Timeout démarrage frontend');
        frontend.kill();
        reject(new Error('Frontend timeout'));
      }
    }, 15000);
  });
}

async function smartStart() {
  try {
    console.log('🧹 Nettoyage des processus existants...');
    await killNodeProcesses();
    await sleep(2000);
    
    console.log('🔍 Vérification des ports...');
    const port8888Available = await isPortAvailable(8888);
    const port5173Available = await isPortAvailable(5173);
    
    console.log(`   Port 8888 (backend): ${port8888Available ? '✅ Libre' : '❌ Occupé'}`);
    console.log(`   Port 5173 (frontend): ${port5173Available ? '✅ Libre' : '❌ Occupé'}`);
    
    if (!port8888Available) {
      console.log('⚠️ Port 8888 occupé - force kill et retry...');
      await killNodeProcesses();
      await sleep(3000);
    }
    
    // Démarrer le backend d'abord
    let backend;
    try {
      backend = await startBackend();
    } catch (error) {
      console.log('❌ Impossible de démarrer le backend');
      console.log('🔧 Actions possibles:');
      console.log('   1. Vérifier que XAMPP/MySQL est démarré');
      console.log('   2. Exécuter: npm run db:init');
      console.log('   3. Vérifier server/config/database.js');
      return;
    }
    
    // Attendre que le backend soit stable
    console.log('⏳ Attente stabilisation du backend...');
    await sleep(3000);
    
    // Vérifier que le backend répond
    const backendResponds = await checkService('localhost', 8888, '/api/maisons');
    if (!backendResponds) {
      console.log('❌ Backend ne répond pas aux requêtes API');
      backend?.kill();
      return;
    }
    
    console.log('✅ Backend opérationnel');
    
    // Démarrer le frontend
    let frontend;
    try {
      frontend = await startFrontend();
    } catch (error) {
      console.log('❌ Impossible de démarrer le frontend');
      console.log('   Vérifier les erreurs de compilation TypeScript');
      backend?.kill();
      return;
    }
    
    console.log('\n🎉 DÉMARRAGE RÉUSSI!');
    console.log('='.repeat(30));
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:8888');
    console.log('📊 API Test: http://localhost:8888/api/maisons');
    
    console.log('\n⌨️ Appuyez sur Ctrl+C pour arrêter tous les services');
    
    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt des services...');
      backend?.kill();
      frontend?.kill();
      process.exit(0);
    });
    
    // Monitoring continu
    setInterval(async () => {
      const backendOk = await checkService('localhost', 8888, '/api/maisons');
      const frontendOk = await checkService('localhost', 5173);
      
      const status = `Backend: ${backendOk ? '✅' : '❌'} | Frontend: ${frontendOk ? '✅' : '❌'}`;
      process.stdout.write(`\r🔄 Status: ${status}`);
      
      if (!backendOk) {
        console.log('\n❌ Backend non accessible - vérifier les logs');
      }
    }, 5000);
    
  } catch (error) {
    console.error('💥 Erreur critique:', error.message);
    process.exit(1);
  }
}

// Fonction pour diagnostiquer les erreurs proxy spécifiquement
async function diagnoseProxyErrors() {
  console.log('\n🔍 DIAGNOSTIC ERREURS PROXY');
  console.log('-'.repeat(35));
  
  // Vérifier si backend répond
  console.log('1. Test backend direct...');
  const backendOk = await checkService('localhost', 8888, '/api/maisons');
  console.log(`   Backend accessible: ${backendOk ? '✅ Oui' : '❌ Non'}`);
  
  if (!backendOk) {
    console.log('   💡 Démarrer d\'abord le backend: npm run dev:server');
    return;
  }
  
  // Vérifier si frontend répond
  console.log('2. Test frontend...');
  const frontendOk = await checkService('localhost', 5173);
  console.log(`   Frontend accessible: ${frontendOk ? '✅ Oui' : '❌ Non'}`);
  
  if (!frontendOk) {
    console.log('   💡 Démarrer le frontend: npm run dev:client');
    return;
  }
  
  // Test du proxy
  console.log('3. Test proxy Vite...');
  const proxyOk = await checkService('localhost', 5173, '/api/maisons');
  console.log(`   Proxy fonctionnel: ${proxyOk ? '✅ Oui' : '❌ Non'}`);
  
  if (!proxyOk) {
    console.log('   💡 Solutions possibles:');
    console.log('      - Redémarrer Vite');
    console.log('      - Vérifier vite.config.ts');
    console.log('      - Backend démarré AVANT frontend');
    console.log('      - Nettoyer cache: rm -rf node_modules/.vite');
  }
}

// Interface de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'start':
    smartStart();
    break;
  case 'proxy':
    diagnoseProxyErrors();
    break;
  case 'kill':
    console.log('🧹 Nettoyage des processus Node.js...');
    killNodeProcesses().then(() => {
      console.log('✅ Processus nettoyés');
    });
    break;
  default:
    console.log('🤖 COMMANDES DISPONIBLES:');
    console.log('   node scripts/smart-fix.js start  - Démarrage intelligent');
    console.log('   node scripts/smart-fix.js proxy  - Diagnostic proxy');
    console.log('   node scripts/smart-fix.js kill   - Nettoyer processus');
    console.log('\n📚 AUTRES SCRIPTS:');
    console.log('   node scripts/diagnostic.js       - Diagnostic complet');
    console.log('   node scripts/test-api.js         - Test API backend');
}
