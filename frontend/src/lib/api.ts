import axios from 'axios';
import { axiosInstance } from '@/lib/axios'; // Assuming axiosInstance is configured correctly
import { type LanguageFlag } from '@/constants';

export interface UserSignupData {
  email: string;
  password: string;
  fullName: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

// Data shape for the authenticated user (adjust as per your User model)
export interface AuthUser {
  _id: string;
  user: any;
  fullName: string;
  email: string;
  profilePic?: string;
  nativeLanguage?: LanguageFlag;
  learningLanguage?: LanguageFlag;
  isOnboarded: boolean;
  friends: string[]; // Array of friend IDs
  bio: string;
  location: string;
  // Add other user fields as needed
}

// Response for signup/login that might include user data and/or a message
export interface AuthResponse {
  message?: string;
  user: AuthUser;
  token?: string; // If your backend returns a token directly
}

// Data shape for onboarding (adjust as per your onboarding requirements)
export interface OnboardingData {
  fullName: string;
  nativeLanguage: string;
  learningLanguage: string;
  profilePic?: string; // If user can choose/upload
  bio?: string;
  isOnboarded?: boolean; // Often set by the backend, but might be sent
  location:string
  // Add other fields relevant to onboarding
}

// Data shape for a user in a friend list (often a subset of AuthUser)
export interface UserFriend {
  _id: string;
  fullName: string;
  profilePic: string;
  nativeLanguage: LanguageFlag;
  learningLanguage: LanguageFlag;
  location: string;
  bio: string;
  // Add other relevant fields for display
}

// Data shape for a friend request
export interface FriendRequest {
  _id: string;
  sender: UserFriend; // Populated sender
  recipient: UserFriend; // Populated recipient
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// NEW: Combined interface for the getFriendRequests response
export interface FriendRequestsResponse {
  incomingReqs: FriendRequest[];
  outgoingReqs: FriendRequest[];
  acceptedReqs?: FriendRequest[];
}

// Stream token response
export interface StreamTokenResponse {
  token: string;
}

export const signup = async (signupData: UserSignupData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/signup', signupData);
  return response.data;
};

export const login = async (loginData: UserLoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', loginData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  // Assuming logout returns no data or just a success message
  await axiosInstance.post('/auth/logout');
  return; // Explicitly return void
};

export const getAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const res = await axiosInstance.get<AuthUser>('/auth/me');
    return res.data;
  } catch (error: unknown) {
    // Type 'error' as unknown for safety
    if (axios.isAxiosError(error)) {
      // Check if it's an Axios error
      console.error('Axios Error in getAuthUser:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error('Unknown Error in getAuthUser:', error);
    }
    return null;
  }
};

export const completeOnboarding = async (userData: OnboardingData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/onboarding', userData);
  return response.data;
};

export async function getUserFriends(): Promise<UserFriend[]> {
  const response = await axiosInstance.get<UserFriend[]>('/users/friends');
  return response.data;
}

export async function getRecommendedUsers(): Promise<UserFriend[]> {
  const response = await axiosInstance.get<UserFriend[]>('/users');
  return response.data;
}

export async function getOutgoingFriendReqs(): Promise<FriendRequest[]> {
  // Assuming this returns an array of FriendRequest objects, possibly populated with recipient user info
  const response = await axiosInstance.get<FriendRequest[]>('/users/outgoing-friend-requests');
  return response.data;
}

export async function sendFriendRequest(userId: string): Promise<FriendRequest> {
  // Assuming this returns the newly created friend request object
  const response = await axiosInstance.post<FriendRequest>(`/users/friend-request/${userId}`);
  return response.data;
}

// getFriendRequests might return both incoming and outgoing, or specific types.
// Adjust the return type based on your API's actual response for this endpoint.
// For example, if it returns an object like { incoming: FriendRequest[], outgoing: FriendRequest[] }
export async function getFriendRequests(): Promise<{
  incomingReqs: FriendRequest[];
  outgoingReqs: FriendRequest[];
}> {
  const response = await axiosInstance.get<{
    incomingReqs: FriendRequest[];
    outgoingReqs: FriendRequest[];
  }>('/users/friend-requests');
  return response.data;
}

export async function acceptFriendRequest(requestId: string): Promise<{ message: string }> {
  // Assuming this returns a simple success message or status
  const response = await axiosInstance.put<{ message: string }>(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken(): Promise<StreamTokenResponse> {
  const response = await axiosInstance.get<StreamTokenResponse>('/chat/token');
  return response.data;
}
