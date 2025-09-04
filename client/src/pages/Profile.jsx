import React, { useState, useEffect } from 'react';
import { User, Heart, PlusCircle, Settings, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import PetCard from '../components/PetCard';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postedPets, setPostedPets] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [activeTab, setActiveTab] = useState('posted');
  const [userProfile, setUserProfile] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    fetchUserProfile();
  fetchUserPets();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get('/auth/profile');
      setUserProfile(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const fetchUserPets = async () => {
    try {
      const [postedResponse, adoptedResponse, favoritesResponse] = await Promise.all([
        API.get('/pets/user/posted'),
        API.get('/pets/user/adopted'),
        API.get('/pets/user/favorites')
      ]);
      setPostedPets(postedResponse.data);
      setAdoptedPets(adoptedResponse.data);
      setFavoritePets(favoritesResponse.data);
    } catch (error) {
      toast.error('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await API.put('/auth/profile', editForm);
      updateUser(response.data);
      setUserProfile(response.data);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePetDeleted = (petId) => {
    setPostedPets(prev => prev.filter(pet => pet._id !== petId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  const profile = userProfile || user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary-600" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.name}
              </h1>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail size={16} />
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Phone size={16} />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={() => setShowEditModal(true)}
                icon={<Settings size={16} />}
                variant="outline"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {postedPets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pets Posted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {adoptedPets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pets Adopted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile?.loginCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Logins
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {favoritePets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Favorites
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes on Posted Pets</p>
              <p className="text-xl font-semibold text-primary-600">{postedPets.reduce((sum,p)=>sum+(p.likes?.length||0),0)}</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Adoption Rate</p>
              <p className="text-xl font-semibold text-green-600">{postedPets.length ? Math.round((adoptedPets.length/postedPets.length)*100) : 0}%</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Viewing Impact</p>
              <p className="text-xl font-semibold text-blue-500">{postedPets.reduce((s,p)=>s+(p.views||0),0)} views</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posted')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <PlusCircle size={16} />
                <span>Posted Pets ({postedPets.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('adopted')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'adopted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart size={16} />
                <span>Adopted Pets ({adoptedPets.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart size={16} />
                <span>Favorites ({favoritePets.length})</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posted' && (
          <div>
            {postedPets.length === 0 ? (
              <Card className="text-center py-12">
                <PlusCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pets posted yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start helping pets find homes by posting your first pet
                </p>
                <Button onClick={() => window.location.href = '/post-pet'}>
                  Post Your First Pet
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {postedPets.map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    showOwnerActions={true}
                    showAdoptButton={false}
                    onPetDeleted={handlePetDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'adopted' && (
          <div>
            {adoptedPets.length === 0 ? (
              <Card className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pets adopted yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Browse available pets and give one a loving home
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Available Pets
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {adoptedPets.map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    showAdoptButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'favorites' && (
          <div>
            {favoritePets.length === 0 ? (
              <Card className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Like pets to add them to your favorites list
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Pets
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritePets.map((pet) => (
                  <PetCard
                    key={pet._id}
                    pet={pet}
                    showAdoptButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Input
            label="Location"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updating}
              disabled={updating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
