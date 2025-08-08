import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
// Import the 'signup' function and its associated types
import { signup, type UserSignupData, type AuthResponse } from "@/lib/api"; // Adjust path if necessary
import { AxiosError } from '@/lib/axios';

// 1. Define the return type of your custom hook
interface UseSignUpReturn {
  // 'isPending' is a boolean indicating if the mutation is currently running
  isPending: boolean;
  // 'error' will be of type AxiosError or null
  error: AxiosError | null;
  // 'signupMutation' is the mutate function provided by useMutation
  // Its signature is (variables: UserSignupData) => void
  signupMutation: UseMutationResult<AuthResponse, AxiosError, UserSignupData, unknown>['mutate'];
}

const useSignUp = (): UseSignUpReturn => {
  const queryClient = useQueryClient();

  // 2. Specify the generic types for useMutation:
  //    <TData, TError, TVariables, TContext>
  //    - TData: The type of data returned on successful mutation (AuthResponse)
  //    - TError: The type of error (AxiosError)
  //    - TVariables: The type of arguments passed to your mutationFn (UserSignupData)
  //    - TContext: The type of the context object (unknown if not used)
  const {
    mutate, // This is the mutate function, which will be renamed to signupMutation
    isPending,
    error,  // This 'error' will automatically be typed as AxiosError | null
  } = useMutation<AuthResponse, AxiosError, UserSignupData, unknown>({
    mutationFn: signup, // mutationFn: (variables: UserSignupData) => Promise<AuthResponse>
    onSuccess: () => {
      // Invalidate the authUser query to refetch user data after successful signup
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    // You might also add onError, onSettled callbacks here with typed arguments
  });

  // 3. Return the typed object
  return { isPending, error, signupMutation: mutate };
};

export default useSignUp;