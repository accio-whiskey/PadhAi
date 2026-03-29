import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { TutorProfile, UserProfile } from '../types';
import { Search as SearchIcon, MapPin, Star, ShieldCheck, Filter, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<(TutorProfile & { user: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const subjectParam = searchParams.get('subject') || '';
  const locationParam = searchParams.get('location') || '';

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        // In a real app, we'd use Algolia or similar for geo-search
        // For now, we'll fetch all tutors and filter client-side
        const q = query(collection(db, 'tutors'), limit(20));
        const querySnapshot = await getDocs(q);
        const tutorData: any[] = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data() as TutorProfile;
          // Fetch user profile for name and photo
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', data.uid)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data() as UserProfile;
            tutorData.push({ ...data, user: userData });
          }
        }

        // Simple client-side filtering
        const filtered = tutorData.filter(t => {
          const matchesSubject = !subjectParam || t.subjects.some((s: string) => s.toLowerCase().includes(subjectParam.toLowerCase()));
          const matchesLocation = !locationParam || t.location.address.toLowerCase().includes(locationParam.toLowerCase());
          return matchesSubject && matchesLocation;
        });

        setTutors(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch tutors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [subjectParam, locationParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">Filters</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option>All Classes</option>
                <option>Class 1-5</option>
                <option>Class 6-8</option>
                <option>Class 9-10</option>
                <option>Class 11-12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (per hour)</label>
              <input type="range" className="w-full accent-indigo-600" min="200" max="2000" step="100" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹200</span>
                <span>₹2000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-grow w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {tutors.length} Tutors found {subjectParam && `for ${subjectParam}`} {locationParam && `in ${locationParam}`}
            </h1>
            <p className="text-gray-500">Showing verified home tutors nearby.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Finding the best tutors for you...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
          ) : tutors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <Link to="/" className="text-indigo-600 font-bold hover:underline">Go back to home</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {tutors.map((tutor, idx) => (
                <motion.div
                  key={tutor.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={tutor.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.user.name}`}
                            alt={tutor.user.name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-indigo-50"
                          />
                          {tutor.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                              <ShieldCheck className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{tutor.user.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{tutor.location.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{tutor.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tutor.subjects.slice(0, 3).map(s => (
                          <span key={s} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-xs font-medium">
                            {s}
                          </span>
                        ))}
                        {tutor.subjects.length > 3 && (
                          <span className="text-xs text-gray-400">+{tutor.subjects.length - 3} more</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <span className="text-lg font-bold text-gray-900">₹{tutor.pricing}</span>
                        <span className="text-xs text-gray-500 ml-1">/hr</span>
                      </div>
                      <Link
                        to={`/tutor/${tutor.uid}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
