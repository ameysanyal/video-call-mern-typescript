import React, { useEffect, useState } from 'react'; // Explicitly import React
import { useParams } from 'react-router';
import useAuthUser from '@/hooks/useAuthUser'; // Assuming this is already typed
import { useQuery } from '@tanstack/react-query';
import { getStreamToken, type StreamTokenResponse } from '@/lib/api';
import axios, { AxiosError } from 'axios';

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  // You might also need to import specific types from 'stream-chat-react'
  // For instance, if you interact with StreamChat in a way that requires their types for Channel
} from 'stream-chat-react';
import {
  StreamChat,
  Channel as StreamChannel, // Alias Channel type from stream-chat to avoid conflict
  type User as StreamChatUser, // Alias User type from stream-chat
} from 'stream-chat';
import toast from 'react-hot-toast';

import ChatLoader from '@/components/ChatLoader'; // Assuming this is already typed
import CallButton from '@/components/CallButton'; // Assuming this is already typed

const STREAM_API_KEY: string = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = (): React.JSX.Element => {
  // Use useParams with a generic type to specify expected params
  const { id: targetUserId } = useParams<{ id: string }>(); // 'id' will be typed as string

  // console.log('STREAM_API_KEY', STREAM_API_KEY);
  // Type useState hooks with specific Stream SDK types or null/undefined
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null); // Use StreamChannel from 'stream-chat'
  const [loading, setLoading] = useState<boolean>(true);

  const { authUser } = useAuthUser(); // useAuthUser returns { authUser: AuthUser | null | undefined, ... }

  // console.log('authUser', authUser);

  // Type useQuery for getStreamToken
  const { data: tokenData } = useQuery<StreamTokenResponse, AxiosError>({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser, // Only run query if authUser exists
  });
  // console.log('tokendata', tokenData);

  useEffect(() => {
    const initChat = async () => {
      console.log('User ID:', authUser?._id);
      console.log('Stream Token:', tokenData?.data);
      console.log('Stream API Key (frontend):', STREAM_API_KEY);
      // Ensure all necessary data is available and typed correctly
      if (!tokenData?.data || !authUser || !targetUserId) {
        console.log('Missing data for chat initialization', { tokenData, authUser, targetUserId });
        setLoading(false); // Stop loading if essential data is missing
        return;
      }

      try {
        console.log('Initializing Stream chat client...');

        // Ensure the client is a new instance for each connection
        const client = StreamChat.getInstance(STREAM_API_KEY);

        console.log('client', client);

        // Map your AuthUser to StreamChat's User type
        const user: StreamChatUser = {
          id: authUser._id,
          name: authUser.fullName || authUser.email, // Fallback for name if fullName is missing
          image: authUser.profilePic,
        };

        await client.connectUser(
          user, // StreamChatUser object
          tokenData.data
        );

        // Sort members to ensure consistent channel ID regardless of who initiates
        const members = [authUser._id, targetUserId].sort();
        const channelId = members.join('-');

        // Get or create the channel
        const currChannel = client.channel('messaging', channelId, {
          members: members,
        });

        await currChannel.watch(); // Watch the channel for real-time updates

        setChatClient(client);
        setChannel(currChannel);
      } catch (error: unknown) {
        // Type 'error' as unknown for safety
        if (axios.isAxiosError(error)) {
          // Check if it's an Axios error
          console.error('Axios Error initializing chat:', error.message, error.response?.data);
          toast.error(`Error connecting: ${error.response?.data?.message || error.message}`);
        } else if (error instanceof Error) {
          console.error('General Error initializing chat:', error.message);
          toast.error(`Could not connect to chat: ${error.message}. Please try again.`);
        } else {
          console.error('Unknown Error initializing chat:', error);
          toast.error('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only run initChat if tokenData has a token, authUser is loaded, and targetUserId is present
    if (tokenData?.data && authUser && targetUserId) {
      initChat();
    }

    // Cleanup function: disconnect the client when the component unmounts or dependencies change
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
        console.log('Disconnected Stream chat client.');
      }
    };
  }, [tokenData, authUser, targetUserId, chatClient]); // Add chatClient to dependencies for proper cleanup

  const handleVideoCall = (): void => {
    if (channel) {
      // Construct the call URL dynamically
      const callUrl = `${window.location.origin}/call/${channel.id}`; // Assuming channel.id is suitable for callId

      // Send a message with the video call link
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success('Video call link sent successfully!');
    } else {
      toast.error('Chat channel not ready for a video call.');
    }
  };

  // Render ChatLoader while connecting or if client/channel are not ready
  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full">
            {' '}
            {/* Ensure height for Window to fill */}
            {/* Pass the typed handleVideoCall function */}
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
