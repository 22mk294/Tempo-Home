import mysql from 'mysql2/promise';

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database to create it
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4'
    };
    
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS tempo_home CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE tempo_home');

    console.log('Dropping existing tables if they exist...');
    // On supprime dans l'ordre inverse à cause des clés étrangères
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('DROP TABLE IF EXISTS property_views');
    await connection.execute('DROP TABLE IF EXISTS messages');
    await connection.execute('DROP TABLE IF EXISTS maisons');
    await connection.execute('DROP TABLE IF EXISTS users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        type ENUM('owner', 'tenant', 'admin') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating maisons table...');
    await connection.execute(`
      CREATE TABLE maisons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        location VARCHAR(255) NOT NULL,
        nbRooms INT NOT NULL,
        surface DECIMAL(8, 2) NOT NULL,
        images TEXT,
        ownerId INT NOT NULL,
        available BOOLEAN DEFAULT true,
        views INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating messages table...');
    await connection.execute(`
      CREATE TABLE messages (
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

    console.log('Creating property_views table...');
    await connection.execute(`
      CREATE TABLE property_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        maisonId INT NOT NULL,
        viewerIp VARCHAR(45),
        userAgent TEXT,
        viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (maisonId) REFERENCES maisons(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating sample data...');
    
    // Create sample users (password is "password" for all)
    await connection.execute(`
      INSERT INTO users (id, name, email, password, phone, type) VALUES
      (1, 'Marie Dupont', 'marie@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 12 34 56 78', 'owner'),
      (2, 'Pierre Martin', 'pierre@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 98 76 54 32', 'owner'),
      (3, 'Sophie Bernard', 'sophie@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 11 22 33 44', 'tenant'),
      (4, 'Admin System', 'admin@tempo-home.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAr6tIB8/pe', '06 00 00 00 00', 'admin')
    `);

    // Create sample properties
    await connection.execute(`
      INSERT INTO maisons (id, title, description, price, location, nbRooms, surface, images, ownerId, available, views) VALUES
      (1, 'Appartement moderne 3 pièces', 'Magnifique appartement de 3 pièces entièrement rénové avec terrasse et parking. Proche des transports et commerces.', 1320, 'Paris 15ème', 3, 75.5, '["https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true, 45),
      (2, 'Maison avec jardin', 'Belle maison familiale avec grand jardin, garage et 4 chambres. Quartier calme et résidentiel.', 1980, 'Lyon 6ème', 5, 120, '["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true, 32),
      (3, 'Studio centre-ville', 'Studio moderne en plein centre-ville, parfait pour étudiant ou jeune actif. Tout équipé.', 715, 'Marseille 1er', 1, 25, '["https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true, 18),
      (4, 'Duplex avec vue', 'Superbe duplex avec vue panoramique, 2 terrasses et parking privé. Très lumineux.', 1650, 'Nice Centre', 4, 90, '["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true, 67),
      (5, 'Loft industriel', 'Ancien loft industriel rénové avec goût. Hauteur sous plafond exceptionnelle et cachet unique.', 2420, 'Bordeaux Chartrons', 3, 110, '["https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800"]', 1, true, 29),
      (6, 'Pavillon familial', 'Pavillon de 6 pièces avec grand jardin et garage. Idéal famille nombreuse. Calme absolu.', 1760, 'Toulouse Colomiers', 6, 140, '["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"]', 2, true, 41)
    `);

    // Create sample messages
    await connection.execute(`
      INSERT INTO messages (maisonId, name, email, phone, message) VALUES
      (1, 'Jean Dubois', 'jean@example.com', '06 55 44 33 22', 'Bonjour, je suis très intéressé par votre appartement. Serait-il possible de le visiter cette semaine ?'),
      (2, 'Alice Moreau', 'alice@example.com', '06 77 88 99 00', 'Votre maison correspond exactement à ce que je recherche. Puis-je avoir plus d''informations sur le quartier ?'),
      (1, 'Thomas Leroy', 'thomas@example.com', '06 33 44 55 66', 'L''appartement est-il toujours disponible ? Je peux me déplacer rapidement pour une visite.'),
      (3, 'Emma Martin', 'emma@example.com', '06 22 33 44 55', 'Je recherche un studio pour mes études. Celui-ci semble parfait !'),
      (4, 'Lucas Bernard', 'lucas@example.com', '06 44 55 66 77', 'Magnifique duplex ! Quand puis-je le visiter ?'),
      (5, 'Claire Petit', 'claire@example.com', '06 66 77 88 99', 'Le loft me plaît beaucoup. Y a-t-il une place de parking ?')
    `);

    // Create sample property views for statistics
    await connection.execute(`
      INSERT INTO property_views (maisonId, viewerIp, userAgent) VALUES
      (1, '192.168.1.1', 'Mozilla/5.0'),
      (1, '192.168.1.2', 'Mozilla/5.0'),
      (2, '192.168.1.3', 'Mozilla/5.0'),
      (3, '192.168.1.4', 'Mozilla/5.0'),
      (4, '192.168.1.5', 'Mozilla/5.0'),
      (4, '192.168.1.6', 'Mozilla/5.0'),
      (5, '192.168.1.7', 'Mozilla/5.0')
    `);

    console.log('Database initialization completed successfully!');
    console.log('Sample users created (password: "password" for all):');
    console.log('- marie@example.com (Owner)');
    console.log('- pierre@example.com (Owner)');
    console.log('- sophie@example.com (Tenant)');
    console.log('- admin@tempo-home.com (Admin)');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDatabase();