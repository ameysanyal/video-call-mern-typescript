import { useQuery } from '@tanstack/react-query';

// Import getAuthUser and the AuthUser interface (and AxiosError for error typing)
import { getAuthUser, type AuthUser } from '@/lib/api';
import { AxiosError } from '@/lib/axios';

// 1. Define the return type of your custom hook
type UseAuthUserReturn = {
  isLoading: boolean;
  authUser: AuthUser | null | undefined; // authUser.data can be AuthUser | null, and useQuery's data can be undefined initially
};

const useAuthUser = (): UseAuthUserReturn => {
  // 2. Specify the generic types for useQuery:
  //    <TData, TError, TSelectedData>
  //    - TData: The type of data returned by queryFn (AuthUser | null)
  //    - TError: The type of error (AxiosError in our case)
  //    - TSelectedData: The type after any 'select' transformation (not used here for data transformation, but useful for hook's direct return type)
  const { isLoading, data } = useQuery<AuthUser | null, AxiosError>({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
    retry: false, // auth check
  });

  // 3. Return the typed object
  return {
    isLoading: isLoading, // isLoading is already boolean
    authUser: data, // data is already AuthUser | null | undefined by react-query
  };
};

export default useAuthUser;
