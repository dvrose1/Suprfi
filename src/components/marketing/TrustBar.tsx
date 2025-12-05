import React from 'react';

const TrustBar: React.FC = () => {
  const stats = [
    { value: '60 sec', label: 'Decision time' },
    { value: '$2.5K–$25K', label: 'Loan amounts' },
    { value: '14.99%', label: 'APR as low as' },
    { value: '0', label: 'Hidden fees' },
  ];

  return (
    <section className="py-4 sm:py-6 border-y border-gray-100 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 lg:gap-16 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-lg sm:text-2xl font-bold text-navy font-display">{stat.value}</div>
              <div className="text-xs sm:text-sm text-medium-gray">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
