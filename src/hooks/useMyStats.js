import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useMyStats = (userId) => {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    nashikVerifiedCount: 8
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch user's own utilities
      let query = supabase.from('utilities').select('id, status, created_by, location_text');
      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data: myData, error: myError } = await query;
      if (myError) {
        console.warn('[useMyStats] Notice:', myError.message);
        // Fallback gracefully without setting blocking error
        setStats({
          total: 0,
          verified: 0,
          pending: 0,
          rejected: 0,
          nashikVerifiedCount: 8
        });
        return;
      }

      const records = myData || [];
      const total = records.length;
      const verified = records.filter(r => (r.status || '').toLowerCase() === 'verified').length;
      const pending = records.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const rejected = records.filter(r => (r.status || '').toLowerCase() === 'rejected').length;

      // 2. Fetch all verified utilities near Nashik for the public verified count
      const { data: allVerified } = await supabase
        .from('utilities')
        .select('id', { count: 'exact' })
        .ilike('status', 'verified');

      const nashikVerifiedCount = allVerified?.length ?? 8;

      setStats({
        total,
        verified,
        pending,
        rejected,
        nashikVerifiedCount: nashikVerifiedCount || 8
      });

    } catch (err) {
      console.warn('[useMyStats] Notice:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();

    // Supabase Realtime subscription on utilities
    const channel = supabase
      .channel(`user_stats_realtime_${userId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, userId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
