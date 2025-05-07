import { RouterProvider } from "@tanstack/react-router";
import AuthProvider from "./services/providers/AuthProvider";
import { router } from "./router";
import { Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import ApiProvider from "./services/providers/ApiProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthInterceptor } from "./hooks/useAuthInterceptor";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

function PrivateApp() {
  const { isAuthenticated, accessToken, handleUnAuthorizedError } = useAuth();
  
  // Register the auth context with the axios interceptor for token refresh
  useAuthInterceptor();
  
  // Initialize assessment data when the app loads
  // const { data: initData, isError, error } = useInitializeAssessment();
  
  // useEffect(() => {
  //   if (initData) {
  //     console.log("Assessment initialized:", initData);
  //   }
    
  //   if (isError) {
  //     console.error("Failed to initialize assessment:", error);
  //   }
  // }, [initData, isError, error]);
  
  return (
    <ApiProvider
      accessToken={accessToken}
      onUnauthorisedError={handleUnAuthorizedError}
    >
      <RouterProvider router={router} context={{ isAuthenticated }} />
    </ApiProvider>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PrivateApp />
        </AuthProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

export default App;
