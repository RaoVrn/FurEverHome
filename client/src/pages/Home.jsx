import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, X, BarChart3, Flame, Compass, Star, RefreshCcw, ArrowRight, ArrowLeft, Heart, Trophy, Clock, PawPrint, Sparkles, PlusCircle, ArrowUpRight,
  ShieldCheck, Globe2, Users, CheckCircle2, Info, HelpCircle, Leaf, LifeBuoy, Brain, Megaphone, Award, Rocket, HandHeart
} from 'lucide-react';
import PetCard from '../components/PetCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import API from '../utils/api';
import toast from 'react-hot-toast';

// VALUE & STORY SECTIONS (Static presentational components)
const SectionWrapper = ({ id, children, className='' }) => (
  <section id={id} className={`relative py-16 ${className}`}>{children}</section>
);

const GradientTitle = ({ icon:Icon, eyebrow, title, highlight, sub }) => (
  <div className="mb-10 text-center max-w-3xl mx-auto">
    {eyebrow && <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-4 tracking-wide">
      {Icon && <Icon size={14} className="mr-2" />} {eyebrow}
    </div>}
    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-50 dark:to-white bg-clip-text text-transparent">
      {title} {highlight && <span className="text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text">{highlight}</span>}
    </h2>
    {sub && <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{sub}</p>}
  </div>
);

