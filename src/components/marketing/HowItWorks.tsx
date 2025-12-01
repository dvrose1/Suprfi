import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    { 
      step: '01', 
      title: 'Tell us about your project',
      desc: 'Quick 2-minute application. We just need the basics to show you options.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      step: '02', 
      title: 'See your options instantly',
      desc: 'Get approved in under 60 seconds with rates and terms tailored to you.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      step: '03', 
      title: 'Get the work done',
      desc: 'We pay your contractor directly when the job is complete. Easy.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-navy font-display">
            From quote to done in three steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We made financing as simple as it should be. Tell us what you need, see your options, get it done.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <div key={i} className="relative">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.1) 0%, rgba(110, 198, 167, 0.1) 100%)' }}
              >
                <div className="text-teal">{item.icon}</div>
              </div>
              <div className="text-sm font-bold mb-2 text-teal">{item.step}</div>
              <h3 className="text-xl font-bold mb-3 text-navy font-display">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
