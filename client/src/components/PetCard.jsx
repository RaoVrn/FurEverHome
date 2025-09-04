import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PetCard = ({ pet, onAdopt, onLike, showOwnerActions = false, showAdoptButton = true, onPetDeleted }) => {
  const [isLiked, setIsLiked] = useState(pet.isLiked || false);
  const [likeCount, setLikeCount] = useState(pet.likeCount || pet.likes?.length || 0);
  const [adopting, setAdopting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this pet posting?')) {
      setDeleting(true);
      try {
        await API.delete(`/pets/${pet._id}`);
        toast.success('Pet deleted successfully');
        if (onPetDeleted) onPetDeleted(pet._id);
      } catch (error) {
        toast.error('Failed to delete pet');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-pet/${pet._id}`);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to like pets');
      return;
    }

    try {
  const response = await API.post(`/pets/${pet._id}/like`); // backend supports :petId
  setIsLiked(response.data.liked);
  setLikeCount(response.data.likes);
      if (onLike) onLike(pet._id);
    } catch (error) {
  console.error('Like error (card):', error.response?.data || error.message);
  toast.error(error.response?.data?.message || 'Failed to update like status');
    }
  };

  const handleAdopt = async (e) => {
    e.preventDefault();
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
      if (onAdopt) onAdopt(pet._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adopt pet');
    } finally {
      setAdopting(false);
    }
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/pets/${pet._id}`} className="block">
        <div className="relative">
          <img
            src={
              (pet.photos && pet.photos.length > 0) 
                ? pet.photos[0]
                : pet.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1QzE3NSAxMzguODA3IDE2My44MDcgMTUwIDE1MCAxNTBDMTM2LjE5MyAxNTAgMTI1IDEzOC44MDcgMTI1IDEyNUMxMjUgMTExLjE5MyAxMzYuMTkzIDEwMCAxNTAgMTAwQzE2My44MDcgMTAwIDE3NSAxMTEuMTkzIDE3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNzUgMTI1QzI3NSAxMzguODA3IDI2My44MDcgMTUwIDI1MCAxNTBDMjM2LjE5MyAxNTAgMjI1IDEzOC44MDcgMjI1IDEyNUMyMjUgMTExLjE5MyAyMzYuMTkzIDEwMCAyNTAgMTAwQzI2My44MDcgMTAwIDI3NSAxMTEuMTkzIDI3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwQzIxNi41NjkgMjAwIDIzMCAxODYuNTY5IDIzMCAxNzBDMjMwIDE1My40MzEgMjE2LjU2OSAxNDAgMjAwIDE0MEMxODMuNDMxIDE0MCAxNzAgMTUzLjQzMSAxNzAgMTcwQzE3MCAxODYuNTY5IDE4My40MzEgMjAwIDIwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjAgMjAwSDI4MFYyMDBDMjgwIDIxMS4wNDYgMjcxLjA0NiAyMjAgMjYwIDIyMEgxNDBDMTI4Ljk1NCAyMjAgMTIwIDIxMS4wNDYgMTIwIDIwMFYyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjwvZXN2Zz4K'
            }
            alt={pet.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1QzE3NSAxMzguODA3IDE2My44MDcgMTUwIDE1MCAxNTBDMTM2LjE5MyAxNTAgMTI1IDEzOC44MDcgMTI1IDEyNUMxMjUgMTExLjE5MyAxMzYuMTkzIDEwMCAxNTAgMTAwQzE2My44MDcgMTAwIDE3NSAxMTEuMTkzIDE3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNzUgMTI1QzI3NSAxMzguODA3IDI2My44MDcgMTUwIDI1MCAxNTBDMjM2LjE5MyAxNTAgMjI1IDEzOC44MDcgMjI1IDEyNUMyMjUgMTExLjE5MyAyMzYuMTkzIDEwMCAyNTAgMTAwQzI2My44MDcgMTAwIDI3NSAxMTEuMTkzIDI3NSAxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwQzIxNi41NjkgMjAwIDIzMCAxODYuNTY5IDIzMCAxNzBDMjMwIDE1My40MzEgMjE2LjU2OSAxNDAgMjAwIDE0MEMxODMuNDMxIDE0MCAxNzAgMTUzLjQzMSAxNzAgMTcwQzE3MCAxODYuNTY5IDE4My40MzEgMjAwIDIwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjAgMjAwSDI4MFYyMDBDMjgwIDIxMS4wNDYgMjcxLjA0NiAyMjAgMjYwIDIyMEgxNDBDMTI4Ljk1NCAyMjAgMTIwIDIxMS4wNDYgMTIwIDIwMFYyMDBaIiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+';
            }}
          />
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(pet.urgency)}`}>
              {pet.urgency?.charAt(0).toUpperCase() + pet.urgency?.slice(1)} Priority
            </span>
            {pet.vaccinated && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Vaccinated
              </span>
            )}
          </div>

          {/* Like button */}
          <button
            onClick={handleLike}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* Views count */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Eye size={12} />
            <span>{pet.views || 0}</span>
          </div>
        </div>

        <div className="p-4">
          {/* Pet name and category */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
              {pet.name} {getCategoryEmoji(pet.category)}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {pet.gender}
            </span>
          </div>

          {/* Pet details */}
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{pet.breed}</span> • {pet.age} years old
            </p>
            {pet.size && (
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Size: {pet.size}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {pet.description}
          </p>

          {/* Location and posted by */}
          <div className="space-y-1 mb-4">
            {pet.location && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={14} className="mr-1" />
                <span>{pet.location}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <User size={14} className="mr-1" />
              <span>Posted by {pet.postedBy?.name}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={14} className="mr-1" />
              <span>{new Date(pet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Adoption fee */}
          {pet.adoptionFee > 0 && (
            <div className="mb-3">
              <span className="text-lg font-bold text-primary-600">
                ${pet.adoptionFee}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                adoption fee
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Heart size={14} />
              <span>{likeCount} likes</span>
            </div>
            
            {showOwnerActions ? (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleEdit}
                  icon={<Edit size={14} />}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                  icon={<Trash2 size={14} />}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ) : (
              <>
                {pet.status === 'available' && showAdoptButton && (
                  <Button
                    size="sm"
                    onClick={handleAdopt}
                    loading={adopting}
                    disabled={!isAuthenticated || pet.postedBy._id === user?.id}
                    className="ml-auto"
                  >
                    {adopting ? 'Adopting...' : 'Adopt Me'}
                  </Button>
                )}
                
                {pet.status === 'adopted' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Adopted
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default PetCard;
