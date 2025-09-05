import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, MapPin, 
  Heart, MessageCircle, Calendar, Shield,
  Building, User, UserCheck, Globe, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import CustomSelect from '../components/ui/CustomSelect';
import SearchableLocationInput from '../components/ui/SearchableLocationInput';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    privacy: '',
    location: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const groupTypes = [
    { value: '', label: 'All Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'community', label: 'Community' },
    { value: 'ngo', label: 'NGO/Non-Profit' },
    { value: 'shelter', label: 'Animal Shelter' },
    { value: 'rescue', label: 'Rescue Organization' }
  ];

  const groupCategories = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'adoption', label: 'Adoption' },
    { value: 'rescue', label: 'Rescue' },
    { value: 'training', label: 'Training' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'breed-specific', label: 'Breed Specific' },
    { value: 'local', label: 'Local Community' }
  ];

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12,
        ...filters
      });
      
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/groups?${params}`);
      setGroups(response.data.groups);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [filters, searchTerm, pagination.page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchGroups();
  };

  const joinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      toast.success('Joined group successfully!');
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'ngo': return <Building className="h-4 w-4" />;
      case 'shelter': return <Shield className="h-4 w-4" />;
      case 'rescue': return <Heart className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getGroupTypeColor = (type) => {
    switch (type) {
      case 'ngo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shelter': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rescue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'community': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getMembershipStatus = (group) => {
    if (!user) return 'join';
    
    // Check if user is the creator/admin
    if (group.createdBy === user.id || group.createdBy === user._id) {
      return 'admin';
    }
    
    // Check if user is a member
    const member = group.members?.find(m => 
      m.user === user.id || m.user === user._id || 
      (typeof m.user === 'object' && (m.user._id === user.id || m.user._id === user._id))
    );
    
    if (member) {
      if (member.role === 'admin') return 'admin';
      if (member.role === 'moderator') return 'moderator';
      return 'member';
    }
    
    return 'join';
  };

  const getMembershipButton = (group) => {
    const status = getMembershipStatus(group);
    
    switch (status) {
      case 'admin':
        return (
          <Button
            size="sm"
            onClick={() => navigate(`/groups/${group._id}/manage`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Shield className="h-4 w-4 mr-1" />
            Manage
          </Button>
        );
      case 'moderator':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/groups/${group._id}`)}
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Moderator
          </Button>
        );
      case 'member':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/groups/${group._id}`)}
            className="flex-1 border-primary-300 text-primary-700 hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20"
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Joined
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => joinGroup(group._id)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Join
          </Button>
        );
    }
  };

  if (loading && groups.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Community Groups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Join communities, NGOs, and organizations dedicated to animal welfare. 
              Connect with like-minded people and make a difference together.
            </p>
            <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {groups.length} Groups Available
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                Worldwide Community
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            icon={<Plus size={18} />}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            Create Group
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search groups by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} />}
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                variant="outline" 
                className="h-11 px-6"
              >
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomSelect
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
                options={groupTypes}
                placeholder="Group Type"
              />
              <CustomSelect
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                options={groupCategories}
                placeholder="Category"
              />
              <CustomSelect
                value={filters.privacy}
                onChange={(value) => handleFilterChange('privacy', value)}
                options={[
                  { value: '', label: 'All Groups' },
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' }
                ]}
                placeholder="Privacy"
              />
              <Input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                icon={<MapPin size={18} />}
              />
            </div>
          </form>
        </Card>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No groups found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || Object.values(filters).some(f => f) ? 
                  "Try adjusting your search criteria or filters to find more groups." :
                  "Be the first to create a community group and start connecting with like-minded pet lovers!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowCreateModal(true)} 
                  icon={<Plus size={16} />}
                >
                  Create First Group
                </Button>
                {(searchTerm || Object.values(filters).some(f => f)) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({ type: '', category: '', privacy: '', location: '' });
                      fetchGroups();
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group._id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {group.avatar ? (
                        <img 
                          src={group.avatar} 
                          alt={group.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          {getGroupTypeIcon(group.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {group.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGroupTypeColor(group.type)}`}>
                            {getGroupTypeIcon(group.type)}
                            <span className="ml-1 capitalize">{group.type}</span>
                          </span>
                          {group.privacy === 'private' ? (
                            <Lock className="h-3 w-3 text-gray-400" />
                          ) : (
                            <Globe className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    {group.isVerified && (
                      <UserCheck className="h-5 w-5 text-green-500" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  {/* Location */}
                  {group.location?.city && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                      <span>
                        {group.location.city}
                        {group.location.state && `, ${group.location.state}`}
                        {group.location.country && `, ${group.location.country}`}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {group.memberCount} members
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {group.stats?.totalPosts || 0} posts
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {group.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{group.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Creation Date */}
                  <div className="text-xs text-gray-400 mb-4 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/groups/${group._id}`)}
                      className="flex-1"
                    >
                      View Group
                    </Button>
                    {getMembershipButton(group)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
};

// Create Group Modal Component
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'individual',
    category: 'general',
    privacy: 'public',
    location: {
      city: '',
      state: '',
      country: ''
    },
    tags: '',
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.post('/groups', submitData);
      toast.success('Group created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New Group">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Basic Information
          </h3>
          
          <Input
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            maxLength={100}
            placeholder="Enter a descriptive name for your group"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              rows={4}
              maxLength={500}
              placeholder="Describe what your group is about, its goals, and what members can expect..."
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Group Type & Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Group Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              label="Group Type"
              value={formData.type}
              onChange={(value) => setFormData({...formData, type: value})}
              options={[
                { value: 'individual', label: 'Individual' },
                { value: 'community', label: 'Community' },
                { value: 'ngo', label: 'NGO/Non-Profit' },
                { value: 'shelter', label: 'Animal Shelter' },
                { value: 'rescue', label: 'Rescue Organization' }
              ]}
              required
            />
            
            <CustomSelect
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({...formData, category: value})}
              options={[
                { value: 'general', label: 'General' },
                { value: 'adoption', label: 'Adoption' },
                { value: 'rescue', label: 'Rescue' },
                { value: 'training', label: 'Training' },
                { value: 'health', label: 'Health & Wellness' },
                { value: 'breed-specific', label: 'Breed Specific' },
                { value: 'local', label: 'Local Community' }
              ]}
            />
          </div>

          <CustomSelect
            label="Privacy Setting"
            value={formData.privacy}
            onChange={(value) => setFormData({...formData, privacy: value})}
            options={[
              { value: 'public', label: 'Public - Anyone can join' },
              { value: 'private', label: 'Private - Requires approval' }
            ]}
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Location
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableLocationInput
              label="City"
              type="city"
              value={formData.location.city}
              onChange={(value) => setFormData({
                ...formData, 
                location: {...formData.location, city: value}
              })}
              placeholder="Search for city..."
            />
            
            <SearchableLocationInput
              label="State"
              type="state"
              value={formData.location.state}
              onChange={(value) => setFormData({
                ...formData, 
                location: {...formData.location, state: value}
              })}
              placeholder="Search for state..."
            />
            
            <SearchableLocationInput
              label="Country"
              type="country"
              value={formData.location.country}
              onChange={(value) => setFormData({
                ...formData, 
                location: {...formData.location, country: value}
              })}
              placeholder="Search for country..."
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Additional Information
          </h3>
          
          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="adoption, rescue, dogs, local community"
            helperText="Separate tags with commas to help people find your group"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact Email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) => setFormData({
                ...formData, 
                contactInfo: {...formData.contactInfo, email: e.target.value}
              })}
              placeholder="contact@yourgroup.com"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={formData.contactInfo.phone}
              onChange={(e) => setFormData({
                ...formData, 
                contactInfo: {...formData.contactInfo, phone: e.target.value}
              })}
              placeholder="+91 98765 43210"
            />
            
            <Input
              label="Website"
              type="url"
              value={formData.contactInfo.website}
              onChange={(e) => setFormData({
                ...formData, 
                contactInfo: {...formData.contactInfo, website: e.target.value}
              })}
              placeholder="https://yourgroup.com"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              'Create Group'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Groups;
