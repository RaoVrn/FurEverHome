import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    breed: '',
    minAge: '',
    maxAge: '',
    status: '',
    originType: ''
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
        <select name="originType" value={filters.originType} onChange={handleFilterChange}>
          <option value="">Any Origin</option>
          <option value="owned">Owned</option>
          <option value="stray">Stray</option>
        </select>
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <ul>
        {pets.map((pet) => (
          <li key={pet._id} style={{marginBottom:'1rem',border:'1px solid #ccc',padding:'0.75rem',borderRadius:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0}}>{pet.name} {pet.breed && `(${pet.breed})`}</h3>
              <span style={{fontSize:12,padding:'2px 8px',borderRadius:12,background: pet.originType==='stray' ? '#D1FAE5':'#DBEAFE',color:'#111'}}>
                {pet.originType==='stray' ? 'Stray / Rescued' : 'Owned'}
              </span>
            </div>
            <p style={{margin:'4px 0'}}>Age: {pet.age}</p>
            <p style={{margin:'4px 0'}}>{pet.description}</p>
            <p style={{margin:'4px 0'}}>Status: {pet.status}</p>
            <p style={{margin:'4px 0',fontWeight:600}}>
              {pet.originType==='stray' ? 'Free Adoption' : (pet.adoptionFee>0 ? `${pet.currency || 'USD'} ${pet.adoptionFee}` : 'No Fee')}
            </p>
            {pet.originType==='stray' && pet.foundLocation && (
              <p style={{margin:'4px 0',fontSize:12,color:'#555'}}>Found: {pet.foundLocation}{pet.foundDate ? ` • ${new Date(pet.foundDate).toLocaleDateString()}`:''}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pets;
