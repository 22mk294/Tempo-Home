import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Home, 
  Maximize, 
  Euro, 
  Phone, 
  Mail, 
  User,
  Calendar,
  Send,
  ArrowLeft,
  Star
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  nbRooms: number;
  surface: number;
  images: string[];
  available: boolean;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [messageForm, setMessageForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/maisons/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMessage(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maisonId: property?.id,
          ...messageForm
        })
      });

      if (response.ok) {
        setMessageSent(true);
        setShowContactForm(false);
        setMessageForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété introuvable</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux annonces</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images and Info */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
              <img
                src={property.images?.[0] || defaultImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-lg font-bold text-gray-900 flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  {property.price}€/mois
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-lg">{property.location}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Home className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.nbRooms}</p>
                  <p className="text-sm text-gray-600">Pièces</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Maximize className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.surface}m²</p>
                  <p className="text-sm text-gray-600">Surface</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Disponible</p>
                  <p className="text-sm text-gray-600">Immédiatement</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{property.ownerName}</h3>
                <p className="text-gray-600">Propriétaire</p>
                <div className="flex items-center justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.8)</span>
                </div>
              </div>

              {messageSent ? (
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2">Message envoyé !</h4>
                  <p className="text-sm text-green-700">
                    Le propriétaire a reçu votre message et vous répondra rapidement.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{property.ownerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{property.ownerEmail}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Contacter le propriétaire
                  </button>
                </>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 text-center">
                  🛡️ <strong>Sécurisé</strong> - Vos données personnelles sont protégées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Contacter {property.ownerName}
            </h3>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre nom
                </label>
                <input
                  type="text"
                  required
                  value={messageForm.name}
                  onChange={(e) => setMessageForm({...messageForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={messageForm.email}
                  onChange={(e) => setMessageForm({...messageForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={messageForm.phone}
                  onChange={(e) => setMessageForm({...messageForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  placeholder="Bonjour, je suis intéressé(e) par votre logement..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sendingMessage ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;