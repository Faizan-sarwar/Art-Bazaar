import { useState, useEffect } from 'react';

const BASE_URL  = 'http://localhost:5000';

export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}${img}`;
};

export const useUser = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    // Listen for storage changes (when profile is saved)
    const handleStorage = () => {
      try {
        const updated = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(updated);
      } catch {
        setUser({});
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('userUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userUpdated', handleStorage);
    };
  }, []);

  return user;
};