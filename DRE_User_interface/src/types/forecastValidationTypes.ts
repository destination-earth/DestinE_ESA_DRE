// Add other API types here if needed

export interface FileValidationResult {
  valid: boolean; // Was the validation successful?
  message?: string; // Optional message (success or error details)
  error?: string; // Optional specific error message (alternative to message)
  file_path?: string | null; // Optional path(s) string (e.g., 'path1|path2' or 'path1')
  guid?: string; // Unique identifier for the request, needed for form submission
  aux?: string; // Optional auxiliary information
}

// Interface for the parameter object expected by useValidateWindFilesMutation hook
export interface ValidateWindFilesParams {
  templateFile: File;
  powerCurveFile?: File | null;
  plan: "oneoff" | "annual"; 
  powerCurveModel: string;
  type?: "train" | "standard"; 
}

// Example Solar Validation Response (adjust based on actual API)
export interface SolarValidationResponse {
  valid: boolean;
  message?: string;
  error?: string;
  file_path?: string; // Example field for validated solar file path
}
