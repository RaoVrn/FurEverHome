import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, Calendar, Settings, UserPlus, LogOut,
  Edit, Trash2, Pin, Heart, MessageCircle, Share2,
  Camera, Globe, Lock, Shield, Building, User, UserCheck,
  Hash, Info, Tag, Phone, Mail, ExternalLink, Send,
  Upload, X, Image as ImageIcon, File, Paperclip
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import CustomSelect from '../components/ui/CustomSelect';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/GroupChat.css';

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPhotoPost, setShowPhotoPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postsPagination, setPostsPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    if (group && userMembership) {
      fetchGroupPosts();
    }
  }, [group, userMembership, postsPagination.page]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data.group);
      setUserMembership(response.data.userMembership);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group details');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.get(`/groups/${id}/posts?page=${postsPagination.page}`);
      setPosts(response.data.posts);
      setPostsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load posts');
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const joinGroup = async () => {
    try {
      await api.post(`/groups/${id}/join`);
      toast.success('Join request sent!');
      fetchGroupDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  const leaveGroup = async () => {
    try {
      await api.post(`/groups/${id}/leave`);
      toast.success('Left group successfully');
      navigate('/groups');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(`/groups/posts/${postId}/like`);
      fetchGroupPosts();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const editPost = (post) => {
    setEditingPost(post);
    setShowCreatePost(true);
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/groups/posts/${postId}`);
      toast.success('Post deleted successfully');
      fetchGroupPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'ngo': return <Building className="h-5 w-5" />;
      case 'shelter': return <Shield className="h-5 w-5" />;
      case 'rescue': return <Heart className="h-5 w-5" />;
      case 'community': return <Users className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const canManageGroup = () => {
    console.log('canManageGroup check:');
    console.log('- userMembership:', userMembership);
    console.log('- group.createdBy:', group?.createdBy);
    console.log('- user._id:', user?._id);
    console.log('- userMembership.role:', userMembership?.role);
    
    const isCreator = group?.createdBy?._id === user?._id;
    const isAdmin = userMembership?.role === 'admin';
    
    console.log('- isCreator:', isCreator);
    console.log('- isAdmin:', isAdmin);
    
    const canManage = userMembership && (isAdmin || isCreator);
    console.log('- canManage:', canManage);
    
    return canManage;
  };

  const canCreatePost = () => {
    return userMembership && 
           userMembership.status === 'active' &&
           (group?.settings.allowMemberPosts || 
            userMembership.role === 'admin' || 
            userMembership.role === 'moderator');
  };

  if (loading) {
    return <Loading />;
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Group Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The group you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  // If group is private and user is not a member
  if (group.isPrivate && !userMembership) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Private Group
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This is a private group. You need to be a member to view its content.
            </p>
            <div className="space-y-4">
              <div className="text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {group.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {group.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {group.memberCount} members
                </div>
              </div>
              <Button onClick={joinGroup} icon={<UserPlus size={16} />}>
                Request to Join
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Group Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              
              {/* Group Avatar */}
              <div className="flex-shrink-0 mb-6 lg:mb-0">
                {group.avatar ? (
                  <img 
                    src={group.avatar} 
                    alt={group.name}
                    className="w-28 h-28 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center shadow-lg">
                    <div className="text-primary-600 dark:text-primary-400">
                      {getGroupTypeIcon(group.type)}
                    </div>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-3">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {group.name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        <span className="mr-2">{getGroupTypeIcon(group.type)}</span>
                        <span className="capitalize">{group.type}</span>
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <Hash className="h-3 w-3 mr-1" />
                        <span className="capitalize">{group.category}</span>
                      </span>
                      {group.privacy === 'private' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </span>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6">
                    <div className="flex space-x-3">
                      {!userMembership ? (
                        <Button 
                          onClick={joinGroup} 
                          icon={<UserPlus size={16} />}
                          className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                          Join Group
                        </Button>
                      ) : userMembership.status === 'pending' ? (
                        <Button variant="outline" disabled>
                          Pending Approval
                        </Button>
                      ) : (
                        <>
                          {canManageGroup() && (
                            <Button 
                              variant="outline" 
                              icon={<Settings size={16} />}
                              onClick={() => navigate(`/groups/${group._id}/manage`)}
                              className="border-primary-300 text-primary-700 hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20"
                            >
                              Manage
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={leaveGroup}
                            icon={<LogOut size={16} />}
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            Leave
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Stats */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">{group.memberCount}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">members</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg mr-2">
                      <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">{group.stats?.totalPosts || 0}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">posts</span>
                  </div>
                  {group.location?.city && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-2">
                        <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>
                        {group.location.city}
                        {group.location.state && `, ${group.location.state}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-2">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {group.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Members
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create Post Section */}
            {canCreatePost() && (
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                    >
                      What would you like to share with the group?
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setShowPhotoPost(true)}
                      icon={<Camera size={16} />}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
                    >
                      Photo
                    </Button>
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      icon={<MessageCircle size={16} />}
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                    >
                      Write Post
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Share with {group.memberCount} members
                  </span>
                </div>
              </Card>
            )}

            {/* Posts List */}
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loading />
                  <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                  <MessageCircle className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  This group is just getting started! Be the first to share something with the community. 
                  Start a conversation, share photos, or ask questions.
                </p>
                {canCreatePost() && (
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    icon={<MessageCircle size={20} />}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
                  >
                    Create First Post
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <div key={post._id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <PostCard 
                      post={post} 
                      onLike={() => likePost(post._id)}
                      onEdit={editPost}
                      onDelete={deletePost}
                      userMembership={userMembership}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {postsPagination.pages > 1 && (
              <Card className="p-4">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setPostsPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={postsPagination.page === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, postsPagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setPostsPagination(prev => ({ ...prev, page }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === postsPagination.page
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPostsPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={postsPagination.page === postsPagination.pages}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutTab group={group} />
        )}

        {activeTab === 'members' && (
          <MembersTab group={group} userMembership={userMembership} />
        )}
      </div>

      {/* Create Post Modal */}
      {(showCreatePost || showPhotoPost) && (
        <CreatePostModal 
          groupId={id}
          editPost={editingPost}
          focusImages={showPhotoPost}
          onClose={() => {
            setShowCreatePost(false);
            setShowPhotoPost(false);
            setEditingPost(null);
          }}
          onSuccess={() => {
            setShowCreatePost(false);
            setShowPhotoPost(false);
            setEditingPost(null);
            fetchGroupPosts();
          }}
        />
      )}
    </div>
  );
};

// About Tab Component
const AboutTab = ({ group }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            About This Group
          </h3>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base mb-6">
            {group.description}
          </p>
        </div>
        
        {group.tags && group.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Hash className="h-4 w-4 mr-2 text-primary-500" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-400 text-sm rounded-full border border-primary-200 dark:border-primary-700 hover:shadow-md transition-all duration-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
        
      {group.rules && group.rules.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            Group Rules
          </h4>
          <div className="space-y-4">
            {group.rules.map((rule, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-r-lg hover:shadow-md transition-all duration-200">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {index + 1}. {rule.title}
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {(!group.rules || group.rules.length === 0) && (
        <Card className="p-8">
          <div className="text-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No group rules defined yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Group admins can add rules to help maintain community standards
            </p>
          </div>
        </Card>
      )}
    </div>
    
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Group Details
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Type</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize bg-white dark:bg-gray-700 px-2 py-1 rounded">
              {group.type}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Category</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize bg-white dark:bg-gray-700 px-2 py-1 rounded">
              {group.category}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              {group.privacy === 'private' ? <Lock className="h-4 w-4 text-gray-500" /> : <Globe className="h-4 w-4 text-gray-500" />}
              <span className="text-sm font-medium text-gray-900 dark:text-white">Privacy</span>
            </div>
            <span className={`text-sm px-2 py-1 rounded capitalize ${
              group.privacy === 'private' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {group.privacy}
            </span>
          </div>
          
          {group.location?.city && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Location</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                {group.location.city}
                {group.location.state && `, ${group.location.state}`}
                {group.location.country && `, ${group.location.country}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Created</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
              {new Date(group.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
      
      {group.contactInfo && (Object.values(group.contactInfo).some(val => val)) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Contact Information
          </h3>
          <div className="space-y-3">
            {group.contactInfo.email && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <a 
                    href={`mailto:${group.contactInfo.email}`}
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    {group.contactInfo.email}
                  </a>
                </div>
              </div>
            )}
            
            {group.contactInfo.phone && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {group.contactInfo.phone}
                  </p>
                </div>
              </div>
            )}
            
            {group.contactInfo.website && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                  <a 
                    href={group.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  </div>
);

// Members Tab Component
const MembersTab = ({ group, userMembership }) => {
  const getUserAvatar = (user) => {
    if (user.avatar) return user.avatar;
    
    // Generate avatar based on user name initials
    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const colors = [
      'from-red-500 to-red-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 
      'from-yellow-500 to-yellow-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 
      'from-indigo-500 to-indigo-600', 'from-teal-500 to-teal-600'
    ];
    const colorIndex = user.name?.charCodeAt(0) % colors.length || 0;
    
    return { initials, color: colors[colorIndex] };
  };

  const renderAvatar = (user, size = 'w-10 h-10') => {
    const avatar = getUserAvatar(user);
    
    if (typeof avatar === 'string') {
      return (
        <img 
          src={avatar} 
          alt={user.name}
          className={`${size} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700`}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white font-medium border-2 border-gray-200 dark:border-gray-700 shadow-sm`}>
        <span className={size.includes('w-12') ? 'text-base' : 'text-sm'}>
          {avatar.initials}
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Members ({group.memberCount})
              </h3>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {group.members?.filter(m => m.status === 'active').length || 0} active
            </div>
          </div>
          
          <div className="space-y-3">
            {group.members
              ?.filter(member => member.status === 'active')
              .sort((a, b) => {
                // Sort by role: admin > moderator > member
                const roleOrder = { admin: 0, moderator: 1, member: 2 };
                return roleOrder[a.role] - roleOrder[b.role];
              })
              .map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center space-x-4">
                  {renderAvatar(member.user)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {member.user.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        member.role === 'moderator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {member.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {member.role === 'moderator' && <UserCheck className="w-3 h-3 mr-1" />}
                        {member.role === 'member' && <User className="w-3 h-3 mr-1" />}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {member.user.organizationType && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {member.user.organizationType}
                  </div>
                )}
              </div>
            ))}
            
            {(!group.members || group.members.filter(m => m.status === 'active').length === 0) && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active members found</h3>
                <p className="text-gray-500 dark:text-gray-400">This group doesn't have any active members yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-500" />
            Group Admins
          </h3>
          <div className="space-y-4">
            {group.members
              ?.filter(member => member.role === 'admin' && member.status === 'active')
              .map((admin) => (
              <div key={admin._id} className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-200">
                {renderAvatar(admin.user, 'w-12 h-12')}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {admin.user.name}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin since {new Date(admin.joinedAt).toLocaleDateString()}
                  </p>
                  {admin.user.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {admin.user.email}
                    </p>
                  )}
                </div>
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ))}
            
            {(!group.members || group.members.filter(m => m.role === 'admin' && m.status === 'active').length === 0) && (
              <div className="text-center py-8">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No admins found</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Moderators Section */}
        {group.members?.some(m => m.role === 'moderator' && m.status === 'active') && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Moderators
            </h3>
            <div className="space-y-3">
              {group.members
                .filter(member => member.role === 'moderator' && member.status === 'active')
                .map((moderator) => (
                <div key={moderator._id} className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  {renderAvatar(moderator.user)}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                      {moderator.user.name}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Moderator since {new Date(moderator.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Group Stats */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Group Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Members:</span>
              <span className="font-medium text-gray-900 dark:text-white">{group.memberCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts:</span>
              <span className="font-medium text-gray-900 dark:text-white">{group.stats?.totalPosts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Create Post Modal Component
const CreatePostModal = ({ groupId, onClose, onSuccess, editPost = null, focusImages = false }) => {
  const [formData, setFormData] = useState({
    type: editPost?.type || (focusImages ? 'pet-share' : 'text'),
    title: editPost?.title || '',
    content: editPost?.content || '',
    priority: editPost?.priority || 'normal',
    images: editPost?.images || []
  });
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(editPost?.images || []);
  const fileInputRef = useRef(null);

  // Auto-open file selector if focusImages is true
  useEffect(() => {
    if (focusImages && fileInputRef.current) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 300);
    }
  }, [focusImages]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          submitData.append(key, formData[key]);
        }
      });
      
      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      if (editPost) {
        await api.put(`/groups/posts/${editPost._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Post updated successfully!');
      } else {
        await api.post(`/groups/${groupId}/posts`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Post created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editPost ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={editPost ? "Edit Post" : "Create New Post"}
      size="lg"
    >
      <div className="max-h-[85vh] overflow-y-auto pr-2 w-full" style={{ minWidth: '650px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Post Type */}
          <CustomSelect
            label="Post Type"
            value={formData.type}
            onChange={(value) => setFormData({...formData, type: value})}
            options={[
              { value: 'text', label: '📝 Text Post' },
              { value: 'pet-share', label: '🐾 Pet Share' },
              { value: 'help-request', label: '🆘 Help Request' },
              { value: 'event', label: '📅 Event' },
              { value: 'resource', label: '📚 Resource' },
              { value: 'adoption', label: '🏠 Adoption' },
              { value: 'lost-found', label: '🔍 Lost & Found' }
            ]}
          />

          {/* Title */}
          <Input
            label="Title (Optional)"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            maxLength={200}
            placeholder="Give your post a catchy title..."
            className="focus:ring-2 focus:ring-primary-500"
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all duration-200 min-h-[140px] text-base leading-relaxed"
                rows={7}
                maxLength={2000}
                required
                placeholder="What would you like to share with the group?"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                {formData.content.length}/2000
              </div>
            </div>
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                <span className="mr-2">💡</span>
                Tip: Be clear and detailed to get better responses from the community
              </span>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              📷 Images (Optional)
            </label>
            
            {/* Upload Button */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 dark:hover:bg-primary-900/10 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                    <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-500" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      📸 Click to upload images
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB each • Multiple files supported
                    </p>
                  </div>
                </div>
              </button>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      📋 Selected Images ({imagePreview.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview([]);
                        setSelectedImages([]);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imagePreview.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <CustomSelect
            label="Priority Level"
            value={formData.priority}
            onChange={(value) => setFormData({...formData, priority: value})}
            options={[
              { value: 'low', label: '🟢 Low Priority' },
              { value: 'normal', label: '🟡 Normal Priority' },
              { value: 'high', label: '🟠 High Priority' },
              { value: 'urgent', label: '🔴 Urgent' }
            ]}
          />

          {/* Action Buttons */}
          <div className="bg-gray-50 dark:bg-gray-800/50 -mx-2 px-6 py-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <span className="text-blue-600 dark:text-blue-400">
                    {editPost ? "✏️" : "🌟"}
                  </span>
                </div>
                <span>
                  {editPost ? "Your changes will be visible to all group members" : "Share with 2 members"}
                </span>
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !formData.content.trim()} 
                  className="min-w-[140px] bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{editPost ? 'Updating...' : 'Posting...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{editPost ? 'Update Post' : 'Share Post'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Post Card Component
const PostCard = ({ post, onLike, userMembership, onEdit, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();

  const isLiked = post.likes.some(like => like.user._id === userMembership?.user);
  const canEditDelete = user?._id === post.author._id || userMembership?.role === 'admin';

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
  };

  const getUserAvatar = (user) => {
    if (user.avatar) return user.avatar;
    
    // Generate avatar based on user name initials
    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    const colors = [
      'from-red-500 to-red-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 
      'from-yellow-500 to-yellow-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 
      'from-indigo-500 to-indigo-600', 'from-teal-500 to-teal-600'
    ];
    const colorIndex = user.name?.charCodeAt(0) % colors.length || 0;
    
    return { initials, color: colors[colorIndex] };
  };

  const renderAvatar = (user, size = 'w-10 h-10') => {
    const avatar = getUserAvatar(user);
    
    if (typeof avatar === 'string') {
      return (
        <img 
          src={avatar} 
          alt={user.name}
          className={`${size} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700`}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white font-medium border-2 border-gray-200 dark:border-gray-700 shadow-sm`}>
        <span className={size.includes('w-12') ? 'text-base' : 'text-sm'}>
          {avatar.initials}
        </span>
      </div>
    );
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {renderAvatar(post.author)}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {post.author.name}
            </h4>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()} • 
                <span className="capitalize ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {post.type}
                </span>
              </p>
              {post.priority && post.priority !== 'normal' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  post.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  post.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {post.priority}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.isPinned && (
            <Pin className="h-5 w-5 text-primary-500" />
          )}
          
          {canEditDelete && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <div className="flex flex-col space-y-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(post);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {post.title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h3>
      )}
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {post.content}
      </p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
          {post.images.slice(0, 4).map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt="Post image"
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
            />
          ))}
        </div>
      )}

      {/* Related Pet */}
      {post.relatedPet && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            {post.relatedPet.images && post.relatedPet.images[0] && (
              <img 
                src={post.relatedPet.images[0]} 
                alt={post.relatedPet.name}
                className="w-12 h-12 rounded-lg object-cover border border-blue-300 dark:border-blue-600"
              />
            )}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {post.relatedPet.name}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {post.relatedPet.breed} • {post.relatedPet.category}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={onLike}
            className={`flex items-center space-x-2 text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.engagement.likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.engagement.commentsCount}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full transition-all duration-200">
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                {renderAvatar(comment.user, 'w-8 h-8')}
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h6 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {comment.user.name}
                    </h6>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Comment */}
          <div className="mt-4 flex space-x-3">
            {renderAvatar(userMembership?.user, 'w-8 h-8')}
            <div className="flex-1 flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button size="sm" disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GroupDetails;
