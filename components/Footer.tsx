import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Grand Horizon <span className="text-amber-400">Hotel</span>
            </h2>
            <p className="text-slate-400 leading-relaxed font-light">
              Experience the pinnacle of luxury and comfort on the Miami coastline. 
              Our commitment to excellence ensures an unforgettable stay.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-amber-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-amber-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-amber-400 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-4">
              <li><a href="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Home</a></li>
              <li><a href="#rooms" className="hover:text-white hover:translate-x-1 transition-all inline-block">Rooms & Suites</a></li>
              <li><a href="#amenities" className="hover:text-white hover:translate-x-1 transition-all inline-block">Amenities</a></li>
              <li><a href="#dining" className="hover:text-white hover:translate-x-1 transition-all inline-block">Fine Dining</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Information</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">FAQ</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Careers</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-amber-400 mt-1" size={18} />
                <span>123 Ocean Drive, Miami Beach, FL 33139</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-amber-400" size={18} />
                <span>+1 (555) 789-1234</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-amber-400" size={18} />
                <span>info@grandhorizon.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-sm font-light">
          <p>© {new Date().getFullYear()} Grand Horizon Hotel. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <span className="text-slate-500 italic">"Hospitality Redefined"</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
