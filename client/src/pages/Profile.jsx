import React, { useState, useEffect, useMemo } from 'react';
import { User, Heart, PlusCircle, Settings, Mail, Phone, MapPin, Calendar, Trophy, Eye, Star, Pencil, Upload, Filter, X, PawPrint, Flame } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [editTab, setEditTab] = useState('details');

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
    if (e?.preventDefault) e.preventDefault();
    setUpdating(true);
    try {
      const response = await API.put('/auth/profile', editForm);
      updateUser(response.data);
      setUserProfile(response.data);
      toast.success('Profile updated successfully!');
      if (showEditModal) setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e)=>{
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await API.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
      setEditTab('details');
    } catch(err){
      toast.error(err?.message || 'Failed to update password');
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async ()=>{
    if(!window.confirm('This will deactivate your account. Continue?')) return;
    try {
      await API.delete('/auth/account');
      toast.success('Account deactivated');
      localStorage.clear();
      window.location.href='/login';
    } catch(err){ toast.error(err?.message||'Failed to delete account'); }
  };

  const handlePetDeleted = (petId) => {
    setPostedPets(prev => prev.filter(pet => pet._id !== petId));
  };

  const engagement = useMemo(()=>{
    const totalViews = postedPets.reduce((s,p)=>s+(p.views||0),0);
    const totalLikes = postedPets.reduce((s,p)=>s+(p.likes?.length||0),0);
    return { totalViews, totalLikes, avgViews: postedPets.length? Math.round(totalViews/postedPets.length):0 };
  },[postedPets]);

  const adoptionRate = postedPets.length ? Math.round((adoptedPets.length/postedPets.length)*100) : 0;
  const likePerListing = postedPets.length ? (engagement.totalLikes/postedPets.length).toFixed(1) : '0.0';
  const viewPerLike = engagement.totalLikes ? (engagement.totalViews/engagement.totalLikes).toFixed(1) : '—';

  const filteredPosted = useMemo(()=>{
    let list = postedPets;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p=>p.name.toLowerCase().includes(s)||p.breed?.toLowerCase().includes(s));
    }
    if (urgencyFilter!=='all') list = list.filter(p=>p.urgency===urgencyFilter);
    if (categoryFilter!=='all') list = list.filter(p=>p.category===categoryFilter);
    return list;
  },[postedPets, search, urgencyFilter, categoryFilter]);

  // Normalize avatar URL like PetCard logic
  const buildImageUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
    return `${base.replace(/\/$/,'')}/${src.replace(/^\//,'')}`;
  };

  // Achievements
  const achievements = useMemo(()=>[
    {
      id:'starter',
      title:'First Listing',
      achieved: postedPets.length>=1,
      icon: PlusCircle,
      desc:'Posted your first pet'
    },
    {
      id:'rescuer',
      title:'5 Listings',
      achieved: postedPets.length>=5,
      icon: PawPrint,
      desc:'Posted 5 pets'
    },
    {
      id:'adopter',
      title:'First Adoption',
      achieved: adoptedPets.length>=1,
      icon: Heart,
      desc:'A pet you posted got adopted'
    },
    {
      id:'matchmaker',
      title:'3 Adoptions',
      achieved: adoptedPets.length>=3,
      icon: Heart,
      desc:'Helped 3 pets find homes'
    },
    {
      id:'impact',
      title:'50% Adoption Rate',
      achieved: (postedPets.length>0) && (adoptionRate>=50),
      icon: Trophy,
      desc:'Half your listings adopted'
    }
  ],[postedPets.length, adoptedPets.length, adoptionRate]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await API.post('/upload/image', formData, { headers:{'Content-Type':'multipart/form-data'} });
  const newAvatar = res.data.url || res.data.imageUrl;
      const updated = { ...editForm, avatar: newAvatar };
      const saveRes = await API.put('/auth/profile', updated);
      updateUser(saveRes.data);
      setUserProfile(saveRes.data);
      toast.success('Avatar updated');
    } catch {
      toast.error('Avatar upload failed');
    } finally { setAvatarUploading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"><Loading size="lg" text="Loading profile..." /></div>;

  const profile = userProfile || user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden ring-4 ring-white/10">
                  {profile?.avatar ? <img src={buildImageUrl(profile.avatar)} alt={profile.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.style.display='none';}}/> : <User size={46} className="text-white/80" />}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-full p-2 shadow cursor-pointer hover:scale-105 transition" title="Change avatar">
                  <Upload size={16}/>
                  <input onChange={handleAvatarUpload} type="file" accept="image/*" className="hidden" />
                </label>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
                  {profile?.name}
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/15 border border-white/20">Member</span>
                  <button
                    onClick={()=>setShowEditModal(true)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
                    title="Edit profile"
                  >
                    <Pencil size={16}/>
                  </button>
                </h1>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1"><Mail size={14}/>{profile?.email}</span>
                  {profile?.location && <span className="flex items-center gap-1"><MapPin size={14}/>{profile.location}</span>}
                  <span className="flex items-center gap-1"><Calendar size={14}/>Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                  {profile?.phone && <span className="flex items-center gap-1"><Phone size={14}/>{profile.phone}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Button variant="outline" onClick={()=>setShowEditModal(true)} icon={<Settings size={16}/>}>Edit Profile</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6 mb-10">
          <Metric icon={PlusCircle} label="Posted" value={postedPets.length} accent="from-primary-500 to-secondary-500" />
          <Metric icon={Heart} label="Adopted" value={adoptedPets.length} accent="from-emerald-500 to-teal-500" />
          <Metric icon={Star} label="Favorites" value={favoritePets.length} accent="from-pink-500 to-rose-500" />
          <Metric icon={Eye} label="Views" value={engagement.totalViews} accent="from-blue-500 to-indigo-500" />
          <Metric icon={Trophy} label="Adoption %" value={`${adoptionRate}%`} accent="from-amber-500 to-yellow-500" />
          <Metric icon={Flame} label="Likes" value={engagement.totalLikes} accent="from-fuchsia-500 to-pink-500" />
        </div>

        {/* Secondary insights */}
        <div className="grid gap-5 md:grid-cols-3 mb-12">
          <Insight title="Avg Views / Listing" value={engagement.avgViews} />
          <Insight title="Avg Likes / Listing" value={likePerListing} />
          <Insight title="Views per Like" value={viewPerLike} />
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Trophy size={18}/>Achievements</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {achievements.map(a=> (
              <div key={a.id} className={`min-w-[180px] rounded-xl border p-4 flex flex-col gap-2 transition shadow-sm ${a.achieved? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-300/50 dark:border-emerald-600/40':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-70'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.achieved? 'bg-emerald-500 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  <a.icon size={20} />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{a.desc}</p>
                </div>
                {a.achieved ? (
                  <div className="text-[10px] uppercase tracking-wide mt-auto text-emerald-600 dark:text-emerald-400 font-medium">Unlocked</div>
                ) : (
                  <div className="text-[10px] uppercase tracking-wide mt-auto text-gray-400">Locked</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs + filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <nav className="flex space-x-8">
            <button onClick={()=>setActiveTab('posted')} className={`pb-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab==='posted' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <PlusCircle size={16}/> <span>Posted Pets ({postedPets.length})</span>
            </button>
            <button onClick={()=>setActiveTab('adopted')} className={`pb-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab==='adopted' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Heart size={16}/> <span>Adopted Pets ({adoptedPets.length})</span>
            </button>
            <button onClick={()=>setActiveTab('favorites')} className={`pb-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab==='favorites' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Star size={16}/> <span>Favorites ({favoritePets.length})</span>
            </button>
          </nav>
          {activeTab==='posted' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={()=>setShowFilters(v=>!v)} icon={<Filter size={14}/>}>{showFilters? 'Hide Filters':'Filters'}</Button>
              { (search||urgencyFilter!=='all'||categoryFilter!=='all') && <Button variant="ghost" size="sm" onClick={()=>{ setSearch(''); setUrgencyFilter('all'); setCategoryFilter('all'); }} icon={<X size={14}/>}>Reset</Button> }
            </div>
          )}
        </div>
        {showFilters && activeTab==='posted' && (
          <Card className="p-6 mb-8 animate-slide-up">
            <div className="grid gap-5 md:grid-cols-3">
              <Input label="Search" placeholder="Name or breed" value={search} onChange={e=>setSearch(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                <select value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All</option>
                  {Array.from(new Set(postedPets.map(p=>p.category))).map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Tab Content */}
        {activeTab === 'posted' && (
          <div>
            {filteredPosted.length === 0 ? (
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
                {filteredPosted.map((pet) => (
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
        title="Manage Account"
      >
        <div className="flex gap-2 mb-4 text-sm font-medium">
          {['details','password','danger'].map(t=> (
            <button key={t} onClick={()=>setEditTab(t)} className={`px-3 py-1 rounded-lg border transition ${editTab===t? 'bg-primary-600 text-white border-primary-600':'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{t==='details'?'Details': t==='password'?'Password':'Danger'}</button>
          ))}
        </div>
        {editTab==='details' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <Input label="Phone" type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <Input label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
              <Button type="submit" loading={updating} disabled={updating}>Save Changes</Button>
            </div>
          </form>
        )}
        {editTab==='password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} required />
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} required />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} required />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={()=>setEditTab('details')}>Back</Button>
              <Button type="submit" loading={pwLoading} disabled={pwLoading}>Update Password</Button>
            </div>
          </form>
        )}
        {editTab==='danger' && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
              <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1">Deactivate Account</h3>
              <p className="text-sm text-red-600 dark:text-red-400">This will disable your account. Your listings remain but you cannot login until reactivated by an admin.</p>
              <Button variant="danger" onClick={handleDeleteAccount} className="mt-4 w-full">Deactivate Account</Button>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={()=>setShowEditModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;

// Reusable metric component
const Metric = ({ icon:Icon, label, value, accent }) => (
  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-4 shadow-sm">
    <div className={`p-3 rounded-lg bg-gradient-to-br ${accent} text-white shadow-inner`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">{value}</p>
    </div>
  </div>
);

const Insight = ({ title, value }) => (
  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col">
    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{title}</p>
    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

// removed faulty tabButton helper
