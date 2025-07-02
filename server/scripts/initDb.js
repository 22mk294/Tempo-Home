import { createConnection } from '../config/database.js';

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database to create it
    connection = await createConnection();
    
    console.log('Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS rental_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE rental_platform');

    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        type ENUM('owner', 'tenant') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating maisons table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS maisons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        location VARCHAR(255) NOT NULL,
        nbRooms INT NOT NULL,
        surface DECIMAL(8, 2) NOT NULL,
        images JSON,
        ownerId INT NOT NULL,
        available BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating messages table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        maisonId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (maisonId) REFERENCES maisons(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating sample data...');
    
    // Create sample users
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, phone, type) VALUES
      (1, 'Marie Dupont', 'marie@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 12 34 56 78', 'owner'),
      (2, 'Pierre Martin', 'pierre@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 98 76 54 32', 'owner'),
      (3, 'Sophie Bernard', 'sophie@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 11 22 33 44', 'tenant')
    `);

    // Create sample properties
    await connection.execute(`
      INSERT IGNORE INTO maisons (id, title, description, price, location, nbRooms, surface, images, ownerId, available) VALUES
      (1, 'Appartement moderne 3 pièces', 'Magnifique appartement de 3 pièces entièrement rénové avec terrasse et parking. Proche des transports et commerces.', 1200, 'Paris 15ème', 3, 75.5, '["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true),
      (2, 'Maison avec jardin', 'Belle maison familiale avec grand jardin, garage et 4 chambres. Quartier calme et résidentiel.', 1800, 'Lyon 6ème', 5, 120, '["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true),
      (3, 'Studio centre-ville', 'Studio moderne en plein centre-ville, parfait pour étudiant ou jeune actif. Tout équipé.', 650, 'Marseille 1er', 1, 25, '["https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true),
      (4, 'Duplex avec vue', 'Superbe duplex avec vue panoramique, 2 terrasses et parking privé. Très lumineux.', 1500, 'Nice Centre', 4, 90, '["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true),
      (5, 'Loft industriel', 'Ancien loft industriel rénové avec goût. Hauteur sous plafond exceptionnelle et cachet unique.', 2200, 'Bordeaux Chartrons', 3, 110, '["https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true),
      (6, 'Pavillon familial', 'Pavillon de 6 pièces avec grand jardin et garage. Idéal famille nombreuse. Calme absolu.', 1600, 'Toulouse Colomiers', 6, 140, '["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true)
    `);

    // Create sample messages
    await connection.execute(`
      INSERT IGNORE INTO messages (maisonId, name, email, phone, message) VALUES
      (1, 'Jean Dubois', 'jean@example.com', '06 55 44 33 22', 'Bonjour, je suis très intéressé par votre appartement. Serait-il possible de le visiter cette semaine ?'),
      (2, 'Alice Moreau', 'alice@example.com', '06 77 88 99 00', 'Votre maison correspond exactement à ce que je recherche. Puis-je avoir plus d''informations sur le quartier ?'),
      (1, 'Thomas Leroy', 'thomas@example.com', '06 33 44 55 66', 'L''appartement est-il toujours disponible ? Je peux me déplacer rapidement pour une visite.')
    `);

    console.log('Database initialization completed successfully!');
    console.log('Sample users created (password: "password" for all):');
    console.log('- marie@example.com (Owner)');
    console.log('- pierre@example.com (Owner)');
    console.log('- sophie@example.com (Tenant)');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();