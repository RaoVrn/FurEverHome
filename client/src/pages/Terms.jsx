import React from 'react';
import { FileText, Scale, AlertTriangle, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Terms = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: Scale,
      content: 'By accessing and using FurEverHome, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      id: 'user-accounts',
      title: 'User Accounts',
      icon: Users,
      content: [
        'You must provide accurate and complete information when creating an account.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You must notify us immediately of any unauthorized use of your account.',
        'One person may not maintain multiple accounts.',
        'You must be at least 18 years old to create an account.'
      ]
    },
    {
      id: 'pet-listings',
      title: 'Pet Listings and Adoptions',
      icon: FileText,
      content: [
        'All pet information must be accurate, complete, and truthful.',
        'You must have legal authority to rehome any pet you list.',
        'Pet health information must be disclosed honestly and completely.',
        'You agree to respond promptly to adoption inquiries.',
        'FurEverHome does not guarantee successful adoptions.',
        'All adoption agreements are between the pet owner and adopter.'
      ]
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      icon: AlertTriangle,
      content: [
        'Posting false, misleading, or fraudulent information.',
        'Using the platform for commercial breeding or pet sales.',
        'Harassment, bullying, or inappropriate communication with other users.',
        'Attempting to circumvent platform safety measures.',
        'Posting content that violates local, state, or federal laws.',
        'Creating multiple accounts or impersonating others.'
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
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Please read these terms carefully before using our platform. They govern your use of FurEverHome.
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to FurEverHome</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These Terms of Service ("Terms") govern your use of the FurEverHome platform, including our website, 
            mobile applications, and related services. By using our platform, you agree to these Terms and our 
            Privacy Policy. Please read them carefully.
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
              
              {Array.isArray(section.content) ? (
                <ul className="space-y-3">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {section.content}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Platform Rules */}
        <Card className="p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Rules</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Content Guidelines</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Keep all content family-friendly</li>
                <li>• Use high-quality, recent photos</li>
                <li>• Provide detailed, accurate descriptions</li>
                <li>• Respect other users' privacy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Communication Rules</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Be respectful and courteous</li>
                <li>• Respond to inquiries promptly</li>
                <li>• Keep conversations on-platform initially</li>
                <li>• Report suspicious behavior</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Liability and Disclaimers */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liability and Disclaimers</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Important:</strong> FurEverHome is a platform that connects pet owners with potential adopters. 
                We do not own, control, or guarantee the condition of any pets listed on our platform.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Users are responsible for verifying pet health, behavior, and legal ownership before completing adoptions. 
              FurEverHome is not liable for any issues arising from pet adoptions, including but not limited to health 
              problems, behavioral issues, or legal disputes.
            </p>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The FurEverHome platform, including its design, features, and content, is protected by intellectual property rights. 
            Users retain ownership of content they post but grant FurEverHome a license to use, display, and distribute 
            that content on the platform.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Users must not infringe on others' intellectual property rights when posting content to the platform.
          </p>
        </Card>

        {/* Termination */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Account Termination</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            FurEverHome reserves the right to suspend or terminate accounts that violate these Terms or engage in 
            activities harmful to the platform or its users. Users may also terminate their accounts at any time 
            through their profile settings.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Upon termination, users lose access to their account and any associated data, though pet listing 
            information may be retained for record-keeping purposes.
          </p>
        </Card>

        {/* Changes to Terms */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400">
            FurEverHome may update these Terms periodically. Users will be notified of significant changes via 
            email or platform notifications. Continued use of the platform after changes constitutes acceptance 
            of the updated Terms.
          </p>
        </Card>

        {/* Contact */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About These Terms?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have questions about these Terms of Service or need clarification on any policies, 
            please contact our support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button to="/help" icon={<FileText size={16} />}>
              Contact Support
            </Button>
            <Button to="/privacy" variant="outline" icon={<Scale size={16} />}>
              Privacy Policy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
