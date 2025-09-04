import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PetCard from '../components/PetCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await API.get('/pets/user/favorites');
      setFavorites(response.data);
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handlePetUnliked = (petId) => {
    setFavorites(prev => prev.filter(pet => pet._id !== petId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading favorites..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
            className="mb-4"
          >
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Favorites
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Pets you've liked and want to keep track of
          </p>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start browsing pets and like the ones you're interested in to keep track of them here.
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Available Pets
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                onLike={handlePetUnliked}
                showAdoptButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
