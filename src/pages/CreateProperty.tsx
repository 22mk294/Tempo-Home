import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ImageUploader from '../components/ImageUploader';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Maximize, 
  FileText, 
  Camera,
  Plus,
  Image
} from 'lucide-react';

const CreateProperty: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    nbRooms: '',
    surface: '',
    images: [] as string[]
  });
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        nbRooms: parseInt(formData.nbRooms),
        surface: parseFloat(formData.surface)
      };
      
      const response = await fetch('/api/maisons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(data.error || 'Erreur lors de la création de l\'annonce');
        }
      }
    } catch (error) {
      setError('Erreur réseau lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl)) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      });
      setImageUrl('');
    }
  };

  const suggestedImages = [
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2091166/pexels-photo-2091166.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2076639/pexels-photo-2076639.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  if (user?.type !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Seuls les propriétaires peuvent créer des annonces</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Home className="w-8 h-8 mr-3" />
              Créer une annonce
            </h1>
            <p className="text-blue-100 mt-2">Partagez votre bien avec des locataires de confiance</p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Informations générales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'annonce * <span className="text-gray-500 text-xs">(min. 3 caractères)</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Appartement moderne 3 pièces avec terrasse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Localisation *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Paris 15ème"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Loyer mensuel ($) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="1200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="nbRooms" className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="w-4 h-4 inline mr-1" />
                    Nombre de pièces *
                  </label>
                  <select
                    id="nbRooms"
                    name="nbRooms"
                    required
                    value={formData.nbRooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">1 pièce</option>
                    <option value="2">2 pièces</option>
                    <option value="3">3 pièces</option>
                    <option value="4">4 pièces</option>
                    <option value="5">5 pièces</option>
                    <option value="6">6 pièces et plus</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-2">
                    <Maximize className="w-4 h-4 inline mr-1" />
                    Surface (m²) *
                  </label>
                  <input
                    id="surface"
                    name="surface"
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.surface}
                    onChange={handleChange}
                    placeholder="75.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée * <span className="text-gray-500 text-xs">(min. 10 caractères)</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre logement, ses atouts, le quartier, les équipements disponibles..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/10 caractères minimum
              </p>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-600" />
                Photos du logement
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({formData.images.length}/10 images)
                </span>
              </h2>

              {/* Image Uploader Component */}
              <div className="mb-8">
                <ImageUploader 
                  images={formData.images}
                  onImagesChange={(images) => setFormData({...formData, images})}
                  maxImages={10}
                />
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Image className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Ajout d'images par URL</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Vous pouvez également ajouter des images via des URLs ou utiliser notre banque d'images suggérées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Image URL */}
              <div className="flex gap-3 mb-4">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL de l'image (ex: https://example.com/image.jpg)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={formData.images.length >= 10 || !imageUrl.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter URL
                </button>
              </div>

              {/* Image count warning */}
              {formData.images.length < 6 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Il est recommandé d'ajouter au moins 6 images pour maximiser l'attractivité de votre annonce.
                  </p>
                </div>
              )}

              {/* Suggested Images */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Images suggérées (cliquez pour sélectionner) :</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {suggestedImages.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (!formData.images.includes(url) && formData.images.length < 10) {
                          setFormData({
                            ...formData,
                            images: [...formData.images, url]
                          });
                        }
                      }}
                      disabled={formData.images.includes(url) || formData.images.length >= 10}
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        formData.images.includes(url) 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-500'
                      } ${formData.images.length >= 10 && !formData.images.includes(url) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <img src={url} alt={`Suggestion ${index + 1}`} className="w-full h-full object-cover" />
                      {formData.images.includes(url) && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <span className="text-green-700 font-semibold text-xs">✓ Ajoutée</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  'Publier l\'annonce'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Conseil :</strong> Ajoutez plusieurs photos de qualité pour attirer plus de locataires potentiels
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;