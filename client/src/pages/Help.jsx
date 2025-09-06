import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageCircle, ChevronDown, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Help = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      id: 1,
      question: "How do I post a pet for adoption?",
      answer: "To post a pet for adoption, navigate to the 'Post Pet' page from your dashboard or navigation menu. Fill in all the required details including photos, description, health information, and contact details. Make sure to provide accurate and complete information to help potential adopters."
    },
    {
      id: 2,
      question: "How do I adopt a pet?",
      answer: "Browse available pets on our platform, click on any pet you're interested in to view detailed information. Contact the pet owner using the provided contact information to discuss adoption details, meet the pet, and complete the adoption process."
    },
    {
      id: 3,
      question: "Can I edit my pet listing after posting?",
      answer: "Yes, you can edit your pet listings. Go to your profile or dashboard, find your posted pets, and click the edit button on any listing you want to modify. You can update photos, descriptions, status, and other details."
    },
    {
      id: 4,
      question: "How do I mark a pet as adopted?",
      answer: "When your pet has been successfully adopted, you can update the listing status to 'adopted' by editing the pet listing from your dashboard or profile page. This will help other users know the pet is no longer available."
    },
    {
      id: 5,
      question: "Is there a fee for using FurEverHome?",
      answer: "FurEverHome is completely free to use. There are no charges for posting pets, browsing listings, or connecting with other users. Our mission is to help pets find loving homes without any financial barriers."
    },
    {
      id: 6,
      question: "How do I report inappropriate content or users?",
      answer: "If you encounter inappropriate content or suspicious behavior, please contact our support team immediately using the contact form below or email us at furEverHome@gmail.com. We take all reports seriously and will investigate promptly."
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" icon={<ArrowLeft size={16} />}>Back</Button>
            </Link>
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <HelpCircle className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* FAQ Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {activeAccordion === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === faq.id && (
                      <div className="px-4 pb-3">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Support Section */}
          <div className="space-y-6">
            
            {/* Quick Contact Options */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Support
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">furEverHome@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <MessageCircle className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Coming Soon</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Form */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Send us a message
              </h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" icon={<Send size={16} />}>
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <Card className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Other Resources
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" to="/about">About Us</Button>
              <Button variant="outline" to="/privacy">Privacy Policy</Button>
              <Button variant="outline" to="/terms">Terms of Service</Button>
              <Button variant="outline" to="/community">Community Guidelines</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
