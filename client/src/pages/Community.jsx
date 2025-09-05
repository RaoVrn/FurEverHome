import React from 'react';
import { Users, Heart, Shield, MessageCircle, Flag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Community = () => {
  const guidelines = [
    {
      icon: Heart,
      title: 'Be Kind and Respectful',
      description: 'Treat all community members with kindness, respect, and empathy.',
      rules: [
        'Use polite and courteous language in all interactions',
        'Respect different opinions and approaches to pet care',
        'Be patient with new users learning the platform',
        'Celebrate successful adoptions and positive outcomes'
      ]
    },
    {
      icon: Shield,
      title: 'Prioritize Pet Welfare',
      description: 'The well-being of pets is our top priority in all decisions and interactions.',
      rules: [
        'Provide accurate and complete information about pets',
        'Disclose any health or behavioral issues honestly',
        'Ensure pets are ready for adoption (vaccinated, spayed/neutered when appropriate)',
        'Report any concerns about pet welfare or neglect'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Communicate Responsibly',
      description: 'Foster positive communication that helps connect pets with loving homes.',
      rules: [
        'Respond to adoption inquiries promptly and professionally',
        'Ask thoughtful questions to ensure good matches',
        'Keep initial conversations on the platform for safety',
        'Be honest about your living situation and experience'
      ]
    },
    {
      icon: Users,
      title: 'Build Trust',
      description: 'Help create a trustworthy environment where everyone feels safe.',
      rules: [
        'Use real photos and accurate descriptions',
        'Meet potential adopters in safe, public locations',
        'Verify information when possible',
        'Report suspicious or fraudulent activity'
      ]
    }
  ];

  const reportingReasons = [
    'Inappropriate or offensive content',
    'Suspected fraud or scam',
    'Animal welfare concerns',
    'Harassment or bullying',
    'Spam or commercial content',
    'Fake or misleading information'
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
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6">
              Community Guidelines
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Together, we're building a community dedicated to finding loving homes for pets in need.
            </p>
            <p className="text-white/80 mt-4">
              Last updated: September 5, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <Card className="p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Community Values</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            FurEverHome is more than just a platform – it's a community of people who care deeply about animal welfare. 
            These guidelines help ensure our community remains a safe, supportive, and effective place for connecting 
            pets with their forever families.
          </p>
        </Card>

        {/* Main Guidelines */}
        <div className="grid gap-8 md:grid-cols-2">
          {guidelines.map((guideline, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 mr-4">
                  <guideline.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {guideline.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {guideline.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {guideline.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Adoption Best Practices */}
        <Card className="p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Adoption Best Practices</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">For Pet Owners</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Screen potential adopters carefully</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Arrange meet-and-greets in safe locations</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Provide transition period support</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Keep adoption contracts if desired</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">For Adopters</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Be honest about your living situation</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Ask detailed questions about the pet</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Prepare your home before bringing pet home</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-400">Be patient during the adjustment period</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Safety Guidelines */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Safety Guidelines</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Meet Safely</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Always meet in public places during initial meetings. Bring a friend if possible.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Verify Information</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Verify pet ownership and health records. Trust your instincts if something seems off.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Report Issues</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Report any suspicious activity, inappropriate behavior, or safety concerns immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Reporting */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reporting Violations</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Help us maintain a safe community by reporting violations of these guidelines. 
            Common reasons to report include:
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {reportingReasons.map((reason, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-600 dark:text-gray-400">{reason}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Emergency:</strong> If you encounter an immediate threat to animal welfare or safety, 
              contact local authorities or animal control immediately.
            </p>
          </div>
        </Card>

        {/* Consequences */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Consequences of Violations</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We take community guidelines seriously. Violations may result in:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Minor Violations</h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• Warning and guidance</li>
                <li>• Content removal</li>
                <li>• Temporary restrictions</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Serious Violations</h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• Account suspension</li>
                <li>• Permanent ban</li>
                <li>• Law enforcement referral</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Community Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            By following these guidelines, you're helping create a community where pets find loving homes 
            and families find their perfect companions. Thank you for being part of FurEverHome.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/dashboard" icon={<Heart size={16} />}>
              Start Browsing Pets
            </Button>
            <Button to="/help" variant="outline" icon={<MessageCircle size={16} />}>
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Community;
