import bcrypt from 'bcryptjs';
import { pool } from './config/database.js';

const fixPasswords = async () => {
  try {
    console.log('🔧 Correction des mots de passe...');
    
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔑 Nouveau hash généré:', hashedPassword);
    
    // Mettre à jour tous les utilisateurs avec le bon hash
    const [result] = await pool.execute(
      'UPDATE users SET password = ?',
      [hashedPassword]
    );
    
    console.log('✅ Mots de passe mis à jour pour', result.affectedRows, 'utilisateurs');
    
    // Vérifier que ça marche
    const [users] = await pool.execute('SELECT email FROM users');
    console.log('👥 Utilisateurs mis à jour:');
    users.forEach(user => {
      console.log(`  - ${user.email} -> mot de passe: "password"`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
};

fixPasswords();
