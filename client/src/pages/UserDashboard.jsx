import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API, { petAPI } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PetCard from '../components/PetCard';
import Loading from '../components/ui/Loading';
import MyGroups from '../components/MyGroups';
import {
  PawPrint, Heart, PlusCircle, Star, Rocket, RefreshCcw, User as UserIcon, Layers,
  Trophy, Clock, Flame, ListChecks, Settings, ArrowRight, Compass, Globe2, Users
} from 'lucide-react';

// Lightweight metric widget
const Metric = ({ icon:Icon, label, value, accent='from-primary-500 to-secondary-500' }) => (
  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-4 shadow-sm">
    <div className={`p-3 rounded-lg bg-gradient-to-br ${accent} text-white shadow-inner`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">{value ?? '—'}</p>
    </div>
  </div>
);

const Section = ({ title, icon:Icon, action, children }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg md:text-xl font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
        {Icon && <Icon size={18} className="text-primary-600" />}<span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{title}</span>
      </h3>
      {action}
    </div>
    {children}
  </div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [posted, setPosted] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [adopted, setAdopted] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loadingMap, setLoadingMap] = useState({ fav:false, post:false, rec:false, stats:false, insights:false, nearby:false });

  const wrap = async (key, fn) => { try { setLoadingMap(p=>({...p,[key]:true})); await fn(); } finally { setLoadingMap(p=>({...p,[key]:false})); } };

  const loadCore = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      wrap('fav', async ()=>{ try { const data = await petAPI.getFavoritePets(); setFavorites(Array.isArray(data)?data:data.favorites||[]); } catch(e) { /* silent */ } }),
      wrap('post', async ()=>{ try { const data = await petAPI.getUserPets(); setPosted(Array.isArray(data)?data:data.pets||[]); } catch(e) { /* silent */ } }),
      wrap('adopted', async ()=>{ try { const res = await API.get('/pets/user/adopted'); setAdopted(res.data||[]); } catch(e){} }),
      wrap('rec', async ()=>{ try { const res = await API.get('/pets/recommended'); setRecommended(res.data||[]); } catch(e){ /* silent */ } }),
      wrap('stats', async ()=>{ try { const res = await API.get('/pets/stats'); setStats(res.data); } catch(e){} }),
      wrap('insights', async ()=>{ try { const res = await API.get('/pets/insights'); setInsights(res.data); } catch(e){} })
    ]);
    setLoading(false);
  }, []);

  const loadNearby = () => wrap('nearby', async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await API.get(`/pets/nearby?lat=${latitude}&lon=${longitude}`);
        setNearby(res.data||[]);
      } catch(e) {}
    });
  });

  useEffect(()=>{ loadCore(); loadNearby(); }, [loadCore]);

  if (!user) {
    // Should never hit due to route protection, but just in case
    return <div className="py-20 text-center"><Loading text="Loading your dashboard..." /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent flex items-center space-x-3">
                <span>Welcome back, {user.name?.split(' ')[0] || 'Friend'} 🐾</span>
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl text-sm md:text-base">Your personalized adoption hub. Track favorites, manage your listings, and discover pets curated just for you.</p>
              {stats && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Platform impact: {stats.totalPets} total pets • {insights?.adoptedCount ?? '—'} adoptions • Adoption rate {stats.adoptionRate || '—'}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/post-pet" size="sm" icon={<PlusCircle size={16}/>}>Post a Pet</Button>
              <Button to="/favorites" variant="secondary" size="sm" icon={<Heart size={16}/>}>Favorites</Button>
              <Button variant="outline" size="sm" onClick={loadCore} icon={<RefreshCcw size={16}/>}>Refresh</Button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-12">
          <Metric icon={Heart} label="Favorites" value={favorites.length} />
            <Metric icon={PawPrint} label="My Listings" value={posted.length} accent="from-secondary-500 to-primary-500" />
          <Metric icon={Star} label="Recommendations" value={recommended.length} accent="from-amber-500 to-yellow-500" />
          <Metric icon={Trophy} label="Total Adoptions" value={insights?.adoptedCount} accent="from-emerald-500 to-teal-500" />
          <Metric icon={Clock} label="My Adoptions" value={adopted.length} accent="from-fuchsia-500 to-pink-500" />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Compass },
                { id: 'groups', label: 'My Groups', icon: Users },
                { id: 'pets', label: 'My Pets', icon: PawPrint },
                { id: 'activity', label: 'Activity', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading && <div className="py-20"><Loading text="Assembling your data..." size="lg" /></div>}
        {!loading && (
          <>
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Recommended */}
                {recommended.length > 0 && (
                  <Section title="Recommended For You" icon={Star} action={<Button size="sm" variant="ghost" onClick={()=>wrap('rec', async ()=>{ const res = await API.get('/pets/recommended'); setRecommended(res.data||[]); })} loading={loadingMap.rec}>Refresh</Button>}>
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {recommended.slice(0,8).map(p => <PetCard key={p._id} pet={p} showAdoptButton />)}
                    </div>
                  </Section>
                )}

                {/* Favorites */}
                <Section title="Your Favorites" icon={Heart} action={<Button size="sm" variant="ghost" to="/favorites" icon={<ArrowRight size={14}/>}>View All</Button>}>
                  {favorites.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">You haven't added any favorites yet. Browse pets and tap the heart to save them.</p>
                      <div className="mt-4"><Button to="/" size="sm">Browse Pets</Button></div>
                    </Card>
                  ) : (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {favorites.slice(0,8).map(p => <PetCard key={p._id} pet={p} showAdoptButton />)}
                    </div>
                  )}
                </Section>
              </>
            )}

            {activeTab === 'groups' && <MyGroups />}

            {activeTab === 'pets' && (
              <>
                {/* My Listings */}
                <Section title="My Listings" icon={PawPrint} action={<Button size="sm" variant="ghost" to="/post-pet" icon={<PlusCircle size={14}/>}>Add New</Button>}>
                  {posted.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You haven't posted any pets yet.</p>
                      <Button to="/post-pet" size="sm" icon={<PlusCircle size={14}/>}>Post Your First Pet</Button>
                    </Card>
                  ) : (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {posted.slice(0,8).map(p => <PetCard key={p._id} pet={p} showAdoptButton />)}
                    </div>
                  )}
                </Section>

                {/* My Adoptions */}
                <Section title="My Adoptions" icon={Clock}>
                  {adopted.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You haven't adopted any pets yet.</p>
                      <Button to="/" size="sm">Find a Pet</Button>
                    </Card>
                  ) : (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {adopted.slice(0,8).map(p => <PetCard key={p._id} pet={p} showAdoptButton={false} />)}
                    </div>
                  )}
                </Section>
              </>
            )}

            {activeTab === 'activity' && (
              <Section title="Recent Activity" icon={Clock}>
                <Card className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Activity Feed Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We're working on bringing you a comprehensive activity feed to track all your interactions.
                  </p>
                </Card>
              </Section>
            )}

            {/* CTA */}
            {activeTab === 'overview' && (
              <div className="mt-16">
                <div className="relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-900/40 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-8 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center gap-8 shadow-xl">
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight">Ready to Help Another Pet?</h3>
                    <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">Post a new listing or keep exploring recommendations. Every interaction improves the matching intelligence.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button to="/post-pet" size="lg" variant="secondary" icon={<PlusCircle size={18}/>}>Post a Pet</Button>
                    <Button to="/" size="lg" className="bg-white text-primary-600 hover:bg-white/90" icon={<PawPrint size={18}/>}>Browse More</Button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
