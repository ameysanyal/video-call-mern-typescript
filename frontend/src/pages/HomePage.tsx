import React, { useEffect, useState } from 'react'; // Explicitly import React
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  type UserFriend,
  type FriendRequest,
} from '@/lib/api';
import { Link } from 'react-router';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { AxiosError } from 'axios';
import { capitialize } from '@/lib/utils'; // Adjust path (../lib/utils -> @/lib/utils)
import FriendCard, { getLanguageFlag } from '@/components/FriendCard'; // Adjust path, FriendCard needs props typed
import NoFriendsFound from '@/components/NoFriendsFound'; // Adjust path
import { useThemeStore } from '@/store/useThemeStore.js';
// Assuming FriendCard.tsx defines these types or it's implicitly typed via usage
// Example of how FriendCard's props might be typed:
// interface FriendCardProps {
//   friend: UserFriend;
// }
// const FriendCard: React.FC<FriendCardProps> = ({ friend }) => { ... };

// Assuming capitialize and getLanguageFlag are correctly typed in their respective files:
// lib/utils.ts: export const capitialize = (str: string): string => { ... };
// components/FriendCard.ts/tsx: export const getLanguageFlag = (language: string): string => { ... };

const HomePage = (): React.JSX.Element => {
  // Explicitly type functional component return
  const queryClient = useQueryClient();
  // State for tracking outgoing requests; use Set<string> for user IDs
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState<Set<string>>(new Set());
  const { theme } = useThemeStore();
  // useQuery for user friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery<UserFriend[], AxiosError>({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  // useQuery for recommended users
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery<
    UserFriend[],
    AxiosError
  >({
    queryKey: ['users'],
    queryFn: getRecommendedUsers,
  });

  // useQuery for outgoing friend requests
  const { data: outgoingFriendReqs } = useQuery<FriendRequest[], AxiosError>({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendReqs,
  });

  // useMutation for sending friend requests
  const {
    mutate: sendRequestMutation,
    isPending, // Renamed 'error' to avoid conflict if needed, type is AxiosError | null
  } = useMutation<FriendRequest, AxiosError, string, unknown>({
    // TData: FriendRequest (what the mutation returns on success)
    // TError: AxiosError (what the mutation returns on error)
    // TVariables: string (the userId passed to sendFriendRequest)
    // TContext: unknown (not used here)
    mutationFn: sendFriendRequest, // (userId: string) => Promise<FriendRequest>
    onSuccess: () => {
      // Invalidate the outgoingFriendReqs query to refetch updated list
      queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
      // Optionally, you might want to invalidate 'users' to remove the sent user from recommendations
      // queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    // onError: (error) => { toast.error(`Failed to send request: ${error.message}`); }
  });

  // useEffect to populate outgoingRequestsIds Set
  useEffect(() => {
    const outgoingIds = new Set<string>(); // Explicitly type the Set content
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req: FriendRequest) => {
        // Explicitly type 'req'
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    } else {
      // If no outgoing requests or data is null, ensure the set is empty
      setOutgoingRequestsIds(new Set<string>());
    }
  }, [outgoingFriendReqs]); // Depend on outgoingFriendReqs data

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen" data-theme={theme}>
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map(
              (
                friend: UserFriend // Explicitly type 'friend'
              ) => (
                <FriendCard key={friend._id} friend={friend} />
              )
            )}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user: UserFriend) => {
                // Explicitly type 'user'
                const hasRequestBeenSent: boolean = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          {/* Use optional chaining for profilePic as it might be undefined/null */}
                          <img src={user.profilePic || undefined} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage ?? '')}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage ?? '')}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? 'btn-disabled' : 'btn-primary'
                        } `}
                        onClick={() => sendRequestMutation(user._id)} // Pass userId (string)
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
