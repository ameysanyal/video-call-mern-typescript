import { StreamChat, UserResponse } from "stream-chat";
import { Env } from "../config/env.config.js";

// This imports the StreamChat class from the Stream Chat SDK.
// StreamChat provides methods to interact with the Stream Chat API
// (e.g., creating users, generating tokens, sending messages).
//UserResponse: it is type which Represents a complete user object returned by Stream.

const apiKey = Env.STREAM_API_KEY;
const apiSecret = Env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

// This creates a Stream Chat client instance using the provided API key and secret.
// This client is used to interact with Stream's backend (e.g., to manage users, generate tokens).
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// upsertStreamUser is used to create or update one or more users in Stream.
// It accepts an array of users (here, just one user).

//When you see Partial<UserResponse> in TypeScript, 
// it means that the userData object is expected to be an object where all properties of UserResponse are optional.
// partial is used because upsert means update or insert
export const upsertStreamUser = async (
  userData: Partial<UserResponse>
): Promise<Partial<UserResponse> | undefined> => {
  try {
    if (!userData.id) {
      throw new Error("User 'id' is required for upserting Stream user.");
    }
    await streamClient.upsertUsers([userData as UserResponse]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

// generateStreamToken is used to generate a Stream chat token for a given user.
export const generateStreamToken = (userId: string) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};


//Note:- Partial<Type> (Utility Type): Partial is a built-in TypeScript utility type. 
//It takes another type Type as an argument and constructs a new type where all properties of Type are made optional.