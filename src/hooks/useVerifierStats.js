import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useVerifierStats = (verifierId) => {
  const [stats, setStats] = useState({
    awaiting: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalVerified: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVerifierStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Start of today in ISO
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      // Fetch all utilities
      const { data: utilities, error: fetchError } = await supabase
        .from('utilities')
        .select('id, status, updated_at, verified_by, created_at');

      if (fetchError) throw fetchError;

      const records = utilities || [];

      // Awaiting: all Pending records
      const awaiting = records.filter(r => (r.status || '').toLowerCase() === 'pending').length;

      // Total Verified: all Verified records
      const totalVerified = records.filter(r => (r.status || '').toLowerCase() === 'verified').length;

      // Approved Today (status = Verified & updated today)
      const approvedToday = records.filter(r => {
        const isVerified = (r.status || '').toLowerCase() === 'verified';
        const isToday = r.updated_at && new Date(r.updated_at) >= todayStart;
        const isMyDecision = verifierId ? (r.verified_by === verifierId || !r.verified_by) : true;
        return isVerified && isToday && isMyDecision;
      }).length;

      // Rejected Today (status = Rejected & updated today)
      const rejectedToday = records.filter(r => {
        const isRejected = (r.status || '').toLowerCase() === 'rejected';
        const isToday = r.updated_at && new Date(r.updated_at) >= todayStart;
        const isMyDecision = verifierId ? (r.verified_by === verifierId || !r.verified_by) : true;
        return isRejected && isToday && isMyDecision;
      }).length;

      setStats({
        awaiting,
        approvedToday,
        rejectedToday,
        totalVerified
      });

      // Compute last 7 days chart trend (Approved vs Rejected)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = d.toISOString().split('T')[0];

        // Match records updated on that date
        const dayApproved = records.filter(r => {
          const isVer = (r.status || '').toLowerCase() === 'verified';
          const rDate = (r.updated_at || r.created_at || '').split('T')[0];
          return isVer && rDate === dateString;
        }).length;

        const dayRejected = records.filter(r => {
          const isRej = (r.status || '').toLowerCase() === 'rejected';
          const rDate = (r.updated_at || r.created_at || '').split('T')[0];
          return isRej && rDate === dateString;
        }).length;

        days.push({
          day: dayLabel,
          Approved: dayApproved,
          Rejected: dayRejected
        });
      }

      setTrendData(days);

    } catch (err) {
      console.error('[useVerifierStats] Error:', err);
      setError(err.message || 'Failed to fetch verifier stats');
    } finally {
      setLoading(false);
    }
  }, [verifierId]);

  useEffect(() => {
    fetchVerifierStats();

    // Supabase Realtime subscription on utilities
    const channel = supabase
      .channel('verifier_stats_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        () => {
          fetchVerifierStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVerifierStats]);

  return {
    stats,
    trendData,
    loading,
    error,
    refetch: fetchVerifierStats
  };
};
