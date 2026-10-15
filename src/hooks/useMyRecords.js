import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useMyRecords = (userId) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('utilities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error: queryErr } = await query;
      if (queryErr) {
        console.warn('[useMyRecords] Notice:', queryErr.message);
        setRecords([]);
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map((item) => {
          const rawType = (item.type || 'water').toLowerCase();
          const type = rawType.charAt(0).toUpperCase() + rawType.slice(1);
          const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';

          return {
            id: item.id,
            recordId: item.record_id || item.id?.slice(0, 8) || 'REC-MY',
            type,
            rawType: item.type,
            location: item.location_text || item.location || 'MIDC, Nashik',
            date: dateStr,
            status: item.status || 'Pending',
            depth: item.depth || '1.0 m',
            description: item.description || '',
            rejectionReason: item.rejection_reason || ''
          };
        });
        setRecords(formatted);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.warn('[useMyRecords] Notice:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecords();

    // Realtime listener on utilities table
    const channel = supabase
      .channel(`user_records_realtime_${userId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecords, userId]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords
  };
};
