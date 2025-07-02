import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Mail, Phone, Calendar, User, Home } from 'lucide-react';

interface Message {
  id: number;
  maisonId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  propertyTitle?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user?.type === 'owner' ? '/api/messages/received' : '/api/messages/sent';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            {user?.type === 'owner' ? 'Messages reçus' : 'Mes messages'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.type === 'owner' 
              ? 'Gérez les demandes de renseignements de vos locataires potentiels'
              : 'Consultez vos échanges avec les propriétaires'
            }
          </p>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {message.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {message.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(message.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {message.propertyTitle && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-blue-800">
                        <Home className="w-4 h-4 mr-2" />
                        <span className="font-medium">Concernant: {message.propertyTitle}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Message :</h4>
                    <p className="text-gray-700 leading-relaxed">{message.message}</p>
                  </div>

                  {user?.type === 'owner' && (
                    <div className="mt-4 flex space-x-3">
                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.propertyTitle || 'Votre demande'}&body=Bonjour ${message.name},%0A%0AEn réponse à votre message :%0A"${message.message}"%0A%0A`}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Répondre par email</span>
                      </a>
                      <a
                        href={`tel:${message.phone}`}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Appeler</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {user?.type === 'owner' ? 'Aucun message reçu' : 'Aucun message envoyé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {user?.type === 'owner' 
                ? 'Vous recevrez ici les messages des locataires intéressés par vos annonces.'
                : 'Vous n\'avez envoyé aucun message pour le moment. Parcourez les annonces et contactez les propriétaires.'
              }
            </p>
            {user?.type === 'tenant' && (
              <a
                href="/"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Voir les annonces</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;