import mongoose, { Document, Types } from "mongoose";
import { compareValue, hashValue } from "@/lib/bcrypt.js";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  bio: string;
  profilePic: string;
  nativeLanguage: string;
  learningLanguage: string;
  location: string;
  isOnboarded: boolean;
  friends: (UserDocument | Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

// The Promise itself is a generic type.
// boolean is the type argument provided to the Promise generic type,
// specifying that this particular Promise will resolve to a boolean value.

const userSchema = new mongoose.Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

//Pre-save Middleware for Password Hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await hashValue(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

//Instance Method for Comparing Passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  const isPasswordCorrect = await compareValue(enteredPassword, this.password);
  return isPasswordCorrect;
};

//This is a TypeScript generic type parameter
//UserDocument type enforces TypeScript safety on .save(), .find(), etc.
const User = mongoose.model<UserDocument>("User", userSchema);

export default User;

//mongoose.model() is the core Mongoose function used to compile a schema into a model.

//"User": This is the name of the model. Mongoose will automatically lowercase and pluralize this name to determine the collection name in your MongoDB database.
// So, a model named "User" will correspond to the users collection.

//userSchema: This is the Mongoose Schema object that describes the structure, data types, validations, and behaviors of the documents in the users collection.
