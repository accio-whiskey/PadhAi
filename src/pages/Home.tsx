import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, BookOpen, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Home = () => {
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?subject=${subject}&location=${location}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-indigo-600 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            Find the Perfect Home Tutor <br />
            <span className="text-indigo-200">for Your Child's Future</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-light"
          >
            Verified tutors, personalized learning, and measurable outcomes.
            Trusted by 5,000+ parents across the city.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-grow flex items-center px-4 py-3 w-full border-b md:border-b-0 md:border-r border-gray-100">
              <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
              <input
                type="text"
                placeholder="What subject? (e.g. Maths, Physics)"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="flex-grow flex items-center px-4 py-3 w-full">
              <MapPin className="h-5 w-5 text-indigo-500 mr-3" />
              <input
                type="text"
                placeholder="Where? (e.g. South Delhi, Bandra)"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search Tutors</span>
            </button>
          </motion.form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PadhAi?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We prioritize safety, transparency, and results above all else.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Tutors</h3>
              <p className="text-gray-500">Every tutor undergoes a multi-step verification process including ID and qualification checks.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Ratings</h3>
              <p className="text-gray-500">Real reviews from real parents. No hidden agendas, just honest feedback on performance.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <ArrowRight className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Demo Class</h3>
              <p className="text-gray-500">Book a free demo session to ensure the tutor is the right fit for your child before committing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto bg-indigo-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Are you an expert tutor?</h2>
            <p className="text-indigo-200 mb-10 text-lg max-w-xl mx-auto">Join our network of elite educators and start earning by helping students achieve their goals.</p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-indigo-900 px-10 py-4 rounded-full font-bold hover:bg-indigo-50 transition-all shadow-lg"
            >
              Become a Tutor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
