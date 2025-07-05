const mysql = require('mysql2/promise');

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tempo_home'
    });

    console.log('Recherche de l\'admin...');
    const [rows] = await connection.execute('SELECT id, name, email, password, type FROM users WHERE email = ?', ['newadmin@tempo-home.com']);
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('✅ Admin trouvé:');
      console.log('   ID:', user.id);
      console.log('   Nom:', user.name);
      console.log('   Email:', user.email);
      console.log('   Type:', user.type);
      console.log('   Mot de passe hashé:', user.password.substring(0, 20) + '...');
      console.log('   Longueur du hash:', user.password.length);
      console.log('   Hash bcrypt valide:', user.password.startsWith('$2b$12$'));
    } else {
      console.log('❌ Admin non trouvé');
    }

    // Afficher tous les admins
    console.log('\n--- Tous les admins dans la base ---');
    const [adminRows] = await connection.execute('SELECT id, name, email, type FROM users WHERE type = ?', ['admin']);
    if (adminRows.length > 0) {
      adminRows.forEach(admin => {
        console.log(`ID: ${admin.id}, Nom: ${admin.name}, Email: ${admin.email}, Type: ${admin.type}`);
      });
    } else {
      console.log('Aucun admin trouvé');
    }

    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkAdmin();
