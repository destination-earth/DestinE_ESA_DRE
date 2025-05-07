// Mock API configuration
export const ENABLE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false;

// Optional: Add more granular control
export const mockConfig = {
  enableMockAPI: ENABLE_MOCK_API,
  simulateNetworkDelay: true,
  networkDelayMs: 800, // Simulate realistic network delay
  simulateErrors: false, // Occasionally return errors to test error handling
  errorRate: 0.1, // 10% of requests will fail if simulateErrors is true
};

// Helper function to simulate network delay
export const simulateNetworkDelay = async (): Promise<void> => {
  if (mockConfig.simulateNetworkDelay) {
    await new Promise(resolve => setTimeout(resolve, mockConfig.networkDelayMs));
  }
};

// Helper to determine if an error should be simulated
export const shouldSimulateError = (): boolean => {
  return mockConfig.simulateErrors && Math.random() < mockConfig.errorRate;
};

// Log mock API usage
export const logMockApiUsage = (functionName: string): void => {
  if (import.meta.env.DEV) {
    console.debug(`[MOCK API] Using mock implementation of ${functionName}`);
  }
};
