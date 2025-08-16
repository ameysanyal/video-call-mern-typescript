import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router';
import {
  StreamChat,
  type Channel as StreamChannel,
  type User as StreamChatUser,
} from 'stream-chat';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';

import CallButton from '@/components/CallButton';
import ChatLoader from '@/components/ChatLoader';
import useAuthUser from '@/hooks/useAuthUser';
import { getStreamToken, type StreamTokenResponse } from '@/lib/api';

const STREAM_API_KEY: string = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = (): React.JSX.Element => {
  const { id: targetUserId } = useParams<{ id: string }>();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  const {
    data: tokenData,
    isSuccess,
    isError,
    isLoading,
    error,
  } = useQuery<StreamTokenResponse>({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Handle chat initialization on-demand when token is ready
  if (isSuccess && authUser && !chatClient && !channel && targetUserId) {
    const client = StreamChat.getInstance(STREAM_API_KEY);

    const user: StreamChatUser = {
      id: authUser._id,
      name: authUser.fullName || authUser.email,
      image: authUser.profilePic,
    };

    client
      .connectUser(user, tokenData.data)
      .then(() => {
        const members = [authUser._id, targetUserId].sort();
        const channelId = members.join('-');

        const currChannel = client.channel('messaging', channelId, {
          members,
        });

        return currChannel.watch().then(() => {
          setChatClient(client);
          setChannel(currChannel);
        });
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          toast.error(`Error connecting: ${err.response?.data?.message || err.message}`);
        } else if (err instanceof Error) {
          toast.error(`Could not connect to chat: ${err.message}`);
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      });
  }

  const handleVideoCall = (): void => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success('Video call link sent successfully!');
    } else {
      toast.error('Chat channel not ready for a video call.');
    }
  };

  // Error state
  if (isError) {
    toast.error(`Failed to fetch token: ${(error as Error).message}`);
    return <div className="p-4 text-red-600">Error loading chat. Please refresh.</div>;
  }

  // Loading state
  if (isLoading || !authUser || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full">
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
