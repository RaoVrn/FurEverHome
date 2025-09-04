import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Plus, Heart, Camera } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PostPet = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);
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

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      
      if (files.length === 1) {
        formData.append('image', files[0]);
        const response = await API.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImages(prev => [...prev, response.data.imageUrl]);
      } else {
        Array.from(files).forEach(file => {
          formData.append('images', file);
        });
        const response = await API.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImages(prev => [...prev, ...response.data.imageUrls]);
      }
      
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    // Normalize & trim string fields
    ['name','breed','category','gender','size','location','description','color'].forEach(f => {
      if (data[f] && typeof data[f] === 'string') data[f] = data[f].trim();
    });

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

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
        images,          // keep for backward compatibility
        photos: images    // explicit field used by backend
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Heart className="mx-auto h-12 w-12 text-primary-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Find a Home for Your Pet
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Help your furry friend find their perfect family
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Upload Section */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pet Photos
            </h2>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Camera className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {uploadingImages ? 'Uploading...' : 'Upload Photos'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    PNG, JPG up to 5MB each (max 5 photos)
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`Pet ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            
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

              <Input
                label="Color"
                placeholder="e.g., Brown, Black & White"
                {...register('color')}
              />
            </div>
          </Card>

          {/* Description & Health */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Description & Health
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                  {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Please write at least 10 characters' } })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
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
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Additional Information
            </h2>
            
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Urgency Level
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  {...register('urgency')}
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  High priority listings are shown first to potential adopters
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || images.length === 0}
              className="min-w-[120px]"
            >
              {loading ? 'Posting...' : 'Post Pet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostPet;
