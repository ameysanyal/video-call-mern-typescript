import React from "react"; // Explicitly import React
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  getFriendRequests,
  type FriendRequest,       // Import the FriendRequest interface
  type FriendRequestsResponse, 
} from "@/lib/api"; // Adjust path if necessary (../lib/api -> @/lib/api)
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "@/components/NoNotificationsFound"; // Adjust path
import {AxiosError} from 'axios'

const NotificationsPage = (): React.JSX.Element => {
  const queryClient = useQueryClient();

  // 1. Type useQuery for fetching friend requests
  const {
    data: friendRequests, // data will be FriendRequestsResponse | undefined
    isLoading,   // error is AxiosError | null
  } = useQuery<FriendRequestsResponse, AxiosError>({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests, // This function should return Promise<FriendRequestsResponse>
  });

  // 2. Type useMutation for accepting friend requests
  const {
    mutate: acceptRequestMutation,
    isPending, // error is AxiosError | null
  } = useMutation<{ message: string }, AxiosError, string, unknown>({
    // TData: void (assuming no specific data returned on success for accept)
    // TError: AxiosError
    // TVariables: string (the ID of the friend request to accept)
    // TContext: unknown (not used here)
    mutationFn: acceptFriendRequest, // This function should accept a string (request ID) and return Promise<void>
    onSuccess: () => {
      // Invalidate both friendRequests and friends queries to refetch updated lists
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] }); // Update friends list on acceptance
    },
    // Optional: Add onError to handle mutation errors (e.g., toast.error)
    // onError: (error) => {
    //   console.error("Failed to accept request:", error);
    //   toast.error("Failed to accept friend request.");
    // }
  });

  // Destructure incomingReqs and acceptedReqs with default empty arrays for safety
  // friendRequests is FriendRequestsResponse | undefined, so optional chaining is crucial
  const incomingRequests: FriendRequest[] = friendRequests?.incomingReqs || [];
  const acceptedRequests: FriendRequest[] = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* INCOMING FRIEND REQUESTS SECTION */}
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request: FriendRequest) => ( // Explicitly type 'request'
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              {/* Use optional chaining for profilePic as it might be undefined/null */}
                              <img src={request.sender.profilePic || undefined} alt={request.sender.fullName} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)} // Pass request._id (string)
                            disabled={isPending} // Disable button while mutation is pending
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQUESTS NOTIFICATIONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification: FriendRequest) => ( // Explicitly type 'notification'
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.profilePic || undefined}
                              alt={notification.recipient.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.recipient.fullName}</h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullName} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* NO NOTIFICATIONS FOUND */}
            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;