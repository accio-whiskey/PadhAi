import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { TutorProfile, UserProfile } from '../types';
import { ShieldCheck, UserX, CheckCircle, XCircle, Loader2, Search, Filter, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const Admin = () => {
  const [tutors, setTutors] = useState<(TutorProfile & { user: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'tutors'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const tutorData: any[] = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data() as TutorProfile;
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', data.uid)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data() as UserProfile;
              tutorData.push({ ...data, user: userData });
            }
          }
          setTutors(tutorData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Admin fetch error:", err);
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const handleVerify = async (uid: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'tutors', uid), { isVerified });
    } catch (err) {
      console.error("Verify error:", err);
    }
  };

  const filteredTutors = tutors.filter(t =>
    t.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-500">Manage tutor verifications and user activity.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tutor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTutors.map((tutor) => (
                <tr key={tutor.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={tutor.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.user.name}`}
                        alt={tutor.user.name}
                        className="h-10 w-10 rounded-full border border-gray-100"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{tutor.user.name}</div>
                        <div className="text-xs text-gray-500">{tutor.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tutor.isVerified ? (
                      <span className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 text-xs font-bold uppercase tracking-wider">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {!tutor.isVerified ? (
                        <button
                          onClick={() => handleVerify(tutor.uid, true)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(tutor.uid, false)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-all flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-100">
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
