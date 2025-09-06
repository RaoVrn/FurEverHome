import React, { useEffect, useState } from 'react';
import { Heart, Users, Shield, Target, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const About = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const res = await fetch(base + '/pets/platform/stats');
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const teamMembers = [
    {
      name: 'Varun Prakash',
      role: 'Founder & Full-Stack Developer',
      bio: 'Computer Science student passionate about creating technology solutions that make a positive impact on animal welfare and connecting pets with loving families.',
      image: '/api/placeholder/150/150'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_50%,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <Link to="/help">
              <Button variant="ghost" className="text-white hover:bg-white/10" icon={<ArrowLeft size={16} />}>
                Back to Help
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6">
              About FurEverHome
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to connect loving families with pets in need, creating lasting bonds 
              that transform lives - both human and animal.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Every pet deserves a loving home, and every family deserves the joy that comes with pet companionship. 
            FurEverHome bridges this gap by providing a safe, reliable platform where pet owners, shelters, 
            and families can connect to ensure pets find their perfect match.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {loading && [1,2,3,4].map(i => (
            <Card key={i} className="p-6 text-center animate-pulse">
              <div className="h-6 w-6 mx-auto mb-6 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-16 mx-auto mb-2 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
            </Card>
          ))}
          {!loading && !error && stats && (
            <>
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4"><div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"><Heart className="h-6 w-6 text-red-500"/></div></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.pets}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pets Listed</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4"><div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"><Users className="h-6 w-6 text-blue-500"/></div></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.users}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4"><div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"><Shield className="h-6 w-6 text-green-500"/></div></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.adoptions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful Adoptions</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4"><div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"><Award className="h-6 w-6 text-purple-500"/></div></div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.launchYear}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Platform Launch</div>
              </Card>
            </>
          )}
          {!loading && error && (
            <Card className="p-6 text-center col-span-4">
              <p className="text-red-600 dark:text-red-400 text-sm">Failed to load live stats. {error}</p>
            </Card>
          )}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 mr-3">
                  <Heart className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Compassion</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in treating every animal with kindness and respect, ensuring their welfare is always our top priority.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trust</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We maintain the highest standards of safety and transparency to build trust within our community.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Impact</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Every successful adoption creates a ripple effect of positive change in communities nationwide.
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 border-primary-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
          <div className="prose max-w-none text-gray-600 dark:text-gray-400">
            <p className="text-lg leading-relaxed mb-4">
              FurEverHome was born from a simple observation: too many wonderful pets were waiting in shelters 
              while loving families were struggling to find their perfect companion. Founded in 2025, we set out 
              to create a platform that would make pet adoption more accessible, transparent, and successful.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              What started as a local initiative has grown into a nationwide network, connecting thousands of 
              pets with their forever families. Our platform leverages technology to make better matches, 
              ensuring that both pets and families find exactly what they're looking for.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we're proud to work with shelters, rescue organizations, and individual pet owners across 
              the country, all united by the belief that every pet deserves a loving home. Join us in our 
              mission to create more happy endings, one adoption at a time.
            </p>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you're looking to adopt, rehome a pet, or support our mission, there are many ways to get involved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/dashboard" size="lg" icon={<Heart size={18} />}>
              Browse Pets
            </Button>
            <Button to="/post-pet" variant="outline" size="lg" icon={<Users size={18} />}>
              Post a Pet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
