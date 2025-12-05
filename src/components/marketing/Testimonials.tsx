import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    { 
      quote: "Our AC died in July. SuprFi had us approved before the technician finished the estimate. Lifesaver.",
      name: "Maria S.",
      location: "Tampa, FL",
      service: "HVAC Replacement"
    },
    { 
      quote: "I was worried about my credit affecting my rate, but SuprFi gave me options I could actually afford.",
      name: "James T.",
      location: "Atlanta, GA",
      service: "Plumbing Emergency"
    },
    { 
      quote: "As a contractor, SuprFi helps me close more jobs. Customers love how easy it is.",
      name: "Roberto M.",
      location: "Charlotte, NC",
      service: "SuprFi Partner"
    },
  ];

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-navy font-display">
            Real people, real results
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[1,2,3,4,5].map(star => (
                  <svg key={star} className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-warning" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <div className="font-semibold text-navy text-sm sm:text-base">{testimonial.name}</div>
                <div className="text-xs sm:text-sm text-medium-gray">{testimonial.location} &bull; {testimonial.service}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
