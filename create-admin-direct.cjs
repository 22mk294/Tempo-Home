const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdminDirectly() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tempo_home'
    });

    // Données de l'admin
    const adminData = {
      name: "Admin Interface",
      email: "admin.interface@tempo-home.com",
      password: "motdepasse123",
      phone: "0987654321",
      type: "admin"
    };

    console.log('Vérification si l\'email existe déjà...');
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [adminData.email]);
    
    if (existing.length > 0) {
      console.log('❌ Un utilisateur avec cet email existe déjà');
      await connection.end();
      return;
    }

    console.log('Hashage du mot de passe...');
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    console.log('Hash généré:', hashedPassword.substring(0, 30) + '...');

    console.log('Insertion de l\'admin dans la base...');
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, phone, type) VALUES (?, ?, ?, ?, ?)',
      [adminData.name, adminData.email, hashedPassword, adminData.phone, adminData.type]
    );

    console.log('✅ Admin créé avec succès!');
    console.log('   ID:', result.insertId);
    console.log('   Nom:', adminData.name);
    console.log('   Email:', adminData.email);
    console.log('   Type:', adminData.type);

    // Vérification
    console.log('\nVérification de la création...');
    const [created] = await connection.execute('SELECT id, name, email, type, password FROM users WHERE id = ?', [result.insertId]);
    
    if (created.length > 0) {
      const user = created[0];
      console.log('Admin trouvé dans la base:');
      console.log('   ID:', user.id);
      console.log('   Nom:', user.name);
      console.log('   Email:', user.email);
      console.log('   Type:', user.type);
      console.log('   Hash valide:', user.password.startsWith('$2a$12$') || user.password.startsWith('$2b$12$'));
      
      // Test de connexion
      const isValid = await bcrypt.compare(adminData.password, user.password);
      console.log('   Mot de passe vérifiable:', isValid);
    }

    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

createAdminDirectly();