const ValueGrid = () => {
  const values = [
    { icon:HandHeart, title:'Mission-Driven Platform', desc:'Built to accelerate safe, ethical pet adoption while empowering rescuers and families with better tools.' },
    { icon:ShieldCheck, title:'Safety & Verification', desc:'Profiles, activity tracking, moderation signals & fraud-resistant flows reduce risk and build trust.' },
    { icon:Users, title:'Community Impact', desc:'Every adoption frees space for another rescue. Transparent stats keep impact measurable.' },
    { icon:Leaf, title:'Sustainable Choice', desc:'Adopting reduces demand for unethical breeding and lowers the environmental pawprint.' },
    { icon:Brain, title:'Smart Matching', desc:'Behavioral signals, preferences & interaction patterns inform evolving recommendation models.' },
    { icon:LifeBuoy, title:'Post-Adoption Support', desc:'Guides, care checklists & follow‑ups help each placement succeed long-term.' }
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {values.map(v => (
        <div key={v.title} className="group relative p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur hover:shadow-lg transition-all overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary-50/60 to-secondary-50/60 dark:from-primary-900/10 dark:to-secondary-900/10 transition-opacity" />
          <div className="relative flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-inner">
              <v.icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{v.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProcessSteps = () => {
  const steps = [
    { icon:PawPrint, title:'1. Discover', text:'Filter, search & explore verified pet profiles with health, behavior & compatibility tags.' },
    { icon:Heart, title:'2. Shortlist', text:'Save favorites & compare temperament, size, energy level and care requirements.' },
    { icon:Megaphone, title:'3. Apply Securely', text:'Structured adoption intent form reduces friction & surfaces strong matches to rescuers.' },
    { icon:ShieldCheck, title:'4. Screening', text:'Rescuers review signals & history. In-app messaging streamlines clarifications.' },
    { icon:CheckCircle2, title:'5. Meet & Confirm', text:'Schedule meetups or virtual intros. Finalize readiness transparently.' },
    { icon:Sparkles, title:'6. Transition & Support', text:'Post-adoption resources & milestone nudges encourage stable bonding.' }
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {steps.map(s => (
        <div key={s.title} className="relative p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-400/70 dark:hover:border-primary-600/60 transition-colors">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow">
              <s.icon size={18} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white tracking-tight">{s.title}</h4>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{s.text}</p>
        </div>
      ))}
    </div>
  );
};

const FAQ = () => {
  const qa = [
    { q:'What makes this platform different?', a:'It unifies discovery, verification, matching intelligence and post‑adoption continuity into one cohesive workflow.' },
    { q:'Are pets medically evaluated?', a:'Listings display vaccination, neuter status & any disclosed medical notes. Verification workflows are expanding.' },
    { q:'Is there a fee?', a:'Most rescues list transparent adoption fees that offset care costs. Platform core browsing is free.' },
    { q:'How do recommendations work?', a:'Early stage heuristic scoring + preference filters. Roadmap includes adaptive behavioral embeddings.' },
    { q:'Can I list a pet needing rehoming?', a:'Yes—after creating an account you can post responsibly with required details & follow review guidelines.' },
    { q:'Do you support shelters?', a:'Shelter org dashboards (beta) aggregate analytics, streamline inquiry triage and amplify visibility.' }
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {qa.map(item => (
        <div key={item.q} className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-start"><HelpCircle size={16} className="mr-2 text-primary-600" />{item.q}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  );
};

const MetricsBand = ({ stats, insights }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <div className="p-6 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow">
      <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Platform</p>
      <p className="text-3xl font-bold">{stats?.totalPets ?? '—'}</p>
      <p className="text-sm opacity-90">Total Pets Indexed</p>
    </div>
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Adoption Rate</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.adoptionRate || '—'}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Across active lifecycle</p>
    </div>
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Avg Placement Time</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{insights?.averageAdoptionDuration ? `${Math.round(insights.averageAdoptionDuration/(1000*60*60*24))}d` : '—'}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">From listing to adoption</p>
    </div>
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Engagement</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2"><Star size={20} className="text-primary-500" /><span>{insights?.adoptedCount ?? '—'}</span></p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Successful Adoptions</p>
    </div>
  </div>
);

const Home = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [geoError, setGeoError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [loadingExtra, setLoadingExtra] = useState({ stats: false, trending: false, recommended: false, nearby: false });
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    breed: '',
    minAge: '',
    maxAge: '',
    gender: '',
    size: '',
    location: '',
    urgency: ''
  });

  const categories = ['dog', 'cat', 'bird', 'rabbit', 'other'];
  const genders = ['male', 'female'];
  const sizes = ['small', 'medium', 'large'];
  const urgencyLevels = ['low', 'medium', 'high'];

  const fetchPets = async (overridePage = page, overrideSort = sort) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });
      params.append('page', overridePage);
      params.append('sort', overrideSort);

      const response = await API.get(`/pets?${params.toString()}`);
      const data = response.data;
      const petsData = data.pets || data; // fallback
      setPets(petsData);
      setFilteredPets(petsData);
      if (data.pagination) {
        setPage(data.pagination.page);
        setPages(data.pagination.pages);
      } else {
        setPage(1); setPages(1);
      }
    } catch (error) {
      toast.error('Failed to fetch pets');
      console.error('Error fetching pets:', error);
      setPets([]);
      setFilteredPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets(1);
    loadStats();
    loadTrending();
    loadRecommended();
    detectLocation();
    loadInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { search, ...otherFilters } = filters;
    let filtered = pets;

    // Apply search filter locally for instant results
    if (search) {
      filtered = pets.filter(pet =>
        pet.name.toLowerCase().includes(search.toLowerCase()) ||
        pet.breed.toLowerCase().includes(search.toLowerCase()) ||
        pet.description?.toLowerCase().includes(search.toLowerCase()) ||
        pet.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredPets(filtered);
  }, [filters.search, pets]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
  fetchPets(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      breed: '',
      minAge: '',
      maxAge: '',
      gender: '',
      size: '',
      location: '',
      urgency: ''
    });
  fetchPets(1);
  };

  const handlePetAdopted = (petId) => {
    setPets(prev => prev.filter(pet => pet._id !== petId));
    setFilteredPets(prev => prev.filter(pet => pet._id !== petId));
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value.trim() !== '').length;

  // Get unique pets for main grid (excluding those in featured sections)
  const uniqueMainPets = useMemo(() => {
    const featuredIds = new Set([
      ...(trending?.map(p => p._id) || []),
      ...(recommended?.map(p => p._id) || []),
      ...(nearby?.map(p => p._id) || [])
    ]);
    return filteredPets.filter(pet => !featuredIds.has(pet._id));
  }, [filteredPets, trending, recommended, nearby]);

  // Extra data loaders (real data, no hardcoding)
  const wrapLoader = async (key, fn) => {
    try { setLoadingExtra(prev => ({ ...prev, [key]: true })); await fn(); } finally { setLoadingExtra(prev => ({ ...prev, [key]: false })); }
  };

  const loadStats = () => wrapLoader('stats', async () => {
    try { const res = await API.get('/pets/stats'); setStats(res.data); } catch (e) { console.warn('Stats load failed', e); }
  });
  const loadTrending = () => wrapLoader('trending', async () => {
    try { 
      const res = await API.get('/pets/trending?limit=12'); 
      setTrending(res.data); 
    } catch (e) { console.warn('Trending load failed', e); }
  });
  const loadRecommended = () => wrapLoader('recommended', async () => {
    try { 
      const token = localStorage.getItem('token'); 
      if (!token) return; 
      const res = await API.get('/pets/recommended?limit=12'); 
      setRecommended(res.data); 
    } catch (e) { console.warn('Recommended load failed', e); }
  });
  const detectLocation = () => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await wrapLoader('nearby', async () => {
          const { latitude, longitude } = pos.coords; 
          const res = await API.get(`/pets/nearby?lat=${latitude}&lon=${longitude}`);
          setNearby(res.data);
        });
      } catch (e) { console.warn('Nearby load failed', e); }
    }, (err) => setGeoError(err.message));
  };
  const loadInsights = async () => { try { setLoadingInsights(true); const res = await API.get('/pets/insights'); setInsights(res.data); } catch(e){ console.warn('Insights load failed', e); } finally { setLoadingInsights(false); } };

  const handlePageChange = (newPage) => { if (newPage>=1 && newPage<=pages) fetchPets(newPage); };
  const handleSortChange = (e) => { setSort(e.target.value); fetchPets(1, e.target.value); };

  const StatCard = ({ icon: Icon, label, value, accent='from-primary-500 to-secondary-500' }) => (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-4 shadow hover:shadow-lg transition-shadow">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${accent} text-white shadow-inner`}> <Icon size={20} /> </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, action, subtle=false }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-xl font-bold flex items-center space-x-2 ${subtle ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
        {Icon && <Icon size={20} className="text-primary-600" />}<span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{title}</span>
      </h3>
      {action}
    </div>
  );

  const CategoryChip = ({ value, active, count, onClick }) => (
    <button
      onClick={onClick}
      className={`group relative px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 border backdrop-blur transition-all duration-200
        ${active
          ? 'bg-primary-600 text-white border-primary-600 shadow'
          : 'bg-white/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-700'}
      `}
    >
      <span className="capitalize">{value}</span>
      {typeof count === 'number' && <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{count}</span>}
    </button>
  );

  const SkeletonCard = () => (
    <div className="animate-pulse h-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* HERO / PRODUCT POSITIONING */}
      <div className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600" />
  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-white">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-[13px] mb-6 border border-white/20">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Ethical • Data‑Aware • Impact‑Focused</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
                Reimagining <span className="bg-gradient-to-r from-secondary-200 via-primary-100 to-white bg-clip-text text-transparent">Pet Adoption</span> with Intelligence & Care
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl font-light">
                FurEverHome connects compassionate adopters and verified rescuers through transparent profiles, smart matching, actionable insights, and long‑term support features—reducing friction and maximizing successful placements.
              </p>
              <div className="mt-8 max-w-xl">
                <Input
                  placeholder="Search by name, breed, temperament, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  icon={<Search size={20} />}
                  className="text-gray-900 text-base md:text-lg py-3"
                  containerClassName="shadow-xl"
                />
                <div className="flex flex-wrap gap-3 mt-5">
                  <Button onClick={()=>document.getElementById('pets')?.scrollIntoView({behavior:'smooth'})} size="lg" className="bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-400" icon={<PawPrint size={18}/>}>Browse Pets</Button>
                  <Button variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/10 hover:text-white focus:ring-white/40" onClick={()=>setShowFilters(true)} icon={<Filter size={18}/>}>Filters</Button>
                  <Button variant="secondary" size="lg" className="bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400" onClick={()=>window.location.href='/register'} icon={<PlusCircle size={18}/>}>Get Started</Button>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-5 text-left">
                <div>
                  <p className="text-2xl font-bold">{stats?.availablePets ?? '—'}</p>
                  <p className="text-xs uppercase tracking-wider text-white/70">Available Now</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{insights?.adoptedCount ?? '—'}</p>
                  <p className="text-xs uppercase tracking-wider text-white/70">Total Placements</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.categoryDistribution?.length ?? '—'}</p>
                  <p className="text-xs uppercase tracking-wider text-white/70">Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.adoptionRate || '—'}</p>
                  <p className="text-xs uppercase tracking-wider text-white/70">Adoption Rate</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative h-full">
                <div className="absolute inset-0 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-6 flex flex-col justify-between shadow-xl">
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold text-base flex items-center tracking-wide"><Rocket size={18} className="mr-2 text-primary-200"/>Platform Roadmap</h3>
                    <ul className="text-sm text-white/85 space-y-1.5 list-disc list-inside">
                      <li>Trust & verification scoring layer (Q3)</li>
                      <li>ML-driven compatibility engine (Q4)</li>
                      <li>Shelter analytics dashboards</li>
                      <li>Behavioral enrichment tagging</li>
                      <li>Internationalization rollout</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs leading-relaxed text-white/80">Mission: accelerate ethical adoptions with clarity, empathy & intelligent tooling—unlocking better outcomes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="discovery">
        {/* PRODUCT VALUE PROPOSITION */}
        <SectionWrapper id="value" className="pt-0 pb-8">
          <GradientTitle eyebrow="Built for Sustainable Adoption" title="A Platform Designed" highlight="For Outcomes" sub="We combine structured pet data, ethical guidelines, behavioral insights and proactive support to reduce failed placements." />
          <ValueGrid />
        </SectionWrapper>

        {/* PROCESS */}
        <SectionWrapper id="process" className="pt-4 pb-8">
          <GradientTitle eyebrow="Clear Journey" title="How FurEverHome" highlight="Works" sub="Transparent steps empower both adopters and rescuers—reducing friction & misalignment." />
          <ProcessSteps />
        </SectionWrapper>

        {/* METRICS */}
        <SectionWrapper id="metrics" className="pt-4 pb-4">
          <GradientTitle eyebrow="Live Impact" title="Tracking Real" highlight="Progress" sub="Impact transparency builds trust and informs smarter system improvements." />
          <MetricsBand stats={stats} insights={insights} />
        </SectionWrapper>
  {/* DISCOVERY / FILTER BAR */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Available Pets ({filteredPets.length})
              </h2>
              {activeFiltersCount > 0 && (
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <select value={sort} onChange={handleSortChange} className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 focus:outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Fee: Low to High</option>
                <option value="price-high">Fee: High to Low</option>
                <option value="urgency">Urgency</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter size={16} />}
                className="relative"
              >
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  icon={<X size={16} />}
                  size="sm"
                >
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={<RefreshCcw size={16}/> } onClick={()=>fetchPets(page, sort)} />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mt-4 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Advanced Filters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Breed"
                  placeholder="e.g., Labrador, Persian"
                  value={filters.breed}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Size
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Size</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Min Age"
                  type="number"
                  placeholder="0"
                  value={filters.minAge}
                  onChange={(e) => handleFilterChange('minAge', e.target.value)}
                />

                <Input
                  label="Max Age"
                  type="number"
                  placeholder="20"
                  value={filters.maxAge}
                  onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                />

                <Input
                  label="Location"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => handleFilterChange('urgency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Priority</option>
                    {urgencyLevels.map(urgency => (
                      <option key={urgency} value={urgency}>
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Category Chips */}
        {stats && (
          <div className="flex flex-wrap gap-3 mb-10">
            {['all', ...stats.categoryDistribution.map(c=>c._id)].map(cat => (
              <CategoryChip
                key={cat}
                value={cat === 'all' ? 'All' : cat}
                active={cat !== 'all' && filters.category === cat}
                count={cat === 'all' ? stats.totalPets : stats.categoryDistribution.find(c=>c._id===cat)?.count}
                onClick={() => {
                  if (cat === 'all') { handleFilterChange('category',''); fetchPets(1); }
                  else { handleFilterChange('category', cat); fetchPets(1); }
                }}
              />
            ))}
          </div>
        )}

        {/* CATEGORY DISTRIBUTION TAGS */}
        {stats?.categoryDistribution?.length > 0 && (
          <div className="mb-8 -mt-4">
            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center"><Info size={14} className="mr-2"/>Category Distribution</h4>
            <div className="flex flex-wrap gap-3">
              {stats.categoryDistribution.map(c => (
                <span key={c._id} className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                  {c._id} <span className="text-primary-600 dark:text-primary-400 font-semibold">{c.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Featured Sections - Optimized Layout */}
        <div className="space-y-8 mb-8">
          
          {/* Trending Section */}
          {trending?.length > 0 && (
            <div>
              <SectionHeader title="Trending Now" icon={Flame} action={<Button variant="ghost" size="sm" onClick={loadTrending} loading={loadingExtra.trending}>Refresh</Button>} />
              <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
                <div className="flex space-x-5 snap-x snap-mandatory pb-4">
                  {trending.slice(0, 6).map(p => (
                    <div key={p._id} className="snap-start w-72 flex-shrink-0">
                      <PetCard pet={p} showAdoptButton />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Section (only if logged in and different from trending) */}
          {recommended?.length > 0 && recommended.some(r => !trending?.find(t => t._id === r._id)) && (
            <div>
              <SectionHeader title="Recommended For You" icon={Star} action={<Button variant="ghost" size="sm" onClick={loadRecommended} loading={loadingExtra.recommended}>Refresh</Button>} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.filter(r => !trending?.find(t => t._id === r._id)).slice(0, 6).map(p => <PetCard key={p._id} pet={p} showAdoptButton />)}
              </div>
            </div>
          )}

          {/* Adoption Success & Insights - Compact Version */}
          {insights && insights.recentAdoptions?.length > 0 && (
            <div>
              <SectionHeader title="Recent Success Stories" icon={Trophy} action={<Button variant="ghost" size="sm" onClick={loadInsights} loading={loadingInsights}>Refresh</Button>} />
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Success Stories - Compact Grid */}
                <div className="lg:col-span-3">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {insights.recentAdoptions.slice(0, 4).map(p => (
                      <div key={p._id} className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="relative h-32 overflow-hidden">
                          <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2 text-white drop-shadow">
                            <p className="text-sm font-semibold">{p.name}</p>
                            <p className="text-xs opacity-80">Adopted!</p>
                          </div>
                        </div>
                        <div className="p-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                          <span className="text-green-600 dark:text-green-400 font-medium">Happy Home ❤</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Compact Metrics */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow">
                    <div className="flex items-center space-x-2 mb-2">
                      <PawPrint size={16} />
                      <span className="text-sm font-semibold">Why Adopt?</span>
                    </div>
                    <ul className="text-xs space-y-1 opacity-95">
                      <li>• Second chance for loving companion</li>
                      <li>• Lower cost than breeders</li>
                      <li>• Often vaccinated & vet-checked</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Clock size={12}/> <span>Avg Adoption</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {insights.averageAdoptionDuration ? `${Math.round(insights.averageAdoptionDuration / (1000*60*60*24))}d` : '—'}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Trophy size={12}/> <span>Total Success</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{insights.adoptedCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div id="pets" className="-mt-4 mb-4" />
        
        {/* Browse by Category - Quick Access */}
        {stats?.categoryDistribution?.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Filter size={18} className="mr-2" />
              Browse by Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.categoryDistribution.map(category => (
                <button
                  key={category._id}
                  onClick={() => {
                    handleFilterChange('category', category._id);
                    fetchPets(1);
                  }}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {category._id === 'dog' ? '🐕' : 
                       category._id === 'cat' ? '🐱' : 
                       category._id === 'bird' ? '🐦' : 
                       category._id === 'rabbit' ? '🐰' : '🐾'}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                      {category._id}s
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.count} available
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
  {/* Pet Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading adorable pets..." />
          </div>
        ) : uniqueMainPets.length === 0 ? (
          <Card className="relative overflow-hidden py-14 px-6 text-center bg-gradient-to-b from-gray-50/40 to-white dark:from-gray-800/40 dark:to-gray-800 border border-dashed border-gray-300 dark:border-gray-600">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary-500/5 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-secondary-500/5 blur-3xl" />
            </div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-lg mb-6">
              <PawPrint size={32} className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              You're All Caught Up
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
              Every currently available pet is already highlighted above in the featured sections.
              Try adjusting filters, or check back soon—new rescue friends are added regularly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to Top
              </Button>
              <Button variant="ghost" size="sm" onClick={loadTrending}>
                Refresh Trending
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto text-left">
              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-700/60 backdrop-blur border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Tip</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">Use fewer filters to widen your results.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-700/60 backdrop-blur border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Stay Updated</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">New pets appear throughout the day.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/70 dark:bg-gray-700/60 backdrop-blur border border-gray-200 dark:border-gray-600 sm:col-span-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Action</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">Post a pet to help them find a home.</p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(uniqueMainPets) && uniqueMainPets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  onAdopt={handlePetAdopted}
                />
              ))}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <Button variant="outline" size="sm" disabled={page===1} onClick={()=>handlePageChange(page-1)} icon={<ArrowLeft size={16}/>}>Prev</Button>
                <span className="text-sm text-gray-600 dark:text-gray-300 px-4">Page {page} of {pages}</span>
                <Button variant="outline" size="sm" disabled={page===pages} onClick={()=>handlePageChange(page+1)} icon={<ArrowRight size={16}/>}>Next</Button>
              </div>
            )}
            <div className="mt-16">
              <div className="relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-900/40 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Ready to Change a Life?</h3>
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl text-sm md:text-base leading-relaxed">Create an account to like pets, get personalized recommendations, and track your adoption journey. Each adoption opens space for another rescue.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={()=>document.getElementById('top')?.scrollIntoView({behavior:'smooth'})} variant="secondary" size="lg" icon={<ArrowUpRight size={18}/>}>Back to Top</Button>
                  <Button onClick={()=>window.location.href='/register'} size="lg" icon={<PlusCircle size={18}/>}>Get Started</Button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
          </>
        )}

        {/* FAQ SECTION */}
        <SectionWrapper id="faq" className="pt-16 pb-12 border-t border-gray-200 dark:border-gray-800 mt-16">
          <GradientTitle eyebrow="Clarity" title="Frequently Asked" highlight="Questions" sub="Still curious? These cover the fundamentals. We're expanding education resources soon." />
          <FAQ />
        </SectionWrapper>

        {/* FINAL CTA */}
        <div className="mt-8 mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 p-8 md:p-12 text-white flex flex-col md:flex-row items-start md:items-center gap-8 shadow-xl">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">Build a Compassionate, Data‑Smart Adoption Journey</h3>
              <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">Join FurEverHome to access evolving recommendation intelligence, transparent impact metrics, and a humane adoption workflow that respects time, trust and wellbeing—at scale.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button size="lg" variant="secondary" onClick={()=>window.location.href='/register'} icon={<PlusCircle size={18}/>}>Create Account</Button>
              <Button size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/15" onClick={()=>document.getElementById('pets')?.scrollIntoView({behavior:'smooth'})} icon={<PawPrint size={18}/>}>Browse First</Button>
            </div>
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
