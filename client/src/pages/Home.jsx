import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import PetCard from '../components/PetCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Card from '../components/ui/Card';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const fetchPets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      });

      const response = await API.get(`/pets?${params.toString()}`);
      
      // Handle the new API response format
      const petsData = response.data.pets || response.data;
      setPets(petsData);
      setFilteredPets(petsData);
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
    fetchPets();
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
    fetchPets();
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
    fetchPets();
  };

  const handlePetAdopted = (petId) => {
    setPets(prev => prev.filter(pet => pet._id !== petId));
    setFilteredPets(prev => prev.filter(pet => pet._id !== petId));
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value.trim() !== '').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Find Your Perfect Companion
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 animate-slide-up">
              Give a loving home to pets in need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <Input
                placeholder="Search by name, breed, or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon={<Search size={20} />}
                className="text-gray-900 text-lg py-3"
                containerClassName="animate-bounce-in"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
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

        {/* Pet Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading adorable pets..." />
          </div>
        ) : filteredPets.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No pets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(filteredPets) && filteredPets.map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                onAdopt={handlePetAdopted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
