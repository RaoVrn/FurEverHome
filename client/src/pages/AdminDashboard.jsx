import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await API.get('/admin/users');
        const petsRes = await API.get('/admin/pets');
        setUsers(usersRes.data);
        setPets(petsRes.data);
      } catch (error) {
        alert('Error fetching admin data');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Users</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Logins</th><th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.loginCount}</td>
              <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Pets</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th><th>Breed</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pets.map(pet => (
            <tr key={pet._id}>
              <td>{pet.name}</td>
              <td>{pet.breed}</td>
              <td>{pet.adopted ? 'Adopted' : 'Available'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
