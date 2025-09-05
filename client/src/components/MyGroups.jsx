import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Clock, Star, MessageCircle, 
  Settings, Eye, TrendingUp, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyGroups = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [groupStats, setGroupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-groups');

  useEffect(() => {
    fetchMyGroups();
    fetchGroupStats();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups/my-groups');
      setMyGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching my groups:', error);
      toast.error('Failed to load your groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStats = async () => {
    try {
      const response = await api.get('/groups/stats');
      setGroupStats(response.data);
    } catch (error) {
      console.error('Error fetching group stats:', error);
    }
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'ngo': return '🏢';
      case 'shelter': return '🏠';
      case 'rescue': return '❤️';
      case 'community': return '👥';
      default: return '👤';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Groups
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your group memberships and activities
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            as={Link} 
            to="/groups" 
            variant="outline"
            icon={<Eye size={16} />}
          >
            Browse Groups
          </Button>
          <Button 
            as={Link} 
            to="/groups?create=true" 
            icon={<Plus size={16} />}
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {groupStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groupStats.totalGroups}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  My Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myGroups.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Admin/Mod
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myGroups.filter(g => g.userRole === 'admin' || g.userRole === 'moderator').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Week
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  +{myGroups.filter(g => {
                    const joinDate = new Date(g.joinedAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return joinDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Groups List */}
      {myGroups.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No groups yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Join communities and organizations to connect with other pet lovers 
            and make a difference in animal welfare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              as={Link} 
              to="/groups" 
              icon={<Eye size={16} />}
              variant="outline"
            >
              Browse Groups
            </Button>
            <Button 
              as={Link} 
              to="/groups?create=true" 
              icon={<Plus size={16} />}
            >
              Create Your First Group
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map((group) => (
            <Card key={group._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {group.avatar ? (
                      <img 
                        src={group.avatar} 
                        alt={group.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg">
                        {getGroupTypeIcon(group.type)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {group.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                          {group.userRole}
                        </span>
                        <span className="text-xs text-gray-500">
                          {group.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(group.userRole === 'admin' || group.userRole === 'moderator') && (
                    <Settings className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Group Info */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {group.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {group.memberCount}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {group.stats?.totalPosts || 0}
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Joined {new Date(group.joinedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    as={Link}
                    to={`/groups/${group._id}`}
                    size="sm"
                    className="flex-1"
                  >
                    View Group
                  </Button>
                  {(group.userRole === 'admin' || group.userRole === 'moderator') && (
                    <Button
                      as={Link}
                      to={`/groups/${group._id}/manage`}
                      size="sm"
                      variant="outline"
                      icon={<Settings size={14} />}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;
