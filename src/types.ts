export type UserRole = 'parent' | 'tutor' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface TutorProfile {
  uid: string;
  subjects: string[];
  classes: string[];
  pricing: number;
  bio: string;
  qualification: string;
  experience: number;
  isVerified: boolean;
  isTopTutor: boolean;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  demoVideoUrl?: string;
  idProofUrl?: string;
  qualificationProofUrl?: string;
}

export interface Lead {
  id: string;
  parentId: string;
  tutorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
}

export interface Review {
  id: string;
  parentId: string;
  tutorId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  parentId: string;
  tutorId: string;
  createdAt: string;
}
