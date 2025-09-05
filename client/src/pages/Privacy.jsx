import React from 'react';
import { Shield, Lock, Eye, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Privacy = () => {
  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: Eye,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you register for an account, we collect basic information such as your name, email address, phone number, and location. This information is necessary to create your profile and facilitate pet adoptions.'
        },
        {
          subtitle: 'Pet Information',
          text: 'When posting a pet for adoption, you provide details about the pet including photos, breed, age, health status, and behavioral characteristics. This information helps potential adopters make informed decisions.'
        },
        {
          subtitle: 'Usage Information',
          text: 'We automatically collect information about how you use our platform, including pages visited, features used, and interactions with other users. This helps us improve our services.'
        }
      ]
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      icon: Users,
      content: [
        {
          subtitle: 'Facilitating Adoptions',
          text: 'We use your information to connect pets with suitable families, process adoption applications, and facilitate communication between pet owners and potential adopters.'
        },
        {
          subtitle: 'Platform Improvement',
          text: 'Usage data helps us understand user behavior, identify popular features, and continuously improve the FurEverHome experience for all users.'
        },
        {
          subtitle: 'Communication',
          text: 'We may send you notifications about your account, adoption updates, platform news, and important policy changes. You can control these communications in your account settings.'
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Shield,
      content: [
        {
          subtitle: 'With Other Users',
          text: 'Profile information and pet listings are visible to other platform users to facilitate adoptions. You control what information is displayed in your public profile.'
        },
        {
          subtitle: 'With Service Providers',
          text: 'We work with trusted third-party services for hosting, analytics, and customer support. These providers only access information necessary to perform their services.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law, court order, or to protect the safety of our users, pets, or the public.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data transmission between your device and our servers is encrypted using industry-standard SSL/TLS protocols.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict access controls to ensure only authorized personnel can access user data, and only when necessary for platform operations.'
        },
        {
          subtitle: 'Regular Audits',
          text: 'Our security practices are regularly reviewed and updated to address emerging threats and maintain the highest standards of data protection.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Your privacy and the security of your personal information are fundamental to our mission.
            </p>
            <p className="text-white/80 mt-4">
              Last updated: September 5, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introduction</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            At FurEverHome, we are committed to protecting your privacy and handling your personal information 
            with care and respect. This Privacy Policy explains how we collect, use, share, and protect your 
            information when you use our pet adoption platform.
          </p>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 mr-4">
                  <section.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              
              <div className="space-y-6">
                {section.content.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.subtitle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Your Rights */}
        <Card className="p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Rights</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access & Correction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can access and update your personal information through your account settings at any time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Portability</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can request a copy of your personal data in a machine-readable format.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Deletion</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can delete your account at any time through your profile settings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Communication Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can control what communications you receive from us in your account settings.
              </p>
            </div>
          </div>
        </Card>

        {/* Cookies */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies and Tracking</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We use cookies and similar technologies to enhance your experience, remember your preferences, 
            and analyze platform usage. You can control cookie settings through your browser preferences.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Note:</strong> Disabling certain cookies may limit some platform functionality, 
              but core features will remain accessible.
            </p>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
          <p className="text-gray-600 dark:text-gray-400">
            FurEverHome is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If we become aware that we have collected 
            personal information from a child under 13, we will take steps to delete such information.
          </p>
        </Card>

        {/* Contact */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About Privacy?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have questions about this Privacy Policy or how we handle your personal information, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button to="/help" icon={<Shield size={16} />}>
              Contact Support
            </Button>
            <Button to="/profile" variant="outline" icon={<Users size={16} />}>
              Account Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
