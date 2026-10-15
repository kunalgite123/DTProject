import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest 8 record events joined with utilities
      const { data, error: queryError } = await supabase
        .from('record_events')
        .select(`
          id,
          event,
          note,
          created_at,
          by_user,
          utility_id,
          utilities (
            id,
            record_id,
            type,
            status,
            location_text,
            description
          )
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (queryError) throw queryError;

      if (data && data.length > 0) {
        const formatted = data.map((item) => {
          const util = item.utilities || {};
          const recordId = util.record_id || util.id || (item.utility_id ? item.utility_id.slice(0, 8) : 'REC-UNK');
          const timeAgo = formatTimeAgo(new Date(item.created_at));

          return {
            id: item.id,
            utilityDbId: item.utility_id,
            recordId: recordId,
            action: item.event || 'Updated',
            by: item.note?.includes('by') ? item.note : (item.event === 'Submitted' ? 'Field Engineer' : 'Anil Patel (Admin)'),
            time: timeAgo,
            rawTime: item.created_at,
            status: util.status || 'Pending',
            utilityType: util.type || 'Water',
            description: util.description || ''
          };
        });
        setActivities(formatted);
      } else {
        // Fallback placeholder activity feed if record_events table is empty
        setActivities([
          {
            id: 'ev-1',
            utilityDbId: 'wtr-1',
            recordId: 'WTR-001',
            action: 'Verified',
            by: 'Suresh Sharma (Verifier)',
            time: '10 mins ago',
            status: 'Verified',
            utilityType: 'Water'
          },
          {
            id: 'ev-2',
            utilityDbId: 'gas-1',
            recordId: 'GAS-001',
            action: 'Submitted',
            by: 'Anil Patel (Admin)',
            time: '1 hour ago',
            status: 'Pending',
            utilityType: 'Gas'
          },
          {
            id: 'ev-3',
            utilityDbId: 'ele-1',
            recordId: 'ELE-001',
            action: 'Verified',
            by: 'Suresh Sharma (Verifier)',
            time: '3 hours ago',
            status: 'Verified',
            utilityType: 'Electricity'
          },
          {
            id: 'ev-4',
            utilityDbId: 'fbr-1',
            recordId: 'FBR-001',
            action: 'Needs Review',
            by: 'Municipal GIS Sync',
            time: '5 hours ago',
            status: 'Pending',
            utilityType: 'Telecom'
          },
          {
            id: 'ev-5',
            utilityDbId: 'swr-1',
            recordId: 'SWR-001',
            action: 'Created',
            by: 'Anil Patel (Admin)',
            time: '1 day ago',
            status: 'Pending',
            utilityType: 'Sewage'
          }
        ]);
      }
    } catch (err) {
      console.error('[useRecentActivity] Error:', err);
      setError(err.message || 'Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();

    // Supabase Realtime channel for record_events
    const channel = supabase
      .channel('admin_dashboard_activity_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'record_events' },
        () => {
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivity]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivity
  };
};

function formatTimeAgo(date) {
  if (!date || isNaN(date.getTime())) return 'Recently';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
