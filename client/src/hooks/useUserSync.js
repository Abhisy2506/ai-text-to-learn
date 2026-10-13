import { useEffect } from 'react';
import api from '../services/api';

/**
 * Syncs Auth0 profile to MongoDB and fetches the user's remote courses.
 */
export default function useUserSync({
  user,
  isAuthenticated,
  isOnline,
  setCourses,
}) {
  // Sync Auth0 user to MongoDB
  useEffect(() => {
    const syncUserToDatabase = async () => {
      if (isAuthenticated && user && isOnline) {
        try {
          await api.post('/users/sync', {
            auth0Id: user.sub,
            email: user.email,
            name: user.name || '',
            picture: user.picture || '',
          });
          console.log('User synced to MongoDB');
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      }
    };

    syncUserToDatabase();
  }, [isAuthenticated, user, isOnline]);

  // Fetch created courses from MongoDB
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (isAuthenticated && user?.sub && isOnline) {
        try {
          const res = await api.get(`/users/${encodeURIComponent(user.sub)}`);
          const fetchedCourses = res.data?.data?.createdCourses || [];
          setCourses(fetchedCourses);
        } catch (err) {
          console.error('Error fetching remote courses:', err);
        }
      }
    };

    fetchUserCourses();
  }, [isAuthenticated, user, isOnline, setCourses]);
}