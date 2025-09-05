import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, Calendar, Settings, UserPlus, LogOut,
  Edit, Trash2, Pin, Heart, MessageCircle, Share2,
  Camera, Globe, Lock, Shield, Building, User, UserCheck,
  Hash, Info, Tag, Phone, Mail, ExternalLink
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
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              
              {/* Group Avatar */}
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                {group.avatar ? (
                  <img 
                    src={group.avatar} 
                    alt={group.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    {getGroupTypeIcon(group.type)}
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {group.name}
                      </h1>
                      {canManageGroup() && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          icon={<Settings size={16} />}
                          onClick={() => navigate(`/groups/${group._id}/manage`)}
                          className="ml-4"
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        {getGroupTypeIcon(group.type)}
                        <span className="ml-1 capitalize">{group.type}</span>
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <span className="capitalize">{group.category}</span>
                      </span>
                      {group.privacy === 'private' ? (
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <Lock className="h-4 w-4 mr-1" />
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <Globe className="h-4 w-4 mr-1" />
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                      {group.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {!userMembership ? (
                      <Button onClick={joinGroup} icon={<UserPlus size={16} />}>
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
                            to={`/groups/${group._id}/manage`}
                          >
                            Manage
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={leaveGroup}
                          icon={<LogOut size={16} />}
                        >
                          Leave
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Group Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} members
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {group.stats?.totalPosts || 0} posts
                  </div>
                  {group.location?.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {group.location.city}
                      {group.location.state && `, ${group.location.state}`}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(group.createdAt).toLocaleDateString()}
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
          <div>
            {/* Create Post Button */}
            {canCreatePost() && (
              <Card className="p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user?.avatar || '/default-avatar.png'} 
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex-1 text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                  >
                    What would you like to share with the group?
                  </button>
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    icon={<Camera size={16} />}
                    variant="outline"
                    size="sm"
                  >
                    Photo
                  </Button>
                </div>
              </Card>
            )}

            {/* Posts List */}
            {postsLoading ? (
              <Loading />
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to share something with this group!
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onLike={() => likePost(post._id)}
                    userMembership={userMembership}
                  />
                ))}
              </div>
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
      {showCreatePost && (
        <CreatePostModal 
          groupId={id}
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            setShowCreatePost(false);
            fetchGroupPosts();
          }}
        />
      )}
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onLike, userMembership }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const isLiked = post.likes.some(like => like.user._id === userMembership?.user);

  return (
    <Card className="p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={post.author.avatar || '/default-avatar.png'} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {post.author.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()} • {post.type}
            </p>
          </div>
        </div>
        {post.isPinned && (
          <Pin className="h-5 w-5 text-primary-500" />
        )}
      </div>

      {/* Post Content */}
      {post.title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h3>
      )}
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {post.content}
      </p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.slice(0, 4).map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt="Post image"
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Related Pet */}
      {post.relatedPet && (
        <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            {post.relatedPet.images && post.relatedPet.images[0] && (
              <img 
                src={post.relatedPet.images[0]} 
                alt={post.relatedPet.name}
                className="w-12 h-12 rounded-lg object-cover"
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
            className={`flex items-center space-x-2 text-sm ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.engagement.likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-500"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.engagement.commentsCount}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-500">
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <img 
                  src={comment.user.avatar || '/default-avatar.png'} 
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
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
            <img 
              src={userMembership?.user?.avatar || '/default-avatar.png'} 
              alt="You"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button size="sm">Post</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// About Tab Component
const AboutTab = ({ group }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            About This Group
          </h3>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {group.description}
          </p>
        </div>
        
        {group.tags && group.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm rounded-full border border-primary-200 dark:border-primary-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {group.rules && group.rules.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Group Rules
            </h4>
            <div className="space-y-4">
              {group.rules.map((rule, index) => (
                <div key={index} className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-r-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {index + 1}. {rule.title}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!group.rules || group.rules.length === 0) && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No group rules defined yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Group admins can add rules to help maintain community standards
            </p>
          </div>
        )}
      </Card>
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
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
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
          className={`${size} rounded-full object-cover`}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full ${avatar.color} flex items-center justify-center text-white font-medium text-sm`}>
        {avatar.initials}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Members ({group.memberCount})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
              <div key={member._id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  {renderAvatar(member.user)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {member.user.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active members found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Group Admins
          </h3>
          <div className="space-y-4">
            {group.members
              ?.filter(member => member.role === 'admin' && member.status === 'active')
              .map((admin) => (
              <div key={admin._id} className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
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
              <div className="text-center py-4">
                <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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
const CreatePostModal = ({ groupId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/groups/${groupId}/posts`, formData);
      toast.success('Post created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CustomSelect
          label="Post Type"
          value={formData.type}
          onChange={(value) => setFormData({...formData, type: value})}
          options={[
            { value: 'text', label: 'Text Post' },
            { value: 'pet-share', label: 'Pet Share' },
            { value: 'help-request', label: 'Help Request' },
            { value: 'event', label: 'Event' },
            { value: 'resource', label: 'Resource' }
          ]}
        />

        <Input
          label="Title (Optional)"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          maxLength={200}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            rows={4}
            maxLength={2000}
            required
            placeholder="What would you like to share?"
          />
        </div>

        <CustomSelect
          label="Priority"
          value={formData.priority}
          onChange={(value) => setFormData({...formData, priority: value})}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
          ]}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupDetails;
