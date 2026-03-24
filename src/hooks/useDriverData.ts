import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useCurrentTrip() {
  const { driver } = useAuth();

  return useQuery({
    queryKey: ['current-trip', driver?.id],
    enabled: Boolean(driver?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, vehicles(id, plate, brand, model, status)')
        .eq('driver_id', driver!.id)
        .eq('status', 'IN_PROGRESS')
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    }
  });
}

export function useVehicles() {
  const { driver } = useAuth();
  const departmentId = driver?.department_id ?? undefined;

  return useQuery({
    queryKey: ['driver-vehicles', departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      if (!departmentId) {
        throw new Error('Motorista sem departamento vinculado.');
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('department_id', departmentId)
        .order('plate');

      if (error) {
        throw error;
      }

      return data;
    }
  });
}

export function useTripHistory() {
  const { driver } = useAuth();

  return useQuery({
    queryKey: ['trip-history', driver?.id],
    enabled: Boolean(driver?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, destination, start_time, end_time, status, actual_distance_km')
        .eq('driver_id', driver!.id)
        .order('start_time', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return data;
    }
  });
}

export function useRefuelingHistory() {
  const { driver } = useAuth();

  return useQuery({
    queryKey: ['refueling-history', driver?.id],
    enabled: Boolean(driver?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refuelings')
        .select('id, supplier_name, total_cost, liters, created_at')
        .eq('driver_id', driver!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return data;
    }
  });
}
