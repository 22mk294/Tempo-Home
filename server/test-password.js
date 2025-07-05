import bcrypt from 'bcryptjs';
import { pool } from './config/database.js';

const testPassword = async () => {
  try {
    const password = 'password';
    
    // Récupérer le hash depuis la base
    const [users] = await pool.execute('SELECT email, password FROM users WHERE email = ?', ['admin@tempo-home.com']);
    
    if (users.length === 0) {
      console.log('❌ Utilisateur admin introuvable');
      return;
    }
    
    const user = users[0];
    console.log('👤 Email:', user.email);
    console.log('🔑 Hash dans la DB:', user.password);
    
    // Tester la comparaison bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    console.log('✅ Mot de passe "password" valide:', isValid);
    
    // Créer un nouveau hash pour comparaison
    const newHash = await bcrypt.hash(password, 12);
    console.log('🔄 Nouveau hash généré:', newHash);
    
    const isNewValid = await bcrypt.compare(password, newHash);
    console.log('✅ Nouveau hash valide:', isNewValid);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
};

testPassword();
