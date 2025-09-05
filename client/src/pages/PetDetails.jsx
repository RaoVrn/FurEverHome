import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, MapPin, Calendar, User, Phone, Mail, 
  ArrowLeft, Share2, Star, Shield, Award 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [mainIndex, setMainIndex] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const userId = user?.id;

  // Fetch pet details (runs on id or user change)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await API.get(`/pets/${id}`);
        const raw = response.data.pet || response.data;
        const petData = { ...raw };
        if (!petData.photos && petData.image) petData.photos = [petData.image];
        if (!petData.photos) {
          petData.photos = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0yNTMuMzM0IDI2Ni42NjYgNzIuMzMzLTU3LjMzMiA1MS4zMzMgNDAuOTk5IDEyMC0xMDUuMzMzIDM1LjMzMyAzMS4zMzNjLTEyLjY2NiA5MC4zMzMtMTAwLjMzMyAxNDQuNjY2LTE3OSAyMDIuMzMzLTc4LjY2Ny01Ny42NjctMTY2LjMzMy0xMTItMTc5LTIwMi4zMzNsMzUuMzMzLTMxLjMzMyA0My42NjggMTIxLjMzNloiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMzAwIiBjeT0iMjAwIiByPSIzOCIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIzMDAiIHk9IjMyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjc3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo='];
        }
        if (!petData.images && petData.photos) petData.images = petData.photos;
        petData.photos = petData.photos.map(p => p?.startsWith('/uploads') ? `http://localhost:5000${p}` : p);
        if (petData.image && petData.image.startsWith('/uploads')) petData.image = `http://localhost:5000${petData.image}`;
        if (isMounted) {
          setPet(petData);
          setIsLiked(petData.isLiked || (userId ? petData.likes?.some(l=> l===userId || l?._id===userId) : false));
        }
      } catch (error) {
        console.error('Error fetching pet details:', error);
        toast.error('Pet not found');
        navigate('/pets');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id, userId, navigate]);

  // Keep mainIndex in range (must be before any early returns to keep hooks order stable)
  useEffect(() => {
    if (pet?.photos && pet.photos.length && mainIndex >= pet.photos.length) {
      setMainIndex(0);
    }
  }, [mainIndex, pet?.photos?.length]);

  const handleAdopt = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to adopt pets');
      return;
    }

    if (pet.postedBy._id === user?.id) {
      toast.error('You cannot adopt your own pet');
      return;
    }

    setAdopting(true);
    try {
      await API.post('/pets/adopt', { petId: pet._id });
      toast.success('Adoption request sent successfully!');
      setPet(prev => ({ ...prev, status: 'adopted', adoptedBy: user }));
      setShowContactModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to adopt pet');
    } finally {
      setAdopting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like pets');
      return;
    }
    // Optimistic update
    const prevLiked = isLiked;
    const prevPet = JSON.parse(JSON.stringify(pet));
    setIsLiked(!prevLiked);
    setPet(prev => {
      const currentLikes = Array.isArray(prev.likes) ? [...prev.likes] : [];
      const already = currentLikes.some(l=> l===userId || l?._id===userId);
      let updatedLikes;
      if (!prevLiked && !already) updatedLikes = [...currentLikes, userId];
      else if (prevLiked && already) updatedLikes = currentLikes.filter(l=> (l===userId || l?._id===userId) ? false : true);
      else updatedLikes = currentLikes;
      return { ...prev, likes: updatedLikes };
    });
    try {
      const response = await API.post(`/pets/${pet._id}/like`);
      const { likes, liked } = response.data;
      setIsLiked(liked);
      setPet(prev => ({ ...prev, likeCount: likes }));
    } catch (error) {
      // revert
      setIsLiked(prevLiked);
      setPet(prevPet);
      console.error('Like error (details):', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update like status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this pet posting?')) {
      try {
        await API.delete(`/pets/${pet._id}`);
        toast.success('Pet deleted successfully');
        navigate('/profile');
      } catch (error) {
        toast.error('Failed to delete pet');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Adopt ${pet.name} - FurEverHome`,
          text: `Check out this adorable ${pet.breed} looking for a home!`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading pet details..." />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pet not found
          </h2>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Derived values (no need for useMemo here; inexpensive)
  const likeCount = Array.isArray(pet?.likes) ? pet.likes.length : (pet?.likeCount || 0);
  const description = pet?.description || 'No description available.';
  const lineBreaks = (description.match(/\n/g) || []).length;
  const isLongDescription = description.length > 320 || lineBreaks > 3;
  const photos = pet?.photos || [];

  // (index range handled in effect above)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={16} />}
          className="mb-6"
        >
          Back
        </Button>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14">
          {/* Pet Images */}
          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200/60 dark:ring-gray-700/60 bg-gray-100 dark:bg-gray-800">
              <img
                src={photos.length ? photos[mainIndex] : (pet.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K')}
                alt={pet.name}
                className="w-full h-96 object-cover transition-all duration-700 ease-in-out"
                onError={(e) => { e.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'; }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-black/0 to-black/0" />
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {pet.status === 'adopted' ? (
                  <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur text-white rounded-full text-sm font-semibold tracking-wide shadow">
                    Adopted
                  </span>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide border shadow-sm ${getUrgencyColor(pet.urgency)}`}>
                    {pet.urgency?.charAt(0).toUpperCase() + pet.urgency?.slice(1)} Priority
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2 items-center">
                <button
                  onClick={handleLike}
                  aria-pressed={isLiked}
                  aria-label={isLiked? 'Unlike pet':'Like pet'}
                  className={`relative group p-2 rounded-full shadow-md transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${isLiked? 'bg-rose-500 text-white scale-105 animate-pulse':'bg-white/90 text-gray-700 hover:bg-rose-500 hover:text-white'}`}
                >
                  <Heart size={18} className={isLiked? 'fill-current drop-shadow':''} />
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full">{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share pet"
                  className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-primary-600 hover:text-white transition shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Additional Images */}
            {photos.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={()=>setMainIndex(idx)}
                    className={`relative group rounded-lg overflow-hidden focus:outline-none ring-offset-2 ring-primary-500 ${mainIndex===idx? 'ring-2':'ring-0'} transition`}
                    aria-label={`Show photo ${idx+1}`}
                  >
                    <img
                      src={img}
                      alt={`${pet.name} ${idx+1}`}
                      className="w-full h-20 object-cover group-hover:opacity-90 transition"
                      onError={(e)=>{ e.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjU2IiBjeT0iNjIiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9Ijk0IiBjeT0iNjIiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik03NSA5NEM4MS42Mjc0IDk0IDg3IDg4LjYyNzQgODcgODJDODcgNzUuMzcyNiA4MS42Mjc0IDcwIDc1IDcwQzY4LjM3MjYgNzAgNjMgNzUuMzcyNiA2MyA4MkM2MyA4OC42Mjc0IDY4LjM3MjYgOTQgNzUgOTRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik00NSAxMjBIMTA1VjEyMEMxMDUgMTI1LjUyMyAxMDAuNTIzIDEzMCA5NSAxMzBINTVDNDkuNDc3MiAxMzAgNDUgMTI1LjUyMyA0NSAxMjBWMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pet Information */}
          <div className="space-y-8">
            {/* Basic Info */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    {pet.name} {getCategoryEmoji(pet.category)}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-1 font-medium">
                    {pet.breed} • {pet.age} years old
                  </p>
                </div>
                {pet.originType === 'stray' ? (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-800/50 inline-block">
                      Free Adoption (Stray)
                    </div>
                    {pet.foundLocation && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Found: {pet.foundLocation}{pet.foundDate ? ` • ${new Date(pet.foundDate).toLocaleDateString()}`:''}</div>
                    )}
                  </div>
                ) : pet.adoptionFee > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                      {pet.currency ? `${pet.currency} ` : '$'}{pet.adoptionFee}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      adoption fee
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/70 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {pet.gender}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gender</div>
                </div>
                {pet.size && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/70 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {pet.size}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Size</div>
                  </div>
                )}
              </div>

              {/* Health Status */}
        <div className="flex gap-2 flex-wrap mb-6">
                {pet.vaccinated && (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-200/60 dark:border-emerald-700/50">
                    <Shield size={14} />
                    Vaccinated
                  </span>
                )}
                {pet.neutered && (
          <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-200/60 dark:border-indigo-700/50">
                    <Award size={14} />
                    Neutered
                  </span>
                )}
              </div>

              {/* Extended Quick Facts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {pet.weight && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Weight</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pet.weight} kg</p>
                  </div>
                )}
                {pet.activityLevel && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Activity Level</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{pet.activityLevel}</p>
                  </div>
                )}
              </div>

              {/* Temperament & Good With */}
              {(pet.temperament?.length || pet.goodWith?.length) && (
                <div className="mb-6">
                  {pet.temperament?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Temperament</h3>
                      <div className="flex flex-wrap gap-2">
                        {pet.temperament.map(t => <span key={t} className="px-2 py-1 rounded-full text-xs bg-primary-100/70 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/40">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {pet.goodWith?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Good With</h3>
                      <div className="flex flex-wrap gap-2">
                        {pet.goodWith.map(g => <span key={g} className="px-2 py-1 rounded-full text-xs bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">{g}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dietary & Special Needs */}
              {(pet.dietaryNeeds || pet.specialNeeds) && (
                <div className="mb-6">
                  {pet.dietaryNeeds && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Dietary Needs</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{pet.dietaryNeeds}</p>
                    </div>
                  )}
                  {pet.specialNeeds && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Special Care</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{pet.specialNeeds}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  About {pet.name}
                </h3>
                <p 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line relative mt-1"
                  style={(!showFullDesc && isLongDescription) ? {display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical', overflow:'hidden'} : {}}
                >
                  {description}
                </p>
                {isLongDescription && (
                  <button 
                    onClick={()=>setShowFullDesc(s=>!s)} 
                    className="mt-2 text-sm font-medium text-primary-600 hover:underline"
                  >
                    {showFullDesc? 'Show less':'Read more'}
                  </button>
                )}
              </div>

              {/* Medical History */}
              {pet.medicalHistory && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Medical History
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {pet.medicalHistory}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-5 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 flex items-center justify-center gap-1">
                    {pet.likes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 flex items-center justify-center gap-1">
                    {pet.views || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Posted by
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {pet.postedBy?.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Posted {new Date(pet.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {pet.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span>{pet.location}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Available since {new Date(pet.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              {pet.status === 'available' ? (
                <div className="space-y-4">
                  {/* Owner Controls */}
                  {pet.postedBy._id === user?.id ? (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => navigate(`/edit-pet/${pet._id}`)}
                        variant="secondary"
                        className="flex-1"
                        size="lg"
                      >
                        Edit Pet
                      </Button>
                      <Button
                        onClick={handleDelete}
                        variant="danger"
                        className="flex-1"
                        size="lg"
                      >
                        Delete Pet
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAdopt}
                      loading={adopting}
                      disabled={!isAuthenticated}
                      className="w-full font-semibold tracking-wide text-base"
                      size="lg"
                    >
                      {adopting ? 'Processing...' : 'Adopt Me'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-lg font-medium text-green-600">
                    This pet has been adopted! 🎉
                  </span>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Please <button 
                    onClick={() => navigate('/login')} 
                    className="text-primary-600 hover:underline"
                  >
                    login
                  </button> to adopt pets
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Information"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Great! You've shown interest in adopting {pet.name}. Here's how to contact the owner:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">
                {pet.contactEmail || pet.postedBy?.email}
              </span>
            </div>
            
            {(pet.contactPhone || pet.postedBy?.phone) && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {pet.contactPhone || pet.postedBy?.phone}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Please mention that you found {pet.name} on FurEverHome when you contact the owner.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PetDetails;
