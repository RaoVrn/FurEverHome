import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    breed: '',
    minAge: '',
    maxAge: '',
    status: ''
  });

  const fetchPets = async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await API.get(`/pets?${params.toString()}`);
      setPets(res.data);
    } catch (error) {
      console.error('Error fetching pets');
    }
  };

  useEffect(() => {
    fetchPets();
  }, [fetchPets]); // Added fetchPets to the dependency array

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => fetchPets();

  return (
    <div>
      <h1>Available Pets</h1>

      <div>
        <input
          placeholder="Breed"
          name="breed"
          value={filters.breed}
          onChange={handleFilterChange}
        />
        <input
          placeholder="Min Age"
          name="minAge"
          type="number"
          value={filters.minAge}
          onChange={handleFilterChange}
        />
        <input
          placeholder="Max Age"
          name="maxAge"
          type="number"
          value={filters.maxAge}
          onChange={handleFilterChange}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="adopted">Adopted</option>
        </select>
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <ul>
        {pets.map((pet) => (
          <li key={pet._id}>
            <h3>{pet.name} ({pet.breed})</h3>
            <p>Age: {pet.age}</p>
            <p>{pet.description}</p>
            <p>Status: {pet.adopted ? 'Adopted' : 'Available'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pets;
