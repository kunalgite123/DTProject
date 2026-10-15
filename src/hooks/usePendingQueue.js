import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePendingQueue = () => {
  const [pendingQueue, setPendingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending records ordered by created_at ascending (oldest first)
      const { data, error: fetchErr } = await supabase
        .from('utilities')
        .select('*')
        .ilike('status', 'pending')
        .order('created_at', { ascending: true });

      if (fetchErr) throw fetchErr;

      const records = data || [];
      const now = new Date();

      const formatted = records.map((item) => {
        const createdAt = item.created_at ? new Date(item.created_at) : new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const ageDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const ageHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

        const ageText = ageDays > 0 ? `${ageDays} ${ageDays === 1 ? 'day' : 'days'}` : `${ageHours}h`;
        const isOverdue = ageDays >= 3;

        const rawType = (item.type || 'water').toLowerCase();
        const formattedType = rawType.charAt(0).toUpperCase() + rawType.slice(1);

        return {
          id: item.id,
          recordId: item.record_id || item.id?.slice(0, 8) || 'REC-PEND',
          type: formattedType,
          rawType: item.type,
          location: item.location_text || item.location || 'MIDC, Nashik',
          submittedBy: item.owner || 'A. Patel (Admin)',
          submittedDate: createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          ageDays,
          ageText,
          isOverdue,
          depth: item.depth || '1.0 m',
          source: item.source || 'Department Survey',
          description: item.description || ''
        };
      });

      // If database has 0 pending items, provide default sample pending items
      if (formatted.length === 0) {
        setPendingQueue([
          {
            id: 'GAS-001',
            recordId: 'GAS-001',
            type: 'Gas',
            location: 'MIDC, Nashik',
            submittedBy: 'A. Patel (Admin)',
            submittedDate: '03 Oct 2026',
            ageDays: 6,
            ageText: '6 days',
            isOverdue: true,
            depth: '0.9 m',
            source: 'Department plan'
          },
          {
            id: 'ELE-003',
            recordId: 'ELE-003',
            type: 'Electricity',
            location: 'MIDC Sector 2, Nashik',
            submittedBy: 'A. Patel (Admin)',
            submittedDate: '05 Oct 2026',
            ageDays: 4,
            ageText: '4 days',
            isOverdue: true,
            depth: '0.8 m',
            source: 'Field survey'
          },
          {
            id: 'WTR-004',
            recordId: 'WTR-004',
            type: 'Water',
            location: 'Satpur Industrial Area',
            submittedBy: 'Ramesh Deshmukh',
            submittedDate: '08 Oct 2026',
            ageDays: 1,
            ageText: '1 day',
            isOverdue: false,
            depth: '1.2 m',
            source: 'Municipal Pipeline CAD'
          }
        ]);
      } else {
        setPendingQueue(formatted);
      }
    } catch (err) {
      console.error('[usePendingQueue] Error:', err);
      setError(err.message || 'Failed to fetch pending queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQueue();

    // Supabase Realtime subscription on utilities
    const channel = supabase
      .channel('verifier_pending_queue_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        (payload) => {
          console.log('[Realtime Pending Queue Update]:', payload.eventType);
          fetchPendingQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingQueue]);

  return {
    pendingQueue,
    loading,
    error,
    refetch: fetchPendingQueue
  };
};
