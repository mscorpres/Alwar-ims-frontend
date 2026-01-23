/**
 * Configuration utility for managing API base URL
 */

const STORAGE_KEY = "currentUrl";
const DEFAULT_URL_KEY = "defaultApiUrl";

/**
 * Get the current API base URL from localStorage or environment variable
 */
export const getApiBaseUrl = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) ||
    import.meta.env.VITE_REACT_APP_API_BASE_URL ||
    ""
  );
};

/**
 * Set the API base URL in localStorage
 */
export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY, url);
};

/**
 * Get the default API URL from environment variable
 */
export const getDefaultApiUrl = (): string => {
  return import.meta.env.VITE_REACT_APP_API_BASE_URL || "";
};

/**
 * Reset the API base URL to the default (from environment)
 */
export const resetApiBaseUrl = (): void => {
  const defaultUrl = getDefaultApiUrl();
  if (defaultUrl) {
    localStorage.setItem(STORAGE_KEY, defaultUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * Get all saved URLs from localStorage
 */
export const getSavedUrls = (): string[] => {
  const saved = localStorage.getItem("baseUrls");
  return saved ? JSON.parse(saved) : [];
};

/**
 * Save a new URL to the list of saved URLs
 */
export const saveUrl = (url: string): void => {
  const saved = getSavedUrls();
  if (!saved.includes(url)) {
    saved.push(url);
    localStorage.setItem("baseUrls", JSON.stringify(saved));
  }
};
