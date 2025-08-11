import { z } from 'zod';

const sendFriendRequestSchema = {
  params: z.object({
    id: z.string().max(999),
  }),
};

const acceptFriendRequestSchema = {
  params: z.object({
    id: z.string().max(999),
  }),
};

export { sendFriendRequestSchema, acceptFriendRequestSchema };
