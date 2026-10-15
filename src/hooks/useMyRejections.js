import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useMyRejections = (userId) => {
  const [rejections, setRejections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRejections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('utilities')
        .select('*')
        .ilike('status', 'rejected')
        .order('updated_at', { ascending: false });

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error: queryErr } = await query;
      if (queryErr) throw queryErr;

      const items = data || [];
      const formatted = items.map((r) => ({
        id: r.id,
        recordId: r.record_id || r.id?.slice(0, 8) || 'REC-REJ',
        type: r.type,
        location: r.location_text || r.location || 'MIDC, Nashik',
        rejectionReason: r.rejection_reason || 'Survey coordinates require calibration with municipal benchmark.',
        depth: r.depth || '1.0 m',
        description: r.description || '',
        installedDate: r.installed_date || ''
      }));

      setRejections(formatted);
    } catch (err) {
      console.error('[useMyRejections] Error:', err);
      setError(err.message || 'Failed to fetch rejected records');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRejections();

    const channel = supabase
      .channel(`user_rejections_realtime_${userId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        () => {
          fetchRejections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRejections, userId]);

  return {
    rejections,
    loading,
    error,
    refetch: fetchRejections
  };
};
