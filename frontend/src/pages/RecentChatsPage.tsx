import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { MessageCircle, Clock, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { StreamChat, type User as StreamChatUser } from 'stream-chat';

import PageLoader from '@/components/PageLoader';
import useAuthUser from '@/hooks/useAuthUser';
import { getStreamToken, type StreamTokenResponse } from '@/lib/api';

const STREAM_API_KEY: string = import.meta.env.VITE_STREAM_API_KEY;

type RecentChat = {
  id: string;
  lastMessage?: {
    text: string;
    created_at: string;
    user: {
      id: string;
      name: string;
    };
  };
  memberCount: number;
  members: Record<string, any>;
  otherMemberId: string;
  otherMemberData: any;
  created_at: string;
  updated_at: string;
};

const RecentChatsPage = (): React.JSX.Element => {
  const { authUser } = useAuthUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  const {
    data: tokenData,
    isSuccess,
    isError,
    isLoading,
    error,
  } = useQuery<StreamTokenResponse, AxiosError>({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let isMounted = true;

    const connectAndFetch = async () => {
      if (!authUser || !isSuccess || chatClient || !tokenData?.data) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        const user: StreamChatUser = {
          id: authUser._id,
          name: authUser.fullName || authUser.email,
          image: authUser.profilePic,
        };

        await client.connectUser(user, tokenData.data);

        const filter = { members: { $in: [authUser._id] } };
        const sort = [{ last_message_at: -1 }];
        const options = { limit: 20 };

        const channels = await client.queryChannels(filter, sort, options);

        // Get all unique user IDs from all channels
        const allUserIds = new Set<string>();
        channels.forEach((channel) => {
          Object.keys(channel.state.members).forEach((memberId) => {
            if (memberId !== authUser._id) {
              allUserIds.add(memberId);
            }
          });
        });

        // Fetch user data for all members
        const userData: Record<string, any> = {};
        if (allUserIds.size > 0) {
          try {
            const usersResponse = await client.queryUsers(
              { id: { $in: Array.from(allUserIds) } },
              { id: 1 }
            );
            usersResponse.users.forEach((user: any) => {
              userData[user.id] = user;
            });
          } catch (error) {
            toast.error('An unexpected error occurred. Please try again.' + error);
          }
        }

        const transformedChats: RecentChat[] = channels.map((channel) => {
          // Extract the other member ID from channel ID (format: user1-user2)
          const memberIds = channel.id!.split('-');
          const otherMemberId = memberIds.find((id) => id !== authUser._id);

          return {
            id: channel.id!,
            lastMessage: channel.state.latestMessages?.[0]
              ? {
                  text: channel.state.latestMessages[0].text || '',
                  created_at: channel.state.latestMessages[0].created_at?.toISOString() || '',
                  user: {
                    id: channel.state.latestMessages[0].user?.id || '',
                    name: channel.state.latestMessages[0].user?.name || '',
                  },
                }
              : undefined,
            memberCount: Object.keys(channel.state.members).length,
            members: channel.state.members,
            otherMemberId: otherMemberId || '',
            otherMemberData: otherMemberId ? userData[otherMemberId] : null,
            created_at: channel.cid || '',
            updated_at: channel.cid || '',
          };
        });

        if (isMounted) {
          setChatClient(client);
          setRecentChats(transformedChats);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(`Connection error: ${err.response?.data?.message || err.message}`);
        } else if (err instanceof Error) {
          toast.error(`Failed to load chats: ${err.message}`);
        } else {
          toast.error('Unexpected error occurred');
        }
      }
    };

    connectAndFetch();

    return () => {
      isMounted = false;
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [authUser, isSuccess, tokenData?.data]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherMemberName = (chat: RecentChat): string => {
    if (chat.otherMemberData) {
      return chat.otherMemberData.name || chat.otherMemberData.fullName || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getOtherMemberImage = (chat: RecentChat): string => {
    if (chat.otherMemberData) {
      return chat.otherMemberData.image || chat.otherMemberData.profilePic || '';
    }
    return '';
  };

  if (isLoading || !authUser || !isSuccess || !chatClient) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">Error fetching token: {(error as AxiosError).message}</div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Recent Chats</h1>
          <p className="text-base-content/70">Your recent conversations and messages</p>
        </div>

        {recentChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-base-content/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recent chats</h3>
            <p className="text-base-content/70 mb-4">
              Start a conversation with your friends to see them here
            </p>
            <Link to="/" className="btn btn-primary">
              Find Friends
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id.split('-').find((id) => id !== authUser._id) || chat.id}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center">
                        {getOtherMemberImage(chat) ? (
                          <img
                            src={getOtherMemberImage(chat)}
                            alt={getOtherMemberName(chat)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-base-content/50" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{getOtherMemberName(chat)}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-base-content/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(chat.lastMessage.created_at)}
                          </span>
                        )}
                      </div>

                      {chat.lastMessage ? (
                        <p className="text-sm text-base-content/70 truncate">
                          <span className="font-medium">
                            {chat.lastMessage.user.id === authUser._id ? 'You: ' : ''}
                          </span>
                          {chat.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-base-content/50 italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RecentChatsPage;
