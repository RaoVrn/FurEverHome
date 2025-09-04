import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ImageCarousel - A responsive carousel component for displaying images
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image URLs to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fallbackImage - Fallback image URL if main image fails to load
 */
const ImageCarousel = ({ 
  images = [], 
  className = '', 
  fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0yNTMuMzM0IDI2Ni42NjYgNzIuMzMzLTU3LjMzMiA1MS4zMzMgNDAuOTk5IDEyMC0xMDUuMzMzIDM1LjMzMyAzMS4zMzNjLTEyLjY2NiA5MC4zMzMtMTAwLjMzMyAxNDQuNjY2LTE3OSAyMDIuMzMzLTc4LjY2Ny01Ny42NjctMTY2LjMzMy0xMTItMTc5LTIwMi4zMzNsMzUuMzMzLTMxLjMzMyA0My42NjggMTIxLjMzNloiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMjAwIiByPSIzOCIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIzMDAiIHk9IjMyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjc3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo='
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Reset state when images change
  useEffect(() => {
    setCurrentIndex(0);
    setIsLoading(true);
    setLoadError(false);
  }, [images]);
  
  // Return placeholder if no images
  if (!images || images.length === 0) {
    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        <img 
          src={fallbackImage}
          alt="No image available" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  const goToPrevious = (e) => {
    e.stopPropagation();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  
  const goToNext = (e) => {
    e.stopPropagation();
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // Show controls only if there are multiple images
  const showControls = images.length > 1;
  
  return (
    <div className={`relative rounded-lg overflow-hidden group ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img 
        src={images[currentIndex]} 
        alt={`Pet image ${currentIndex + 1}`} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          setIsLoading(false);
          setLoadError(true);
          e.target.src = fallbackImage;
        }}
      />
      
      {/* Left Arrow */}
      {showControls && (
        <div 
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={goToPrevious}
        >
          <ChevronLeft size={20} />
        </div>
      )}
      
      {/* Right Arrow */}
      {showControls && (
        <div 
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={goToNext}
        >
          <ChevronRight size={20} />
        </div>
      )}
      
      {/* Dots */}
      {showControls && (
        <div className="absolute bottom-2 w-full flex justify-center space-x-2">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                slideIndex === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
