import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Key, Shield, Trash2, ArrowLeft, Save, Eye, EyeOff,
  Bell, Globe, Lock, Download, Upload, Check, X, AlertTriangle, Info, Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    adoptionUpdates: true,
    newMessages: true,
    communityUpdates: false,
    marketingEmails: false
  });

  // Account statistics
  const [accountStats, setAccountStats] = useState({
    totalPetsPosted: 0,
    successfulAdoptions: 0,
    accountAge: 0,
    loginCount: 0,
    lastLogin: null
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      
      // Load notification settings from user data
      if (user.notificationSettings) {
        setNotificationSettings(user.notificationSettings);
      }
      
      // Load account statistics
      fetchAccountStats();
    }
  }, [user]);

  const fetchAccountStats = async () => {
    try {
      const response = await API.get('/auth/account-stats');
      setAccountStats(response.data);
    } catch (error) {
      console.error('Failed to fetch account stats:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.put('/auth/profile', profileForm);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (setting, value) => {
    try {
      const updatedSettings = { ...notificationSettings, [setting]: value };
      setNotificationSettings(updatedSettings);
      await API.put('/auth/notification-settings', updatedSettings);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
      // Revert on error
      setNotificationSettings(notificationSettings);
    }
  };

  const downloadAccountData = async () => {
    try {
      const response = await API.get('/auth/export-data', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fureverhome-data-${user.name}-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Account data downloaded successfully');
    } catch (error) {
      toast.error('Failed to download account data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? This action will disable your account but preserve your data. You can contact support to reactivate it later.'
    );
    
    if (confirmed) {
      try {
        await API.delete('/auth/account');
        toast.success('Account deactivated successfully');
        logout();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to deactivate account');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'account', label: 'Account Overview', icon: Info },
    { id: 'danger', label: 'Account Management', icon: Trash2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" icon={<ArrowLeft size={16} />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <User className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Profile Information
                  </h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input
                        label="Full Name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        icon={<User size={16} />}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        icon={<Mail size={16} />}
                      />
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        icon={<Phone size={16} />}
                        placeholder="Optional"
                      />
                      <Input
                        label="Location"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        icon={<MapPin size={16} />}
                        placeholder="City, State"
                      />
                    </div>

                    {/* Account Info */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Member Since</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Shield className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Account Type</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {user?.role || 'User'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" loading={loading} icon={<Save size={16} />}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security & Password Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Security & Password
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" loading={loading} icon={<Save size={16} />}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300">
                          Stay Updated
                        </h3>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        Choose how you want to receive notifications about pet adoptions, messages, and platform updates.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries({
                        emailNotifications: { label: 'Email Notifications', desc: 'Receive notifications via email' },
                        pushNotifications: { label: 'Push Notifications', desc: 'Browser push notifications' },
                        adoptionUpdates: { label: 'Adoption Updates', desc: 'Updates about your posted pets' },
                        newMessages: { label: 'New Messages', desc: 'When someone sends you a message' },
                        communityUpdates: { label: 'Community Updates', desc: 'Platform news and community posts' },
                        marketingEmails: { label: 'Marketing Emails', desc: 'Promotional content and tips' }
                      }).map(([key, { label, desc }]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                          </div>
                          <button
                            onClick={() => handleNotificationUpdate(key, !notificationSettings[key])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              notificationSettings[key] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                notificationSettings[key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Overview Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Account Overview
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Account Statistics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="p-4 text-center">
                        <Upload className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {accountStats.totalPetsPosted}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pets Posted</p>
                      </Card>
                      
                      <Card className="p-4 text-center">
                        <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {accountStats.successfulAdoptions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Successful Adoptions</p>
                      </Card>
                      
                      <Card className="p-4 text-center">
                        <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {Math.floor((new Date() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
                      </Card>
                      
                      <Card className="p-4 text-center">
                        <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {accountStats.loginCount || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Logins</p>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Updated</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Last updated your profile information</p>
                          </div>
                        </div>
                        
                        {accountStats.lastLogin && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Lock className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(accountStats.lastLogin).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <Button
                          variant="outline"
                          onClick={downloadAccountData}
                          icon={<Download size={16} />}
                          className="justify-start"
                        >
                          Download My Data
                        </Button>
                        
                        <Link to="/post-pet">
                          <Button
                            variant="outline"
                            icon={<Upload size={16} />}
                            className="justify-start w-full"
                          >
                            Post New Pet
                          </Button>
                        </Link>
                        
                        <Link to="/help">
                          <Button
                            variant="outline"
                            icon={<Info size={16} />}
                            className="justify-start w-full"
                          >
                            Get Help
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Data Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Privacy & Data
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Data Usage
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
                        Your data is used to provide pet adoption services and improve your experience on FurEverHome.
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                        <li>• Profile information for creating your account</li>
                        <li>• Pet listings and adoption history</li>
                        <li>• Communication preferences</li>
                        <li>• Platform usage analytics (anonymized)</li>
                      </ul>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Link to="/privacy">
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Privacy Policy</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Learn how we collect, use, and protect your personal information.
                          </p>
                        </Card>
                      </Link>
                      
                      <Link to="/terms">
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Terms of Service</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Review the terms and conditions for using FurEverHome.
                          </p>
                        </Card>
                      </Link>
                    </div>

                    {/* Data Management */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Export Account Data</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Download a copy of all your account data including profile, pets, and activity history.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={downloadAccountData}
                              icon={<Download size={16} />}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-orange-900 dark:text-orange-300">Data Retention</h4>
                              <p className="text-sm text-orange-800 dark:text-orange-400">
                                Your data is retained as long as your account is active. Deactivated accounts preserve data for 90 days before permanent deletion.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Management Tab */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Account Management
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Account Status */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Check className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-medium text-green-900 dark:text-green-300">Account Active</h3>
                          <p className="text-sm text-green-800 dark:text-green-400">
                            Your account is active and in good standing. Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Data Export & Backup
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Before making any account changes, you can download a complete backup of your data including profile information, pet listings, and activity history.
                      </p>
                      <Button
                        variant="outline"
                        onClick={downloadAccountData}
                        icon={<Download size={16} />}
                      >
                        Download Account Data
                      </Button>
                    </div>

                    {/* Account Deactivation */}
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start space-x-3 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                            Deactivate Account
                          </h3>
                          <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                            Deactivating your account will disable your access to FurEverHome. This is a reversible action - you can contact support to reactivate your account at any time.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                          What happens when you deactivate:
                        </p>
                        <ul className="text-sm text-red-800 dark:text-red-400 space-y-1 mb-4">
                          <li>• Your account login will be disabled</li>
                          <li>• Pet listings remain visible to help ongoing adoptions</li>
                          <li>• Personal data is preserved for potential reactivation</li>
                          <li>• Messages and communication history are maintained</li>
                          <li>• You can reactivate by contacting support anytime</li>
                        </ul>
                        
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-400">
                              <strong>Important:</strong> If you have active pet listings with interested adopters, consider completing those processes before deactivating.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        icon={<Trash2 size={16} />}
                      >
                        Deactivate My Account
                      </Button>
                    </div>

                    {/* Support Section */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Need Help?
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        If you're having issues with your account, want to provide feedback, or need assistance with anything, our support team is here to help.
                      </p>
                      <div className="flex space-x-3">
                        <Link to="/help">
                          <Button variant="outline" size="sm" icon={<Info size={16} />}>
                            Contact Support
                          </Button>
                        </Link>
                        <Link to="/community">
                          <Button variant="outline" size="sm" icon={<Globe size={16} />}>
                            Community Forum
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
