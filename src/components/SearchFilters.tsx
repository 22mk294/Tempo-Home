import React, { useState } from 'react';
import { Search, MapPin, Home, Maximize, Euro } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    minSurface?: number;
  }) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
    minSurface: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Convert strings to numbers where needed
    const processedFilters = {
      location: newFilters.location,
      minPrice: newFilters.minPrice ? parseInt(newFilters.minPrice) : undefined,
      maxPrice: newFilters.maxPrice ? parseInt(newFilters.maxPrice) : undefined,
      rooms: newFilters.rooms ? parseInt(newFilters.rooms) : undefined,
      minSurface: newFilters.minSurface ? parseInt(newFilters.minSurface) : undefined
    };

    onFilterChange(processedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      location: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      minSurface: ''
    };
    setFilters(emptyFilters);
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Search className="w-5 h-5 mr-2 text-blue-600" />
          Filtres de recherche
        </h3>
        {Object.values(filters).some(value => value) && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Effacer
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Localisation
          </label>
          <input
            type="text"
            placeholder="Ville, code postal..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Euro className="w-4 h-4 inline mr-1" />
            Budget mensuel
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min €"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max €"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Number of Rooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4 inline mr-1" />
            Nombre de pièces minimum
          </label>
          <select
            value={filters.rooms}
            onChange={(e) => handleFilterChange('rooms', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Indifférent</option>
            <option value="1">1 pièce</option>
            <option value="2">2 pièces</option>
            <option value="3">3 pièces</option>
            <option value="4">4 pièces</option>
            <option value="5">5 pièces et plus</option>
          </select>
        </div>

        {/* Surface */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Maximize className="w-4 h-4 inline mr-1" />
            Surface minimum (m²)
          </label>
          <input
            type="number"
            placeholder="Ex: 50"
            value={filters.minSurface}
            onChange={(e) => handleFilterChange('minSurface', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          💡 <strong>Astuce :</strong> Laissez certains champs vides pour élargir votre recherche
        </p>
      </div>
    </div>
  );
};

export default SearchFilters;