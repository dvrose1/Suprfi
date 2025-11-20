// ABOUTME: Call-to-action section encouraging users to join waitlist or learn more
// ABOUTME: Features gradient background and prominent buttons

import React from 'react';
import Button from '../ui/Button';

const CtaSection: React.FC = () => {
  return (
    <section className="section bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join our waitlist to be the first to know when we launch direct applications. 
            Or ask your contractor if they offer SuprFi financing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              href="/waitlist"
              className="bg-white text-primary-700 hover:bg-gray-100"
            >
              Join Waitlist
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              href="/contractors"
              className="border-white text-white hover:bg-white/10"
            >
              For Contractors
            </Button>
          </div>

          {/* Trust badge */}
          <div className="mt-12 flex items-center justify-center space-x-2 text-primary-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Your information is secure and never shared</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
