import React, { useState, useRef } from 'react';
import { Upload, X, Image, Plus } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      const validFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} n'est pas un fichier image valide`);
          continue;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`L'image ${file.name} est trop volumineuse (max 5MB)`);
          continue;
        }

        validFiles.push(file);
        formData.append('images', file);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Upload vers le serveur
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Ajouter les nouvelles images
        const updatedImages = [...images, ...result.images].slice(0, maxImages);
        onImagesChange(updatedImages);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload');
      }
      
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Erreur lors du téléchargement des images');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading || images.length >= maxImages}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Téléchargement...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Télécharger mes images</span>
            </>
          )}
        </button>
        
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Image className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Téléchargez vos propres images</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Formats acceptés : JPG, PNG, GIF, WebP</li>
              <li>• Taille maximum : 5MB par image</li>
              <li>• Jusqu'à {maxImages} images par annonce</li>
              <li>• Résolution recommandée : 1200x800px minimum</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-gray-200 group">
              <img 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              
              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Photo principale
                </div>
              )}
            </div>
          ))}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center bg-gray-50 hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Ajouter</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
