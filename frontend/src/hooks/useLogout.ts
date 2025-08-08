import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
// Import the 'logout' function and AxiosError
import { logout } from "@/lib/api"; // Adjust path if necessary
import { AxiosError } from '@/lib/axios';

// 1. Define the return type of your custom hook
interface UseLogoutReturn {
  // 'logoutMutation' is the mutate function provided by useMutation
  // Its signature is () => void since 'logout' takes no arguments and returns void
  logoutMutation: UseMutationResult<void, AxiosError, void, unknown>['mutate'];
  // 'isPending' is a boolean indicating if the mutation is currently running
  isPending: boolean;
  // 'error' will be of type AxiosError or null
  error: AxiosError | null;
}

const useLogout = (): UseLogoutReturn => {
  const queryClient = useQueryClient();

  // 2. Specify the generic types for useMutation:
  //    <TData, TError, TVariables, TContext>
  //    - TData: The type of data returned on successful mutation (void)
  //    - TError: The type of error (AxiosError)
  //    - TVariables: The type of arguments passed to your mutationFn (void, as logout takes no args)
  //    - TContext: The type of the context object (unknown if not used)
  const {
    mutate: logoutMutation, // Destructure and rename 'mutate' to 'logoutMutation'
    isPending,
    error, // This 'error' will automatically be typed as AxiosError | null
  } = useMutation<void, AxiosError, void, unknown>({
    mutationFn: logout, // mutationFn: () => Promise<void>
    onSuccess: () => {
      // Invalidate the authUser query to clear authentication state
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    // You can also add onError, onSettled callbacks here if needed
  });

  // 3. Return the typed object
  return { logoutMutation, isPending, error };
};

export default useLogout;
