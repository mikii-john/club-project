import React, { useEffect } from 'react';
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';
import { ArrowRight, Utensils, Waves, Shield, Clock, MapPin, Database, Star, Camera } from 'lucide-react';

const LandingPage: React.FC = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover animate-fade-in"
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury hotel lobby"
          />
          <div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl xs:text-5xl font-serif font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Grand Horizon <span className="text-amber-400">Hotel</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-indigo-50 max-w-2xl font-light leading-relaxed">
              Experience the pinnacle of luxury and comfort on the Miami coastline. 
              Enjoy our world-class amenities and let our AI Concierge assist you instantly.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="flex-1 sm:flex-none px-8 py-4 border border-transparent text-base font-medium rounded-full text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-xl transition-all hover:scale-105 active:scale-95">
                Book a Suite
              </button>
              <button className="flex-1 sm:flex-none px-8 py-4 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95">
                View Amenities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-amber-600 dark:text-amber-500 font-semibold tracking-widest uppercase text-sm mb-2">The Experience</h2>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">Unmatched Hospitality</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="group relative overflow-hidden rounded-2xl shadow-lg reveal stagger-1">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Room" className="w-full h-72 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl font-bold">Luxury Suites</h3>
                <p className="text-slate-200 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Breath-taking ocean views and premium comfort.</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-lg reveal stagger-2">
              <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dining" className="w-full h-72 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl font-bold">Fine Dining</h3>
                <p className="text-slate-200 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Michelin-star culinary experiences.</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-lg reveal stagger-3">
              <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Pool" className="w-full h-72 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl font-bold">Rooftop Pool</h3>
                <p className="text-slate-200 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Relax above the city skyline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-20 lg:py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16 reveal">
            <h2 className="text-base text-amber-600 dark:text-amber-500 font-semibold tracking-wide uppercase">Your Stay</h2>
            <p className="mt-2 text-3xl leading-8 font-serif font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Modern Luxury, Traditional Roots
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative reveal">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Hotel Architecture" 
                className="rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-amber-400 p-4 sm:p-8 rounded-2xl shadow-xl animate-bounce shadow-amber-200/50" style={{ animationDuration: '3s' }}>
                <div className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">25+</div>
                <div className="text-slate-800 font-medium font-serif italic text-sm sm:text-lg whitespace-nowrap">Years of Excellence</div>
              </div>
            </div>
            
            <dl className="space-y-8 sm:space-y-10">
              <div className="flex items-start reveal stagger-1">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-950 transition-colors hover:bg-amber-400 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-amber-400 shadow-lg shadow-amber-400/10">
                    <Database className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-slate-900 dark:text-white">AI Concierge</dt>
                  <dd className="mt-2 text-base text-gray-500 dark:text-slate-400 font-light leading-relaxed">
                    Our RAG-powered bot answers instantly using our hotel's real-time knowledge base.
                  </dd>
                </div>
              </div>

              <div className="flex items-start reveal stagger-2">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-950 transition-colors hover:bg-amber-400 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-amber-400 shadow-lg shadow-amber-400/10">
                    <Waves className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Oceanfront Living</dt>
                  <dd className="mt-2 text-base text-gray-500 dark:text-slate-400 font-light leading-relaxed">
                    Every suite offers breathtaking views of the Atlantic Ocean with private balcony access.
                  </dd>
                </div>
              </div>

              <div className="flex items-start reveal stagger-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900 dark:bg-amber-400 text-amber-400 dark:text-slate-950 transition-colors hover:bg-amber-400 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-amber-400 shadow-lg shadow-amber-400/10">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Michelin Dining</dt>
                  <dd className="mt-2 text-base text-gray-500 dark:text-slate-400 font-light leading-relaxed">
                    Experience culinary excellence at "The Azure", our award-winning seafood restaurant.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ChatBot />
      <Footer />
    </div>
  );
};

export default LandingPage;