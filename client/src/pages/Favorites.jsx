import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ArrowLeft, RefreshCcw, Funnel, X, Search, Star, PawPrint, Flame, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PetCard from '../components/PetCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

// Small metric widget
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

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchFavorites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await API.get('/pets/user/favorites');
      setFavorites(response.data||[]);
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally { setLoading(false); }
  };

  const refresh = async () => { setRefreshing(true); await fetchFavorites(); setRefreshing(false); };

  // Derived data
  const categories = useMemo(() => {
    const counts = favorites.reduce((acc, p) => { if (p.category) acc[p.category]=(acc[p.category]||0)+1; return acc; }, {}); return counts; }, [favorites]);
  const urgencyCounts = useMemo(()=>{
    const counts = favorites.reduce((acc,p)=>{ if(p.urgency) acc[p.urgency]=(acc[p.urgency]||0)+1; return acc; },{}); return counts;},[favorites]);

  useEffect(()=>{
    let list = [...favorites];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.breed?.toLowerCase().includes(s) || p.location?.toLowerCase().includes(s));
    }
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (urgencyFilter !== 'all') list = list.filter(p => p.urgency === urgencyFilter);
    setFiltered(list);
  }, [favorites, search, categoryFilter, urgencyFilter]);

  const handlePetUnliked = (petId) => {
    // Remove locally; like toggle endpoint already called in card
    setFavorites(prev => prev.filter(pet => pet._id !== petId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Loading size="lg" text="Loading your favorites..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-16">
      {/* Hero / header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Button variant="ghost" size="sm" onClick={()=>navigate(-1)} icon={<ArrowLeft size={16}/>} className="mb-4 text-white/80 hover:text-white hover:bg-white/10 border border-white/10" >Back</Button>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center space-x-3"><Heart size={34} className="text-pink-300" /><span>Your Favorites</span></h1>
              <p className="mt-3 text-white/85 max-w-2xl text-sm md:text-base">Curated pets you've shown interest in. Revisit, compare, and move forward with adoption decisions.</p>
              <p className="mt-2 text-xs text-white/60">{favorites.length} saved • {Object.keys(categories).length} categories • {Object.values(urgencyCounts).reduce((a,b)=>a+b,0)} total signals</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={()=>setShowFilters(v=>!v)} icon={<Funnel size={16}/>}>{showFilters? 'Hide Filters':'Filters'}</Button>
              <Button variant="outline" size="sm" onClick={refresh} loading={refreshing} icon={<RefreshCcw size={16}/>}>Refresh</Button>
              <Button size="sm" onClick={()=>navigate('/')} variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border border-white/20" icon={<PawPrint size={16}/>}>Browse Pets</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-8 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <Metric icon={Heart} label="Total Favorites" value={favorites.length} />
          <Metric icon={Star} label="Unique Breeds" value={new Set(favorites.map(f=>f.breed)).size} accent="from-amber-500 to-yellow-500" />
          <Metric icon={Flame} label="High Urgency" value={favorites.filter(f=>f.urgency==='high').length} accent="from-rose-500 to-pink-500" />
          <Metric icon={PawPrint} label="Categories" value={Object.keys(categories).length} accent="from-emerald-500 to-teal-500" />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-8 animate-slide-up space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent flex items-center space-x-2"><Funnel size={18}/> <span>Refine</span></h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={()=>{ setSearch(''); setCategoryFilter('all'); setUrgencyFilter('all'); }} icon={<X size={14}/>}>Reset</Button>
                <Button variant="secondary" size="sm" onClick={()=>setShowFilters(false)}>Done</Button>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Input label="Search" placeholder="Name, breed, location..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search size={18}/>}/>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All</option>
                  {Object.keys(categories).map(c=> <option key={c} value={c}>{c} ({categories[c]})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                <select value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="all">All</option>
                  {['high','medium','low'].filter(u=>urgencyCounts[u]).map(u=> <option key={u} value={u}>{u} ({urgencyCounts[u]})</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Button size="sm" variant={view==='grid'?'primary':'outline'} onClick={()=>setView('grid')} icon={<Grid size={14}/>}>Grid</Button>
                <Button size="sm" variant={view==='list'?'primary':'outline'} onClick={()=>setView('list')} icon={<List size={14}/>}>List</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <Card className="text-center py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/10 dark:to-secondary-900/10" />
            <div className="relative">
              <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg ring-4 ring-white/40 dark:ring-gray-800/40">
                <Heart size={46} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No favorites yet</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6 text-sm">Start browsing pets and tap the heart icon to curate your shortlist. You'll see them here with live urgency and adoption updates.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={()=>navigate('/')} icon={<PawPrint size={18}/>}>Browse Pets</Button>
                <Button size="lg" variant="secondary" onClick={refresh} icon={<RefreshCcw size={18}/>}>Reload</Button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/20 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-72 h-72 bg-secondary-400/10 dark:bg-secondary-600/20 rounded-full blur-3xl" />
          </Card>
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(p => (
                  <PetCard key={p._id} pet={p} onLike={handlePetUnliked} showAdoptButton={true} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(p => (
                  <div key={p._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="p-4"><PetCard pet={p} onLike={handlePetUnliked} showAdoptButton={true} /></div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-16">
              <div className="relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-900/40 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-8 md:p-10 text-white flex flex-col md:flex-row items-start md:items-center gap-8 shadow-xl">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight">Ready to Keep Exploring?</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">Favorites refine future recommendations. Keep browsing to help the system learn your preferences and surface better matches.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={()=>navigate('/')} size="lg" variant="secondary" icon={<PawPrint size={18}/>}>Browse More</Button>
                  <Button onClick={refresh} size="lg" className="bg-white text-primary-600 hover:bg-white/90" icon={<RefreshCcw size={18}/>}>Refresh Data</Button>
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

export default Favorites;
