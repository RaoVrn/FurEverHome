import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, MapPin, Calendar, User, Phone, Mail, 
  ArrowLeft, Share2, Star, Shield, Award 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const response = await API.get(`/pets/${id}`);
      
      // Check if we got pet data directly or with similarPets
      const petData = response.data.pet || response.data;
      
      // Make sure we have an array for photos and images for backward compatibility
      if (!petData.photos && petData.image) {
        petData.photos = [petData.image];
      } else if (!petData.photos) {
        petData.photos = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0yNTMuMzM0IDI2Ni42NjYgNzIuMzMzLTU3LjMzMiA1MS4zMzMgNDAuOTk5IDEyMC0xMDUuMzMzIDM1LjMzMyAzMS4zMzNjLTEyLjY2NiA5MC4zMzMtMTAwLjMzMyAxNDQuNjY2LTE3OSAyMDIuMzMzLTc4LjY2Ny01Ny42NjctMTY2LjMzMy0xMTItMTc5LTIwMi4zMzNsMzUuMzMzLTMxLjMzMyA0My42NjggMTIxLjMzNloiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMjAwIiByPSIzOCIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIzMDAiIHk9IjMyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjc3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo='];
      }
      
      // For legacy support
      if (!petData.images && petData.photos) {
        petData.images = petData.photos;
      }
      
      // Normalize relative image paths
      if (petData.photos) {
        petData.photos = petData.photos.map(p => p?.startsWith('/uploads') ? `http://localhost:5000${p}` : p);
      }
      if (petData.image && petData.image.startsWith('/uploads')) {
        petData.image = `http://localhost:5000${petData.image}`;
      }
      setPet(petData);
      setIsLiked(petData.isLiked || (user?.id ? petData.likes?.includes(user.id) : false));
      
    } catch (error) {
      console.error('Error fetching pet details:', error);
      toast.error('Pet not found');
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to adopt pets');
      return;
    }

    if (pet.postedBy._id === user?.id) {
      toast.error('You cannot adopt your own pet');
      return;
    }

    setAdopting(true);
    try {
      await API.post('/pets/adopt', { petId: pet._id });
      toast.success('Adoption request sent successfully!');
      setPet(prev => ({ ...prev, status: 'adopted', adoptedBy: user }));
      setShowContactModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adopt pet');
    } finally {
      setAdopting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like pets');
      return;
    }

    try {
      const response = await API.post(`/pets/${pet._id}/like`);
      const { likes, liked } = response.data;
      setIsLiked(liked);
      setPet(prev => ({ ...prev, likeCount: likes, likes: Array(likes).fill(0) }));
    } catch (error) {
      console.error('Like error (details):', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update like status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this pet posting?')) {
      try {
        await API.delete(`/pets/${pet._id}`);
        toast.success('Pet deleted successfully');
        navigate('/profile');
      } catch (error) {
        toast.error('Failed to delete pet');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adopt ${pet.name} - FurEverHome`,
          text: `Check out this adorable ${pet.breed} looking for a home!`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading pet details..." />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pet not found
          </h2>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={16} />}
          className="mb-6"
        >
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pet Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={(pet.photos && pet.photos.length > 0) 
                    ? pet.photos[0] 
                    : pet.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'}
                alt={pet.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {pet.status === 'adopted' ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    Adopted
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(pet.urgency)}`}>
                    {pet.urgency?.charAt(0).toUpperCase() + pet.urgency?.slice(1)} Priority
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant={isLiked ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={handleLike}
                  icon={<Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />}
                  className="backdrop-blur-sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  icon={<Share2 size={16} />}
                  className="backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Additional Images */}
            {pet.photos && pet.photos.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {pet.photos.slice(1, 7).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjU2IiBjeT0iNjIiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9Ijk0IiBjeT0iNjIiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik03NSA5NEM4MS42Mjc0IDk0IDg3IDg4LjYyNzQgODcgODJDODcgNzUuMzcyNiA4MS42Mjc0IDcwIDc1IDcwQzY4LjM3MjYgNzAgNjMgNzUuMzcyNiA2MyA4MkM2MyA4OC42Mjc0IDY4LjM3MjYgOTQgNzUgOTRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik00NSAxMjBIMTA1VjEyMEMxMDUgMTI1LjUyMyAxMDAuNTIzIDEzMCA5NSAxMzBINTVDNDkuNDc3MiAxMzAgNDUgMTI1LjUyMyA0NSAxMjBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {pet.name} {getCategoryEmoji(pet.category)}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">
                    {pet.breed} • {pet.age} years old
                  </p>
                </div>
                {pet.adoptionFee > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      ${pet.adoptionFee}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      adoption fee
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {pet.gender}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gender</div>
                </div>
                {pet.size && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {pet.size}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Size</div>
                  </div>
                )}
              </div>

              {/* Health Status */}
              <div className="flex gap-2 mb-6">
                {pet.vaccinated && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <Shield size={14} />
                    Vaccinated
                  </span>
                )}
                {pet.neutered && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Award size={14} />
                    Neutered
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  About {pet.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {pet.description || 'No description available.'}
                </p>
              </div>

              {/* Medical History */}
              {pet.medicalHistory && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Medical History
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {pet.medicalHistory}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {pet.likes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {pet.views || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Posted by
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {pet.postedBy?.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Posted {new Date(pet.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {pet.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span>{pet.location}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Available since {new Date(pet.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              {pet.status === 'available' ? (
                <div className="space-y-3">
                  {/* Owner Controls */}
                  {pet.postedBy._id === user?.id ? (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => navigate(`/edit-pet/${pet._id}`)}
                        variant="secondary"
                        className="flex-1"
                        size="lg"
                      >
                        Edit Pet
                      </Button>
                      <Button
                        onClick={handleDelete}
                        variant="danger"
                        className="flex-1"
                        size="lg"
                      >
                        Delete Pet
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAdopt}
                      loading={adopting}
                      disabled={!isAuthenticated}
                      className="w-full"
                      size="lg"
                    >
                      {adopting ? 'Processing...' : 'Adopt Me'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-lg font-medium text-green-600">
                    This pet has been adopted! 🎉
                  </span>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Please <button 
                    onClick={() => navigate('/login')} 
                    className="text-primary-600 hover:underline"
                  >
                    login
                  </button> to adopt pets
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Information"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Great! You've shown interest in adopting {pet.name}. Here's how to contact the owner:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">
                {pet.contactEmail || pet.postedBy?.email}
              </span>
            </div>
            
            {(pet.contactPhone || pet.postedBy?.phone) && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {pet.contactPhone || pet.postedBy?.phone}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Please mention that you found {pet.name} on FurEverHome when you contact the owner.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PetDetails;
