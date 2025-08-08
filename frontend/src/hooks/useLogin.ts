// Note = import type is the way to specifically import only the type information (whether it's from an interface or a type alias) 
// and ensure it's handled correctly by verbatimModuleSyntax
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { login, type UserLoginData, type AuthResponse} from "@/lib/api"; // Adjust path if necessary
import { AxiosError } from '@/lib/axios';


interface UseLoginReturn {
 
  error: AxiosError | null;
 
  isPending: boolean;
  // 'loginMutation' is the mutate function provided by useMutation
  // Its signature is (variables: TVariables) => void
  loginMutation: UseMutationResult<AuthResponse, AxiosError, UserLoginData, unknown>['mutate'];
  // Alternatively, you could just return the whole mutate object if you need more properties:
  // mutate: UseMutationResult<AuthResponse, AxiosError, UserLoginData, unknown>;
}

const useLogin = (): UseLoginReturn => {
  const queryClient = useQueryClient();

  // 2. Specify the generic types for useMutation:
  //    <TData, TError, TVariables, TContext>
  //    - TData: The type of data returned on successful mutation (AuthResponse)
  //    - TError: The type of error (AxiosError)
  //    - TVariables: The type of arguments passed to your mutationFn (UserLoginData)
  //    - TContext: The type of the context object (usually 'unknown' if not used)
  const {
    mutate,
    isPending,
    error // This 'error' will automatically be typed as AxiosError | null
  } = useMutation<AuthResponse, AxiosError, UserLoginData, unknown>({
    mutationFn: login, // mutationFn: (variables: UserLoginData) => Promise<AuthResponse>
    onSuccess: () => {
      // Invalidate the authUser query so it refetches when the user logs in successfully
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    // You might also add onError, onSettled callbacks here with typed arguments
  });

  // 3. Return the typed object
  return { error, isPending, loginMutation: mutate };
};

export default useLogin;