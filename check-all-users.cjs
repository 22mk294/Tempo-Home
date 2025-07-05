const mysql = require('mysql2/promise');

async function checkAllUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tempo_home'
    });

    console.log('--- Tous les utilisateurs dans la base ---');
    const [rows] = await connection.execute('SELECT id, name, email, type, password FROM users ORDER BY id');
    
    if (rows.length > 0) {
      rows.forEach(user => {
        console.log(`ID: ${user.id}, Nom: ${user.name}, Email: ${user.email}, Type: ${user.type}`);
        console.log(`   Hash: ${user.password.substring(0, 30)}...`);
        console.log(`   Hash valide: ${user.password.startsWith('$2a$12$') || user.password.startsWith('$2b$12$')}`);
        console.log('---');
      });
    } else {
      console.log('Aucun utilisateur trouvé');
    }

    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkAllUsers();
