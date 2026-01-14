import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const usePractitioners = (practiceId) => {
  return useQuery(
    ['practitioners', practiceId],
    () => api.getPractitioners(practiceId),
    {
      enabled: !!practiceId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );
};
