const Pet = require('../models/Pet');
const User = require('../models/User');

// Sample pets data
const samplePets = [
  {
    name: 'Buddy',
    age: 3,
    breed: 'Golden Retriever',
    category: 'dog',
    gender: 'male',
    size: 'large',
    color: 'Golden',
    description: 'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He\'s great with kids and other dogs.',
    vaccinated: true,
    neutered: true,
    location: 'New York, NY',
    adoptionFee: 200,
    urgency: 'medium',
    photos: [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZEQjQyIi8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM5MjQwMEQiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzkyNDAwRCIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzkyNDAwRCIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzkyNDAwRCIvPgo8L3N2Zz4K'
    ],
    temperament: ['Friendly', 'Energetic', 'Loyal'],
    goodWith: { children: true, dogs: true, cats: false },
  activityLevel: 'high',
  currency: 'USD',
  originType: 'owned'
  },
  {
    name: 'Whiskers',
    age: 2,
    breed: 'Persian',
    category: 'cat',
    gender: 'female',
    size: 'medium',
    color: 'White',
    description: 'Whiskers is a beautiful Persian cat with a calm and gentle personality. She loves to cuddle and would make a perfect lap cat.',
    vaccinated: true,
    neutered: true,
    location: 'Los Angeles, CA',
    adoptionFee: 150,
    urgency: 'low',
    photos: [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjlGQUZCIi8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM2Mzc2OTEiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzYzNzY5MSIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzYzNzY5MSIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzYzNzY5MSIvPgo8L3N2Zz4K'
    ],
    temperament: ['Calm', 'Gentle', 'Affectionate'],
    goodWith: { children: true, dogs: false, cats: true },
  activityLevel: 'low',
  currency: 'USD',
  originType: 'owned'
  },
  {
    name: 'Max',
    age: 5,
    breed: 'German Shepherd',
    category: 'dog',
    gender: 'male',
    size: 'large',
    color: 'Brown and Black',
    description: 'Max is a loyal and protective German Shepherd. He\'s well-trained and would be perfect for a family looking for a guard dog companion.',
    vaccinated: true,
    neutered: true,
    location: 'Chicago, IL',
    adoptionFee: 300,
    urgency: 'high',
    photos: [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjOTIyNTBEIi8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiNGRkZGRkYiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
    ],
    temperament: ['Loyal', 'Protective', 'Intelligent'],
    goodWith: { children: true, dogs: true, cats: false },
    activityLevel: 'high',
    currency: 'USD',
    originType: 'owned'
  },
  {
    name: 'Shadow',
    age: 2,
    breed: 'Mixed',
    category: 'dog',
    gender: 'female',
    size: 'medium',
    color: 'Black',
    description: 'Rescued from the streets, gentle and a bit shy but warming up quickly.',
    vaccinated: false,
    neutered: false,
    location: 'Austin, TX',
    adoptionFee: 0,
    urgency: 'medium',
    photos: [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTMxMzEzIi8+CjxjaXJjbGUgY3g9IjIyNSIgY3k9IjE2NSIgcj0iMjUiIGZpbGw9IiM0NDQ0NDQiLz4KPGNpcmNsZSBjeD0iMzc1IiBjeT0iMTY1IiByPSIyNSIgZmlsbD0iIzQ0NDQ0NCIvPgo8cGF0aCBkPSJNMzAwIDI2MEM3MjcuNjEyIDI2MCA0NSAyNDIuNTkxIDQ1IDIyMEM0NSAxOTcuNDA5IDEzNC40MDggMTgwIDMwMCAxODBDNDY1LjU5MiAxODAgNTU1IDE5Ny40MDkgNTU1IDIyMEM1NTUgMjQyLjU5MSA0NjUuNTkyIDI2MCAzMDAgMjYwWiIgZmlsbD0iIzQ0NDQ0NCIvPgo8cGF0aCBkPSJNMTgwIDMyMEg0MjBWMzIwQzQyMCAzMzEuMDQ2IDQxMS4wNDYgMzQwIDQwMCAzNDBIMjAwQzE4OC45NTQgMzQwIDE4MCAzMzEuMDQ2IDE4MCAzMjBWMzIwWiIgZmlsbD0iIzQ0NDQ0NCIvPgo8L3N2Zz4K'
    ],
    temperament: ['Shy','Gentle'],
    goodWith: { children: true, dogs: true, cats: true },
    activityLevel: 'low',
    currency: 'USD',
    originType: 'stray',
    foundLocation: 'Downtown Austin',
    foundDate: new Date()
  }
];

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    
    // Find the first user or create a demo user
    let demoUser = await User.findOne({ email: 'demo@fureverhome.com' });
    
    if (!demoUser) {
      demoUser = new User({
        name: 'Demo User',
        email: 'demo@fureverhome.com',
        password: 'hashedpassword', // In reality, this should be properly hashed
        phone: '555-0123',
        location: 'Demo City',
        role: 'user'
      });
      await demoUser.save();
      console.log('Demo user created');
    }
    
    // Clear existing pets
    await Pet.deleteMany({});
    console.log('Existing pets cleared');
    
    // Add sample pets
    const pets = samplePets.map(petData => ({
      ...petData,
      postedBy: demoUser._id,
      image: petData.photos[0] // Set first photo as main image for backward compatibility
    }));
    
    await Pet.insertMany(pets);
    console.log(`${pets.length} sample pets added`);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
