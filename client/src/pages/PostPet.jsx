import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Plus, Heart, Camera, Info, ArrowLeft, ArrowRight, Recycle, PawPrint, Sparkles, Flame } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PostPet = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]); // stored backend paths
  const [dragActive, setDragActive] = useState(false);
  const [descChars, setDescChars] = useState(0);
  const MAX_DESC = 600;
  const MAX_PHOTOS = 5;
  const temperamentOptions = ['friendly','energetic','calm','playful','independent','affectionate'];
  const activityLevels = ['low','medium','high'];
  const [selectedTemperament, setSelectedTemperament] = useState([]);
  const [goodWith, setGoodWith] = useState({ children:false, dogs:false, cats:false });
  const [activityLevel, setActivityLevel] = useState('medium');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      urgency: 'medium',
      vaccinated: false,
      neutered: false,
      adoptionFee: 0
    }
  });

  const categories = [
    { value: 'dog', label: 'Dog 🐕', emoji: '🐕' },
    { value: 'cat', label: 'Cat 🐱', emoji: '🐱' },
    { value: 'bird', label: 'Bird 🐦', emoji: '🐦' },
    { value: 'rabbit', label: 'Rabbit 🐰', emoji: '🐰' },
    { value: 'other', label: 'Other 🐾', emoji: '🐾' }
  ];

  const genders = ['male', 'female'];
  const sizes = ['small', 'medium', 'large'];
  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  // Simple client-side compression (downscale large images) before upload
  const compressImage = (file) => new Promise(resolve => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 1600;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressed = new File([blob], file.name.replace(/\.(.+)$/,'-compressed.$1'), { type: file.type });
            resolve(compressed);
          } else {
            resolve(file);
          }
        }, file.type, 0.85);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    } catch { resolve(file); }
  });

  const handleImageUpload = async (files) => {
    if (!files || !files.length) return;
    const current = images.length;
    const incoming = Array.from(files).slice(0, MAX_PHOTOS - current); // enforce limit
    if (incoming.length === 0) { toast.error(`Max ${MAX_PHOTOS} photos`); return; }
    setUploadingImages(true);
    try {
      // Compress sequentially to avoid memory spikes
      const processed = [];
      for (const f of incoming) {
        // Skip huge unsupported types
        const comp = await compressImage(f);
        processed.push(comp);
      }
      const formData = new FormData();
      if (processed.length === 1) {
        formData.append('image', processed[0]);
        const response = await API.post('/upload/image', formData, { headers:{ 'Content-Type':'multipart/form-data' } });
        setImages(prev => [...prev, response.data.imageUrl]);
      } else {
        processed.forEach(file => formData.append('images', file));
        const response = await API.post('/upload/images', formData, { headers:{ 'Content-Type':'multipart/form-data' } });
        setImages(prev => [...prev, ...(response.data.imageUrls||[])]);
      }
      toast.success('Photos added');
    } catch (e) {
      toast.error('Upload failed');
    } finally { setUploadingImages(false); }
  };

  const removeImage = (index) => { setImages(prev => prev.filter((_, i) => i !== index)); };
  const moveImage = (index, dir) => {
    setImages(prev => {
      const copy = [...prev];
      const target = index + dir;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const toggleTemperament = (t) => {
    setSelectedTemperament(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  };
  const toggleGoodWith = (k) => { setGoodWith(p=>({...p,[k]:!p[k]})); };

  const onSubmit = async (data) => {
    // Normalize & trim string fields
    ['name','breed','category','gender','size','location','description','color'].forEach(f => {
      if (data[f] && typeof data[f] === 'string') data[f] = data[f].trim();
    });

  if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    // Frontend mirror of backend required fields
    const requiredFields = ['name','age','breed','category','gender','size','location','description'];
    const missing = requiredFields.filter(f => !data[f]);
    if (missing.length) {
      toast.error(`Please fill required: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const petData = {
        ...data,
        age: Number(data.age),
        adoptionFee: Number(data.adoptionFee) || 0,
        image: images[0],
        images,
        photos: images,
        temperament: selectedTemperament,
        goodWith,
        activityLevel,
        dietaryNeeds: data.dietaryNeeds || '',
        specialNeeds: data.specialNeeds || '',
        weight: data.weight ? Number(data.weight) : undefined,
        healthDetails: data.medicalHistory || data.healthDetails
      };

      const res = await API.post('/pets', petData);
      toast.success('Pet posted successfully!');
      navigate(`/pets/${res.data?.pet?._id || ''}` || '/');
    } catch (error) {
      const msg = error.response?.data?.message;
      const fields = error.response?.data?.fields;
      if (fields?.length) {
        toast.error(`${msg || 'Missing required fields'}: ${fields.join(', ')}`);
      } else {
        toast.error(msg || 'Failed to post pet');
      }
      console.error('Post pet error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
          <div className="text-center max-w-3xl mx-auto">
            <Heart className="mx-auto h-14 w-14 text-white mb-6 drop-shadow" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Find a Home for Your Pet</h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed">Create a compelling listing so the right family can discover and adopt your companion quickly and safely.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-white/70">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center gap-1"><PawPrint size={12}/> Ethical Rehoming</span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center gap-1"><Sparkles size={12}/> Smarter Matching</span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center gap-1"><Flame size={12}/> Highlight Urgency</span>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-10 relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Photos */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent flex items-center gap-2"><Camera size={18}/> <span>Pet Photos</span></h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{images.length}/{MAX_PHOTOS} uploaded</p>
            </div>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'} ${images.length? 'mb-8':''}`}
              onDragOver={(e)=>{e.preventDefault(); setDragActive(true);}}
              onDragLeave={(e)=>{e.preventDefault(); setDragActive(false);}}
              onDrop={(e)=>{e.preventDefault(); setDragActive(false); handleImageUpload(e.dataTransfer.files);}}
            >
              <input id="image-upload" type="file" multiple accept="image/*" onChange={(e)=>handleImageUpload(e.target.files)} className="hidden" disabled={uploadingImages || images.length>=MAX_PHOTOS} />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white mb-4 shadow-inner">
                  {uploadingImages ? <Upload className="animate-pulse" size={28}/> : <Camera size={28}/>}  
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">{uploadingImages ? 'Uploading...' : images.length ? 'Add More Photos' : 'Drag & Drop or Click to Upload'}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">PNG/JPG ≤5MB • Up to {MAX_PHOTOS} photos • First = cover</span>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {images.map((image, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-100 dark:bg-gray-800">
                    <img src={`http://localhost:5000${image}`} alt={index===0? 'Cover photo':'Pet '+(index+1)} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    {index===0 && <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] px-2 py-1 rounded-full shadow">COVER</span>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex flex-col justify-between p-2"> 
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button type="button" onClick={()=>removeImage(index)} className="p-1 rounded-full bg-red-500/90 text-white hover:bg-red-600 shadow"><X size={14}/></button>
                      </div>
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button type="button" onClick={()=>moveImage(index,-1)} disabled={index===0} className="p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"><ArrowLeft size={14}/></button>
                        <button type="button" onClick={()=>moveImage(index,1)} disabled={index===images.length-1} className="p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"><ArrowRight size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Basic Information */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><PawPrint size={18}/> Basic Information</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">* Required fields</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Pet Name *"
                placeholder="e.g., Buddy, Whiskers"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Pet name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <Input
                label="Breed *"
                placeholder="e.g., Labrador Retriever, Persian"
                error={errors.breed?.message}
                {...register('breed', { required: 'Breed is required' })}
              />

              <Input
                label="Age (years) *"
                type="number"
                placeholder="e.g., 2"
                error={errors.age?.message}
                {...register('age', {
                  required: 'Age is required',
                  min: { value: 0, message: 'Age must be positive' },
                  max: { value: 30, message: 'Please enter a valid age' }
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="">Select gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  {...register('size')}
                >
                  <option value="">Select size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Color" placeholder="e.g., Brown, Black & White" {...register('color')} />

              <Input label="Weight (kg)" type="number" step="0.1" placeholder="e.g., 12.5" {...register('weight')} />
            </div>
          </Card>

          {/* Description & Health */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Info size={18}/> Description & Health</h2>
            <div className="space-y-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                  maxLength={MAX_DESC}
                  {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Please write at least 10 characters' }, maxLength: { value: MAX_DESC, message: 'Too long' } })}
                  onChange={(e)=>{ setDescChars(e.target.value.length); }}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">{descChars}/{MAX_DESC}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Medical History
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Any medical conditions, treatments, or important health information..."
                  {...register('medicalHistory')}
                />
              </div>

              {/* Temperament */}
              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Temperament Tags</p>
                <div className="flex flex-wrap gap-2">
                  {temperamentOptions.map(t => {
                    const active = selectedTemperament.includes(t);
                    return (
                      <button key={t} type="button" onClick={()=>toggleTemperament(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${active ? 'bg-primary-600 text-white border-primary-600 shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:text-primary-600'}`}>{t}</button>
                    );
                  })}
                </div>
                {selectedTemperament.length>0 && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{selectedTemperament.length} selected</p>}
              </div>

              {/* Good With / Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Good With</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(goodWith).map(k => (
                      <button key={k} type="button" onClick={()=>toggleGoodWith(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${goodWith[k] ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-emerald-400'}`}>{k}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Level</label>
                  <select value={activityLevel} onChange={(e)=>setActivityLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {activityLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Dietary & Special Needs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dietary Needs</label>
                  <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Grain-free kibble, chicken sensitive" {...register('dietaryNeeds')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Needs</label>
                  <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Behavioral considerations, mobility support, etc." {...register('specialNeeds')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vaccinated"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('vaccinated')}
                  />
                  <label htmlFor="vaccinated" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Vaccinated
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="neutered"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('neutered')}
                  />
                  <label htmlFor="neutered" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Spayed/Neutered
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact & Additional Info */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Upload size={18}/> Contact & Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location *"
                placeholder="City, State"
                error={errors.location?.message}
                {...register('location', { required: 'Location is required', minLength: { value: 2, message: 'Enter a valid location' } })}
              />

              <Input
                label="Contact Phone"
                type="tel"
                placeholder="Your phone number"
                {...register('contactPhone')}
              />

              <Input
                label="Contact Email"
                type="email"
                placeholder="Your email (if different from account)"
                {...register('contactEmail')}
              />

              <Input
                label="Adoption Fee ($)"
                type="number"
                placeholder="0"
                {...register('adoptionFee')}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('urgency')}>
                  {urgencyLevels.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">High priority listings surface higher in search and recommendation modules.</p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"><Info size={14}/> <span>By posting you confirm you have rights to rehome this pet and information provided is accurate.</span></div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
              <Button type="submit" loading={loading} disabled={loading || images.length === 0} className="min-w-[140px]">{loading ? 'Posting...' : 'Publish Listing'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostPet;
