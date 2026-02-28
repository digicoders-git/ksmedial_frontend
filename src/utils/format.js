import { BASE_URL } from "../apis/http";

/**
 * Formats an image URL to be absolute, using the backend BASE_URL
 * if the path is relative. 
 */
export const formatImageURL = (path) => {
  if (!path) return "";
  
  // If it's already a full URL (http:// or https://), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Remove leading slash if it exists to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  // BASE_URL already ends with / due to logic in http.js
  // But wait, our BASE_URL has /api/ at the end if we use the fallback.
  // The uploads are usually at /uploads, not /api/uploads.
  
  // Let's get the ROOT URL (without /api)
  const rootURL = BASE_URL.replace(/\/api\/?$/, "");
  const cleanRoot = rootURL.endsWith("/") ? rootURL : `${rootURL}/`;
  
  return `${cleanRoot}${cleanPath}`;
};
