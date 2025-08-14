import { type LanguageFlag } from '@/constants';
import { axiosInstance } from '@/lib/axios'; // Assuming axiosInstance is configured correctly

export type UserSignupData = {
  email: string;
  password: string;
  fullName: string;
};

export type UserLoginData = {
  email: string;
  password: string;
};

// Data shape for the authenticated user (adjust as per your User model)
export type AuthUser = {
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
};

// Response for signup/login that might include user data and/or a message
export type AuthResponse = {
  message?: string;
  user: AuthUser;
  token?: string; // If your backend returns a token directly
};

// Data shape for onboarding (adjust as per your onboarding requirements)
export type OnboardingData = {
  fullName: string;
  nativeLanguage: string;
  learningLanguage: string;
  profilePic?: string; // If user can choose/upload
  bio?: string;
  isOnboarded?: boolean; // Often set by the backend, but might be sent
  location: string;
  // Add other fields relevant to onboarding
};

// Data shape for a user in a friend list (often a subset of AuthUser)
export type UserFriend = {
  _id: string;
  fullName: string;
  profilePic: string;
  nativeLanguage: LanguageFlag;
  learningLanguage: LanguageFlag;
  location: string;
  bio: string;
  // Add other relevant fields for display
};

// Data shape for a friend request
export type FriendRequest = {
  _id: string;
  sender: UserFriend; // Populated sender
  recipient: UserFriend; // Populated recipient
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

// NEW: Combined interface for the getFriendRequests response
export type FriendRequestsResponse = {
  incomingReqs: FriendRequest[];
  outgoingReqs: FriendRequest[];
  acceptedReqs?: FriendRequest[];
};

// Stream token response
export type StreamTokenResponse = {
  data: string;
};

export const signup = async (signupData: UserSignupData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/signup', signupData);

  return response.data;
};

export const login = async (loginData: UserLoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<{ data: AuthResponse }>('/auth/login', loginData);

  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
  return;
};

export const getAuthUser = async (): Promise<AuthUser | null> => {
  const res = await axiosInstance.get<AuthUser>('/auth/me');
  return res.data.user;
};

export const completeOnboarding = async (userData: OnboardingData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/onboarding', userData);
  return response.data;
};

export async function getUserFriends(): Promise<UserFriend[]> {
  const response = await axiosInstance.get<{ data: UserFriend[] }>('/users/friends');

  return response.data.data || [];
}

export async function getRecommendedUsers(): Promise<UserFriend[]> {
  const response = await axiosInstance.get<{ data: UserFriend[] }>('/users');

  return response.data.data || [];
}

export async function getOutgoingFriendReqs(): Promise<FriendRequest[]> {
  // Assuming this returns an array of FriendRequest objects, possibly populated with recipient user info
  const response = await axiosInstance.get<{ data: FriendRequest[] }>(
    '/users/outgoing-friend-requests'
  );

  return response.data.data || [];
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
    data: { incomingReqs: FriendRequest[]; outgoingReqs: FriendRequest[] };
  }>('/users/friend-requests');

  return response.data.data || { incomingReqs: [], outgoingReqs: [] };
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
