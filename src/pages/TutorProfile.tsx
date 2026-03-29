import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { TutorProfile as TutorProfileType, UserProfile } from '../types';
import { Star, ShieldCheck, MapPin, BookOpen, GraduationCap, Clock, MessageSquare, Loader2, PlayCircle, Bookmark, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

const TutorProfile = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<(TutorProfileType & { user: UserProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const tutorDoc = await getDoc(doc(db, 'tutors', id));
        const userDoc = await getDoc(doc(db, 'users', id));

        if (tutorDoc.exists() && userDoc.exists()) {
          setTutor({
            ...(tutorDoc.data() as TutorProfileType),
            user: userDoc.data() as UserProfile
          });
        }
      } catch (err) {
        console.error("Fetch tutor error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  const handleRequestDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setRequesting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        parentId: user.uid,
        tutorId: id,
        status: 'pending',
        message: message || `Hi, I'm interested in a demo class for ${tutor?.subjects[0]}.`,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err) {
      console.error("Request demo error:", err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tutor not found</h1>
        <button onClick={() => navigate('/search')} className="text-indigo-600 font-bold hover:underline">Back to search</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <img
                    src={tutor.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.user.name}`}
                    alt={tutor.user.name}
                    className="h-32 w-32 rounded-3xl object-cover border-4 border-indigo-50 shadow-lg"
                  />
                  {tutor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-xl border-4 border-white shadow-md">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-grow text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-1">{tutor.user.name}</h1>
                      <div className="flex items-center justify-center md:justify-start text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                          <span>{tutor.location.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-gray-900">{tutor.rating.toFixed(1)}</span>
                          <span className="text-xs ml-1">({tutor.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 justify-center">
                      <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100">
                        <Bookmark className="h-5 w-5" />
                      </button>
                      <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                    {tutor.subjects.map(s => (
                      <span key={s} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
                    <div className="text-center md:text-left">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Experience</div>
                      <div className="font-bold text-gray-900">{tutor.experience}+ Years</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Pricing</div>
                      <div className="font-bold text-gray-900">₹{tutor.pricing}/hr</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Classes</div>
                      <div className="font-bold text-gray-900">{tutor.classes.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-indigo-600" />
                About {tutor.user.name}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">
                {tutor.bio}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                    Qualifications
                  </h3>
                  <p className="text-sm text-gray-600">{tutor.qualification}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    Availability
                  </h3>
                  <p className="text-sm text-gray-600">Weekdays: 4 PM - 8 PM<br />Weekends: 10 AM - 6 PM</p>
                </div>
              </div>
            </div>

            {/* Demo Video */}
            {tutor.demoVideoUrl && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <PlayCircle className="h-6 w-6 mr-2 text-indigo-600" />
                  Demo Class Video
                </h2>
                <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                  <p className="text-gray-400">Video Player Placeholder</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Demo</h2>
              {success ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-500 mb-6">The tutor will get back to you within 24 hours.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    View in Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestDemo} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message to Tutor</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the tutor about your child's needs..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={requesting}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {requesting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <MessageSquare className="h-5 w-5" />
                    )}
                    <span>Request Demo Class</span>
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    By clicking, you agree to our terms of service and privacy policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
