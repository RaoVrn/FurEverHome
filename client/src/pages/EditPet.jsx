import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    category: 'dog',
    gender: 'male',
    size: 'medium',
    color: '',
    description: '',
    medicalHistory: '',
    vaccinated: false,
    neutered: false,
    location: '',
    contactPhone: '',
    contactEmail: '',
    image: '',
  adoptionFee: '',
  currency: 'USD',
  originType: 'owned',
  foundLocation: '',
  foundDate: '' ,
    urgency: 'medium'
  });

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const response = await API.get(`/pets/${id}`);
      const pet = response.data;
      
      // Check if user owns this pet
      if (pet.postedBy._id !== user?.id) {
        toast.error('You are not authorized to edit this pet');
        navigate('/');
        return;
      }

      setFormData({
        name: pet.name || '',
        age: pet.age || '',
        breed: pet.breed || '',
        category: pet.category || 'dog',
        gender: pet.gender || 'male',
        size: pet.size || 'medium',
        color: pet.color || '',
        description: pet.description || '',
        medicalHistory: pet.medicalHistory || '',
        vaccinated: pet.vaccinated || false,
        neutered: pet.neutered || false,
        location: pet.location || '',
        contactPhone: pet.contactPhone || '',
        contactEmail: pet.contactEmail || '',
        image: pet.image || '',
        adoptionFee: pet.adoptionFee || '',
        currency: pet.currency || 'USD',
        originType: pet.originType || 'owned',
        foundLocation: pet.foundLocation || '',
        foundDate: pet.foundDate ? pet.foundDate.substring(0,10) : '',
        urgency: pet.urgency || 'medium'
      });
    } catch (error) {
      toast.error('Failed to fetch pet details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'originType' && value === 'stray') {
        next.adoptionFee = 0;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.breed) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.originType === 'stray') {
        payload.adoptionFee = 0;
      }
      await API.put(`/pets/${id}`, payload);
      toast.success('Pet updated successfully!');
      navigate(`/pets/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pet');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading pet details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
            className="mb-4"
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Pet Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your pet's information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pet Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Age (years) *"
                name="age"
                type="number"
                min="0"
                max="30"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Breed *"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <Input
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Description & Medical Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about this pet's personality, habits, and what makes them special..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Any medical conditions, treatments, or special care needed..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={formData.vaccinated}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Vaccinated
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="neutered"
                    checked={formData.neutered}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Spayed/Neutered
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact & Adoption Info */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Adoption Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleInputChange}
              />
              <Input
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pet Origin</label>
                <select
                  name="originType"
                  value={formData.originType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="owned">Owned / Rehoming</option>
                  <option value="stray">Stray / Rescued</option>
                </select>
              </div>
              <div className="grid grid-cols-5 gap-2 md:col-span-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    disabled={formData.originType==='stray'}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${formData.originType==='stray' ? 'opacity-60 cursor-not-allowed':''}`}
                  >
                    {['USD','EUR','GBP','INR','AUD','CAD','JPY'].map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <Input
                    label={`Adoption Fee ${formData.originType==='stray' ? '(Free for Stray)' : `(${formData.currency})`}`}
                    name="adoptionFee"
                    type="number"
                    min="0"
                    value={formData.adoptionFee}
                    onChange={handleInputChange}
                    disabled={formData.originType==='stray'}
                  />
                </div>
              </div>
              {formData.originType==='stray' && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Found Location"
                    name="foundLocation"
                    value={formData.foundLocation}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Found Date</label>
                    <input
                      type="date"
                      name="foundDate"
                      value={formData.foundDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Image */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pet Image
            </h2>
            <Input
              label="Image URL"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/pet-image.jpg"
            />
            {formData.image && (
              <div className="mt-4">
                <img
                  src={formData.image}
                  alt="Pet preview"
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Pet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPet;
