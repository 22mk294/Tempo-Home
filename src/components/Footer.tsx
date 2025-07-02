import React from 'react';
import { Building, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">HomeRent</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              La plateforme de référence pour la location de maisons et appartements entre particuliers. 
              Trouvez votre logement idéal ou mettez en location votre bien en toute sécurité.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>contact@homerent.fr</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>01 23 45 67 89</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Rechercher un logement</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Publier une annonce</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Comment ça marche</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Nous contacter</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HomeRent. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;