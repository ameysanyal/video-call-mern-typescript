import { AxiosError } from 'axios'; // Import AxiosError for consistent error typing
import { ShipWheelIcon } from 'lucide-react';
import React, { useState, type ChangeEvent, type FormEvent } from 'react'; // Explicitly import React and event types
import toast from 'react-hot-toast';
import { Link } from 'react-router';

import { type UserSignupData } from '@/lib/api'; // Import the UserSignupData interface

import useSignUp from '../hooks/UseSignUp.js'; // Ensure this path is correct relative to the file

const SignUpPage = (): React.JSX.Element => {
  // 1. Type the signupData state
  const [signupData, setSignupData] = useState<UserSignupData>({
    fullName: '',
    email: '',
    password: '',
  });

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: signupMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // 2. useSignUp hook provides typed values (assuming it's typed internally)
  // The 'error' returned by useSignUp will be AxiosError | null
  const { isPending, error, signupMutation } = useSignUp();

  // 3. Type the event parameter for handleSignup and onChange
  const handleSignup = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!signupData.email.toLowerCase().endsWith('@streamify.com')) {
      toast.error('Email must end with @streamify.com');
      return;
    }
    signupMutation(signupData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {/* Ensure error is treated as AxiosError to safely access .response.data.message */}
          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <span>
                {(error as AxiosError<{ message: string }>).response?.data?.message ||
                  error.message}
              </span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      name="fullName" // Add name attribute for simpler handleInputChange
                      value={signupData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@streamify.com"
                      className="input input-bordered w-full"
                      name="email" // Add name attribute
                      value={signupData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">Email must end with @streamify.com</p>
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      name="password" // Add name attribute
                      value={signupData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{' '}
                        <span className="text-primary hover:underline">terms of service</span> and{' '}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
