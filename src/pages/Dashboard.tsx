import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Lead, TutorProfile, UserProfile } from '../types';
import { User, BookOpen, MessageSquare, Star, ShieldCheck, Settings, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'profile' | 'settings'>('leads');

  useEffect(() => {
    if (!user || !profile) return;

    setLoading(true);
    const leadsQuery = query(
      collection(db, 'leads'),
      where(profile.role === 'tutor' ? 'tutorId' : 'parentId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
      setLeads(leadData);
      setLoading(false);
    }, (error) => {
      console.error("Leads fetch error:", error);
      setLoading(false);
    });

    if (profile.role === 'tutor') {
      const tutorUnsubscribe = onSnapshot(doc(db, 'tutors', user.uid), (doc) => {
        if (doc.exists()) {
          setTutorProfile(doc.data() as TutorProfile);
        }
      });
      return () => { unsubscribe(); tutorUnsubscribe(); };
    }

    return () => unsubscribe();
  }, [user, profile]);

  const handleLeadAction = async (leadId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { status });
    } catch (err) {
      console.error("Lead action error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
                alt={profile?.name}
                className="h-12 w-12 rounded-full border-2 border-indigo-50"
              />
              <div>
                <h2 className="font-bold text-gray-900">{profile?.name}</h2>
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{profile?.role}</span>
              </div>
            </div>
            {profile?.role === 'tutor' && tutorProfile?.isVerified && (
              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Tutor</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-white hover:text-indigo-600'}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{profile?.role === 'tutor' ? 'Student Leads' : 'My Requests'}</span>
          </button>

          {profile?.role === 'tutor' && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-white hover:text-indigo-600'}`}
            >
              <User className="h-5 w-5" />
              <span>Tutor Profile</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-white hover:text-indigo-600'}`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.role === 'tutor' ? 'Student Inquiries' : 'My Tutor Requests'}
                </h1>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                  {leads.length} Total
                </span>
              </div>

              {leads.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-500">
                    {profile?.role === 'tutor' ? 'New student inquiries will appear here.' : 'Start searching for tutors to send requests!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {leads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {profile?.role === 'tutor' ? 'New Inquiry' : 'Request Sent'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{lead.message}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          lead.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          lead.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {lead.status}
                        </span>

                        {profile?.role === 'tutor' && lead.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLeadAction(lead.id, 'accepted')}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all"
                              title="Accept"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleLeadAction(lead.id, 'rejected')}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all"
                              title="Reject"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && profile?.role === 'tutor' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Tutor Profile</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Pricing (₹)</label>
                    <input
                      type="number"
                      defaultValue={tutorProfile?.pricing}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      defaultValue={tutorProfile?.experience}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    defaultValue={tutorProfile?.bio}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
              <p className="text-gray-500">Manage your account preferences and notifications.</p>
              {/* Add more settings here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
