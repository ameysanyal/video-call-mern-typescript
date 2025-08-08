import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Use react-router-dom for web apps
import useAuthUser from "@/hooks/useAuthUser"; // Assuming this is already typed
import { useQuery } from "@tanstack/react-query";
// Import StreamTokenResponse and AuthUser types, and getStreamToken function
import { getStreamToken, type StreamTokenResponse } from "@/lib/api";
import axios, {AxiosError} from 'axios'

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  Call, // Explicitly import the Call type
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  type User as StreamUser, // Alias User type from Stream SDK to avoid conflict with our AuthUser
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "@/components/PageLoader"; // Assuming this is already typed

const STREAM_API_KEY: string = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = (): React.JSX.Element => {
  // Use useParams with a generic type to specify expected params
  const { id: callId } = useParams<{ id: string }>(); // 'id' will be typed as string
  
  // Type useState hooks with specific Stream SDK types or null/undefined
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);

  // useAuthUser hook returns typed data (AuthUser | null | undefined for authUser)
  const { authUser, isLoading } = useAuthUser();

  // Type useQuery for getStreamToken
  const { data: tokenData } = useQuery<StreamTokenResponse, AxiosError>({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // Only run query if authUser exists
  });

  useEffect(() => {
    const initCall = async () => {
      // Ensure all necessary data is available and typed correctly
      if (!tokenData?.token || !authUser || !callId) {
        // console.log("Missing data for call initialization", { tokenData, authUser, callId });
        setIsConnecting(false); // Stop loading if essential data is missing
        return;
      }

      try {
        console.log("Initializing Stream video client...");

        // Map your AuthUser to Stream's User type
        const user: StreamUser = {
          id: authUser._id,
          name: authUser.fullName || authUser.email, // Use full name or fallback to email
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        // 'create: true' ensures the call is created if it doesn't exist
        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error: unknown) {
        // Use axios.isAxiosError for better error typing if it's an API error
        if (axios.isAxiosError(error)) {
            console.error("Axios Error joining call:", error.message, error.response?.data);
            toast.error(`Error joining call: ${error.response?.data?.message || error.message}`);
        } else if (error instanceof Error) {
            console.error("General Error joining call:", error.message);
            toast.error(`Could not join the call: ${error.message}. Please try again.`);
        } else {
            console.error("Unknown error joining call:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsConnecting(false);
      }
    };

    // Only run initCall if tokenData has a token, authUser is loaded, and callId is present
    // The `enabled` prop in useQuery handles part of this, but also check in useEffect
    if (tokenData?.token && authUser && callId) {
        initCall();
    }

    // Cleanup function for StreamVideoClient
    return () => {
        // Disconnect client when component unmounts or dependencies change
        if (client) {
            console.log("Disconnecting Stream video client...");
            client.disconnectUser();
        }
    };
  }, [tokenData, authUser, callId, client]); // Add 'client' to dependencies for cleanup to run on client change

  // Loading state handling:
  // - isLoading from useAuthUser (for authUser data)
  // - isConnecting local state (for Stream client initialization)
  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  // Render Stream components only if client and call are initialized
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full"> {/* Use full width/height for video content */}
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-center p-4">
            <p className="text-lg text-error">Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = (): React.JSX.Element | null => { // Can return null if navigate happens
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState(); // This will be typed by Stream SDK

  const navigate = useNavigate(); // This will be typed by react-router-dom

  // If the call has ended (left), navigate away
  if (callingState === CallingState.LEFT) {
    navigate("/");
    return null; // Return null while navigating to prevent rendering issues
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;