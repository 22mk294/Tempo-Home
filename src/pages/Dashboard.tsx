import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Home, 
  MessageSquare, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  Euro
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
}

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

interface DashboardStats {
  totalProperties: number;
  totalMessages: number;
  totalViews: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalMessages: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.type === 'owner') {
        await Promise.all([
          fetchMyProperties(),
          fetchMyMessages(),
          fetchStats()
        ]);
      } else {
        await fetchMyMessages();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maisons/my-properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchMyMessages = async () => {
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
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maisons/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maisons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setProperties(properties.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Bonjour {user?.name}, voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Cards - Only for owners */}
        {user?.type === 'owner' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mes annonces</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages reçus</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues totales</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties Section - Only for owners */}
          {user?.type === 'owner' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mes annonces</h2>
                  <Link
                    to="/create-property"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle annonce</span>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {properties.length > 0 ? (
                  <div className="space-y-4">
                    {properties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {property.location}
                            </span>
                            <span className="flex items-center">
                              <Euro className="w-3 h-3 mr-1" />
                              {property.price}€/mois
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(property.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce</h3>
                    <p className="text-gray-600 mb-4">Commencez par créer votre première annonce</p>
                    <Link
                      to="/create-property"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer une annonce</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.type === 'owner' ? 'Messages reçus' : 'Mes messages'}
                </h2>
                <Link
                  to="/messages"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tout
                </Link>
              </div>
            </div>

            <div className="p-6">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{message.name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(message.date).toLocaleDateString()}
                            </span>
                          </div>
                          {message.propertyTitle && (
                            <p className="text-sm text-blue-600 mb-1">
                              Concernant: {message.propertyTitle}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                        </div>
                        <MessageSquare className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
                  <p className="text-gray-600">
                    {user?.type === 'owner' 
                      ? 'Vous recevrez ici les messages des locataires intéressés'
                      : 'Vous n\'avez envoyé aucun message pour le moment'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions for tenants */}
        {user?.type === 'tenant' && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Rechercher un logement</h3>
                  <p className="text-sm text-gray-600">Parcourir les annonces disponibles</p>
                </div>
              </Link>
              
              <Link
                to="/messages"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Mes conversations</h3>
                  <p className="text-sm text-gray-600">Gérer mes échanges avec les propriétaires</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;