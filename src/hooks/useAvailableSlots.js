import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useAvailableSlots = (practiceId, practitionerId, date) => {
  return useQuery(
    ['availableSlots', practiceId, practitionerId, date],
    () => api.getAvailableSlots(practiceId, practitionerId, date),
    {
      enabled: !!practiceId && !!practitionerId && !!date,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );
};
