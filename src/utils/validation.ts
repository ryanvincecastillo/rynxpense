export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const getErrorMessage = (error: any): string => {
  return error?.response?.data?.message || 
         error?.message || 
         'An unexpected error occurred';
};

export const truncateText = (text: string, maxLength: number = 10): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};