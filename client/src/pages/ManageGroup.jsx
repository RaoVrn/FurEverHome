import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Shield, 
  Trash2, 
  Edit3, 
  Ban, 
  UserCheck,
  Crown,
  MoreHorizontal,
  Save,
  X,
  Globe,
  Lock,
  Eye,
  MapPin,
  Calendar,
  Hash,
  AlertTriangle,
  Copy,
  Link,
  UserPlus,
  UserMinus,
  Image,
  Camera,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import CustomSelect from '../components/ui/CustomSelect';
import SearchableLocationInput from '../components/ui/SearchableLocationInput';
import api from '../utils/api';

const ManageGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [stats, setStats] = useState({});

  const categoryOptions = [
    { value: 'rescue', label: 'Animal Rescue' },
    { value: 'adoption', label: 'Pet Adoption' },
    { value: 'care', label: 'Pet Care' },
    { value: 'training', label: 'Pet Training' },
    { value: 'health', label: 'Pet Health' },
    { value: 'community', label: 'Pet Community' },
    { value: 'lost-found', label: 'Lost & Found' },
    { value: 'breeding', label: 'Pet Breeding' },
    { value: 'supplies', label: 'Pet Supplies' },
    { value: 'events', label: 'Pet Events' }
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${groupId}`);
      
      // Backend returns { group, userMembership }, so we need to extract the group
      const groupData = response.data.group || response.data;
      
      setGroup(groupData);
      setEditForm({
        name: groupData.name,
        description: groupData.description,
        category: groupData.category,
        privacy: groupData.privacy,
        location: typeof groupData.location === 'string' ? groupData.location : 
                 typeof groupData.location === 'object' ? formatLocation(groupData.location) : '',
        contactInfo: groupData.contactInfo || { email: '', phone: '', website: '' }
      });

      // Calculate stats
      const groupStats = {
        totalMembers: groupData.members?.length || 0,
        admins: groupData.members?.filter(m => m.role === 'admin')?.length || 0,
        moderators: groupData.members?.filter(m => m.role === 'moderator')?.length || 0,
        members: groupData.members?.filter(m => m.role === 'member')?.length || 0,
        joinedThisMonth: groupData.members?.filter(m => {
          const joinDate = new Date(m.joinedAt);
          const now = new Date();
          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        })?.length || 0
      };
      setStats(groupStats);

      console.log('Group data:', groupData); // Debug log
      console.log('Group stats:', groupStats); // Debug log
      console.log('User data:', user); // Debug log
      console.log('Group creator:', groupData.createdBy); // Debug log
      console.log('Group members:', groupData.members); // Debug log
    } catch (error) {
      console.error('Error fetching group:', error);
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async () => {
    try {
      await api.put(`/groups/${groupId}`, editForm);
      setShowEditModal(false);
      // Refresh the group data after update
      fetchGroup();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const deleteGroup = async () => {
    try {
      await api.delete(`/groups/${groupId}`);
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    try {
      const action = newRole === 'moderator' ? 'promote' : 'demote';
      await api.patch(`/groups/${groupId}/members/${memberId}`, { 
        action,
        role: newRole 
      });
      fetchGroup(); // Refresh group data
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await api.patch(`/groups/${groupId}/members/${memberId}`, { 
        action: 'ban' 
      });
      fetchGroup(); // Refresh group data
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      setInviteLoading(true);
      await api.post(`/groups/${groupId}/invite`, { email: inviteEmail });
      setInviteEmail('');
      setShowInviteModal(false);
      // Could show success message here
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyGroupLink = () => {
    const groupUrl = `${window.location.origin}/groups/${groupId}`;
    navigator.clipboard.writeText(groupUrl);
    // Could show success toast here
  };

  const generateAvatar = (name) => {
    if (!name) return '';
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { initials, colorClass: colors[colorIndex] };
  };

  const formatLocation = (location) => {
    if (!location) return 'Not specified';
    
    // If location is a string, return it directly
    if (typeof location === 'string') return location;
    
    // If location is an object, format it nicely
    if (typeof location === 'object') {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.state) parts.push(location.state);
      if (location.country) parts.push(location.country);
      return parts.length > 0 ? parts.join(', ') : 'Not specified';
    }
    
    return 'Not specified';
  };

  const isAdmin = () => {
    if (!group || !user) {
      console.log('Permission check failed: missing group or user');
      return false;
    }
    
    // Get user ID (handle both _id and id)
    const userId = user._id || user.id;
    console.log('User ID:', userId);
    
    // Get creator ID
    const creatorId = group.createdBy?._id || group.createdBy;
    console.log('Creator ID:', creatorId);
    
    if (userId === creatorId) {
      console.log('User is creator');
      return true;
    }
    
    // Check if user is in admins array
    if (group.admins?.includes(userId)) {
      console.log('User is in admins array');
      return true;
    }
    
    // Check if user has admin role in members
    const userMember = group.members?.find(m => {
      const memberId = m.user?._id || m.user;
      return memberId === userId;
    });
    
    if (userMember?.role === 'admin') {
      console.log('User has admin role in members');
      return true;
    }
    
    console.log('User is not admin');
    return false;
  };

  const isModerator = () => {
    if (!group || !user) return false;
    
    // Admins are also moderators
    if (isAdmin()) return true;
    
    const userId = user.id || user._id;
    const userMember = group.members?.find(m => {
      const memberId = m.user?._id || m.user;
      return memberId === userId;
    });
    
    return userMember?.role === 'moderator';
  };

  if (loading) return <Loading />;
  if (!group) return <div>Group not found</div>;
  
  // Debug permission check
  console.log('Permission check:');
  console.log('- User:', user);
  console.log('- Group:', group);
  console.log('- Is Admin:', isAdmin());
  console.log('- Is Moderator:', isModerator());
  
  // Check if user has permission to manage this group
  if (!isAdmin() && !isModerator()) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to manage this group.
          </p>
          <Button onClick={() => navigate(`/groups/${groupId}`)}>
            Back to Group
          </Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'members', label: 'Members', icon: <Users size={16} /> },
    { id: 'moderation', label: 'Moderation', icon: <Shield size={16} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/groups/${groupId}`)} 
            icon={<ArrowLeft size={16} />}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Back to Group
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Group
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {group?.name || 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowInviteModal(true)}
            icon={<UserPlus size={16} />}
          >
            Invite Members
          </Button>
          <Button
            variant="outline"
            onClick={copyGroupLink}
            icon={<Link size={16} />}
          >
            Copy Link
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.joinedThisMonth || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admins/Mods</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.admins || 0) + (stats.moderators || 0)}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Privacy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{group?.privacy || 'Unknown'}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              {group?.privacy === 'public' ? 
                <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" /> :
                <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              }
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Group Information</h2>
              <Button variant="outline" onClick={() => setShowEditModal(true)} icon={<Edit3 size={16} />}>
                Edit Details
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Name
                  </label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white font-medium">{group?.name || 'No name'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white capitalize">{group?.category || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Privacy
                  </label>
                  <div className="flex items-center gap-2">
                    {group?.privacy === 'public' ? 
                      <Globe className="h-4 w-4 text-green-500" /> :
                      <Lock className="h-4 w-4 text-orange-500" />
                    }
                    <p className="text-gray-900 dark:text-white capitalize">{group?.privacy || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white">{formatLocation(group?.location)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white">
                      {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Type
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 dark:text-white capitalize">{group?.type || 'Community'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {group?.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">{group.description}</p>
              </div>
            )}
          </Card>

          {/* Contact Information */}
          {group?.contactInfo && (group.contactInfo.email || group.contactInfo.phone || group.contactInfo.website) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.contactInfo.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{group.contactInfo.email}</p>
                    </div>
                  </div>
                )}
                
                {group.contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{group.contactInfo.phone}</p>
                    </div>
                  </div>
                )}
                
                {group.contactInfo.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                      <p className="text-gray-900 dark:text-white">{group.contactInfo.website}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">Danger Zone</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-1">Delete Group</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Permanently delete this group and all its content. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="danger" 
                  onClick={() => setShowDeleteModal(true)}
                  icon={<Trash2 size={16} />}
                >
                  Delete Group
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Members ({group?.members?.length || 0})
              </h2>
              <Button 
                onClick={() => setShowInviteModal(true)}
                icon={<UserPlus size={16} />}
              >
                Invite Members
              </Button>
            </div>

            <div className="space-y-4">
              {group.members?.map((member) => {
                const avatar = generateAvatar(member.user?.name || 'Unknown');
                return (
                  <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${avatar.colorClass}`}>
                        {avatar.initials}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {member.user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{member.role}</span>
                          {member.role === 'admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                          {member.role === 'moderator' && <Shield className="h-4 w-4 text-blue-500" />}
                          <span>•</span>
                          <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {isAdmin() && member.user?._id !== user.id && (
                      <div className="flex items-center gap-2">
                        {member.role === 'member' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMemberRole(member.user._id, 'moderator')}
                            icon={<UserCheck size={14} />}
                          >
                            Promote
                          </Button>
                        )}
                        {member.role === 'moderator' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMemberRole(member.user._id, 'member')}
                            icon={<UserMinus size={14} />}
                          >
                            Demote
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeMember(member.user._id)}
                          icon={<Ban size={14} />}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {(!group.members || group.members.length === 0) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No members yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Moderation Tools</h2>
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Advanced Moderation Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                We're working on advanced moderation features including content filters, 
                automated moderation, and detailed activity logs.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Group Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Group">
        <div className="space-y-4">
          <Input
            label="Group Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your group..."
            />
          </div>

          <CustomSelect
            label="Category"
            options={categoryOptions}
            value={editForm.category || ''}
            onChange={(value) => setEditForm({ ...editForm, category: value })}
          />

          <CustomSelect
            label="Privacy"
            options={privacyOptions}
            value={editForm.privacy || ''}
            onChange={(value) => setEditForm({ ...editForm, privacy: value })}
          />

          <SearchableLocationInput
            label="Location"
            value={editForm.location || ''}
            onChange={(value) => setEditForm({ ...editForm, location: value })}
            placeholder="Enter city or location"
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={updateGroup} icon={<Save size={16} />}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)} icon={<X size={16} />}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Members">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Invite new members to join your group by email.
          </p>
          
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter member's email address"
          />

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={inviteMember} 
              loading={inviteLoading}
              disabled={!inviteEmail.trim()}
              icon={<UserPlus size={16} />}
            >
              Send Invitation
            </Button>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Group Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Group">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                This action cannot be undone
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                All group data will be permanently deleted
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>"{group?.name || 'this group'}"</strong>? 
            This will permanently remove:
          </p>
          
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>All group posts and content</li>
            <li>All member data and relationships</li>
            <li>Group settings and configuration</li>
            <li>Upload history and media</li>
          </ul>

          <div className="flex gap-3 pt-4">
            <Button variant="danger" onClick={deleteGroup} icon={<Trash2 size={16} />}>
              Yes, Delete Group
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageGroup;
