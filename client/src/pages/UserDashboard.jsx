import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API, { petAPI } from '../utils/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PetCard from '../components/PetCard';
import Loading from '../components/ui/Loading';
import {
  PawPrint, Heart, PlusCircle, Star, Rocket, RefreshCcw, User as UserIcon, Layers,
  Trophy, Clock, Flame, ListChecks, Settings, ArrowRight, Compass, Globe2
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

        {loading && <div className="py-20"><Loading text="Assembling your data..." size="lg" /></div>}
        {!loading && (
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
            <Section title="My Adoptions" icon={Clock} action={<Button size="sm" variant="ghost" onClick={()=>wrap('adopted', async ()=>{ const res = await API.get('/pets/user/adopted'); setAdopted(res.data||[]); })} loading={loadingMap.adopted}>Refresh</Button>}>
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

            {/* Nearby */}
            {nearby.length > 0 && (
              <Section title="Nearby Pets" icon={Compass} action={<Button size="sm" variant="ghost" onClick={loadNearby} loading={loadingMap.nearby}>Refresh</Button>}>
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {nearby.slice(0,8).map(p => <PetCard key={p._id} pet={p} showAdoptButton />)}
                </div>
              </Section>
            )}

            {/* Insights */}
            {insights && (
              <Section title="Adoption Insights" icon={ListChecks} action={<Button size="sm" variant="ghost" onClick={()=>wrap('insights', async ()=>{ const res = await API.get('/pets/insights'); setInsights(res.data); })} loading={loadingMap.insights}>Refresh</Button>}>
                <div className="grid gap-5 md:grid-cols-3">
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"><Clock size={14}/> <span>Avg Adoption Time</span></div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{insights.averageAdoptionDuration ? `${Math.round(insights.averageAdoptionDuration / (1000*60*60*24))}d` : '—'}</p>
                  </Card>
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"><Flame size={14}/> <span>Total Adoptions</span></div>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{insights.adoptedCount}</p>
                  </Card>
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"><Trophy size={14}/> <span>Fastest Adoption</span></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{insights.fastestAdoption ? `${insights.fastestAdoption.name} • ${Math.round(insights.fastestAdoption.adoptionDuration/(1000*60*60*24))}d` : '—'}</p>
                  </Card>
                </div>
                {insights.topBreeds?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center space-x-2"><Globe2 size={12}/> <span>Popular Breeds</span></p>
                    <div className="flex flex-wrap gap-2">
                      {insights.topBreeds.map(b => (
                        <span key={b._id} className="px-2 py-1 rounded-full text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">{b._id} <span className="font-semibold">{b.count}</span></span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Call to action */}
            <div className="mt-20">
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
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
