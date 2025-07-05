import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Home, Maximize, DollarSign } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  nbRooms: number;
  surface: number;
  images: string[];
  ownerName: string;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const defaultImage = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';
  
  return (
    <Link 
      to={`/property/${property.id}`}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.images?.[0] || defaultImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-3 h-3 mr-1" />
            ${property.price}/mois
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1 text-gray-400" />
              <span>{property.nbRooms} pièces</span>
            </div>
            <div className="flex items-center">
              <Maximize className="w-4 h-4 mr-1 text-gray-400" />
              <span>{property.surface}m²</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            Par {property.ownerName}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;