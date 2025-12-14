import React, { useState } from 'react';
import { Check, ArrowRight, Shield, Clock, Zap, Home, Wrench, Thermometer, Droplets, Plug, Bug, ChevronDown, Star, Phone, Mail } from 'lucide-react';

// SuprFi Marketing Homepage Mockup
// Demonstrates brand guidelines in action

export default function SuprFiHomepage() {
  const [loanAmount, setLoanAmount] = useState(5000);
  
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Mark */}
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F2D4A" />
                    <stop offset="50%" stopColor="#2A9D8F" />
                    <stop offset="100%" stopColor="#6EC6A7" />
                  </linearGradient>
                </defs>
                <path d="M20 4L4 16V36H16V24H24V36H36V16L20 4Z" fill="url(#logoGradient)" />
                <path d="M14 18L18 22L26 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-2xl font-bold" style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Supr<span style={{ color: '#2A9D8F' }}>Fi</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How It Works</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Rates</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">For Contractors</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Help</a>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium" style={{ color: '#0F2D4A' }}>Sign In</a>
            <button 
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #2A9D8F 100%)' }}
            >
              Check Your Rate
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(ellipse at top right, #2A9D8F 0%, transparent 50%), radial-gradient(ellipse at bottom left, #6EC6A7 0%, transparent 50%)' }}
        />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-sm mb-6" style={{ color: '#2A9D8F' }}>
                <Zap className="w-4 h-4" />
                <span className="font-medium">Decisions in under 60 seconds</span>
              </div>
              
              <h1 
                className="text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Home repairs can't wait.
                <br />
                <span style={{ color: '#2A9D8F' }}>Neither should your financing.</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get approved for $2,500 – $25,000 in under a minute. No hidden fees. 
                No hard credit check to see your options.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #2A9D8F 100%)' }}
                >
                  Check Your Rate
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:bg-gray-50" style={{ borderColor: '#0F2D4A', color: '#0F2D4A' }}>
                  See How It Works
                </button>
              </div>
              
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: '#2A9D8F' }} />
                Checking your rate won't affect your credit score
              </p>
            </div>
            
            {/* Rate Calculator Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold mb-6" style={{ color: '#0F2D4A' }}>See your estimated payment</h3>
              
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">How much do you need?</label>
                <div className="text-4xl font-bold mb-4" style={{ color: '#0F2D4A', fontFamily: "'JetBrains Mono', monospace" }}>
                  ${loanAmount.toLocaleString()}
                </div>
                <input 
                  type="range" 
                  min="2500" 
                  max="25000" 
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ 
                    background: `linear-gradient(to right, #2A9D8F 0%, #2A9D8F ${((loanAmount - 2500) / 22500) * 100}%, #E5E7EB ${((loanAmount - 2500) / 22500) * 100}%, #E5E7EB 100%)` 
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$2,500</span>
                  <span>$25,000</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[24, 36, 48].map(term => (
                  <div key={term} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors cursor-pointer">
                    <div className="text-2xl font-bold" style={{ color: '#0F2D4A', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Math.round(loanAmount / term * 1.2).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{term} months</div>
                  </div>
                ))}
              </div>
              
              <button 
                className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #2A9D8F 0%, #6EC6A7 100%)' }}
              >
                Get Your Personalized Rate
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                Rates from 14.99% APR. Your rate will depend on your credit profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 border-y border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 text-center">
            {[
              { value: '60 sec', label: 'Decision time' },
              { value: '$2.5K–$25K', label: 'Loan amounts' },
              { value: '14.99%', label: 'APR as low as' },
              { value: '0', label: 'Hidden fees' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold" style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              From quote to done in three steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We made financing as simple as it should be. Tell us what you need, see your options, get it done.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                icon: <Home className="w-8 h-8" />,
                title: 'Tell us about your project',
                desc: 'Quick 2-minute application. We just need the basics to show you options.'
              },
              { 
                step: '02', 
                icon: <Clock className="w-8 h-8" />,
                title: 'See your options instantly',
                desc: 'Get approved in under 60 seconds with rates and terms tailored to you.'
              },
              { 
                step: '03', 
                icon: <Check className="w-8 h-8" />,
                title: 'Get the work done',
                desc: 'We pay your contractor directly when the job is complete. Easy.'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.1) 0%, rgba(110, 198, 167, 0.1) 100%)' }}
                >
                  <div style={{ color: '#2A9D8F' }}>{item.icon}</div>
                </div>
                <div className="text-sm font-bold mb-2" style={{ color: '#2A9D8F' }}>{item.step}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#0F2D4A' }}>{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Financing for whatever your home needs
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: <Thermometer className="w-6 h-6" />, label: 'HVAC' },
              { icon: <Droplets className="w-6 h-6" />, label: 'Plumbing' },
              { icon: <Plug className="w-6 h-6" />, label: 'Electrical' },
              { icon: <Bug className="w-6 h-6" />, label: 'Pest Control' },
              { icon: <Home className="w-6 h-6" />, label: 'Roofing' },
              { icon: <Wrench className="w-6 h-6" />, label: 'Repairs' },
            ].map((service, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer group"
              >
                <div 
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ background: 'linear-gradient(135deg, rgba(15, 45, 74, 0.05) 0%, rgba(42, 157, 143, 0.1) 100%)' }}
                >
                  <div style={{ color: '#2A9D8F' }}>{service.icon}</div>
                </div>
                <span className="font-medium" style={{ color: '#0F2D4A' }}>{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#0F2D4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Real people, real results
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-current" style={{ color: '#FFB84D' }} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold" style={{ color: '#0F2D4A' }}>{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location} • {testimonial.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #2A9D8F 100%)' }}>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Check your rate in 60 seconds. No commitment, no credit impact.
          </p>
          <button className="px-10 py-5 bg-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-xl" style={{ color: '#0F2D4A' }}>
            Check Your Rate Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2A9D8F 0%, #6EC6A7 100%)' }}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SuprFi</span>
              </div>
              <p className="text-sm">Financing that works as fast as you need it.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rates & Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Contractors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 SuprFi Inc. All rights reserved. NMLS# XXXXXX</p>
            <p className="text-xs text-gray-500 max-w-2xl text-center md:text-right">
              Loans are provided by SuprFi's lending partners. APR ranges from 14.99% to 29.99%. 
              Rates depend on credit profile and loan terms.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
