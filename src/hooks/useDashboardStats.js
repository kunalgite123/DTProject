import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const UTILITY_TYPE_COLORS = {
  Water: '#0284C7',
  Electricity: '#EF4444',
  Gas: '#F59E0B',
  Sewage: '#10B981',
  Telecom: '#8B5CF6'
};

const DEFAULT_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });

  const [typeData, setTypeData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [userCounts, setUserCounts] = useState({
    users: 0,
    verifiers: 0,
    admins: 0,
    total: 0
  });
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch utilities for counts, charts, and map preview
      const { data: utilsData, error: utilsError } = await supabase
        .from('utilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (utilsError) throw utilsError;

      const records = utilsData || [];
      setUtilities(records);

      // Compute Stat Counts
      const total = records.length;
      const verified = records.filter(r => (r.status || '').toLowerCase() === 'verified').length;
      const pending = records.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const rejected = records.filter(r => (r.status || '').toLowerCase() === 'rejected').length;

      setStats({
        total,
        verified,
        pending,
        rejected
      });

      // 2. Compute Donut Chart data by Utility Type
      const typeMap = {
        Water: 0,
        Electricity: 0,
        Gas: 0,
        Sewage: 0,
        Telecom: 0
      };

      records.forEach(r => {
        const raw = (r.type || '').toLowerCase();
        if (raw.includes('water') || raw.includes('wtr')) typeMap.Water++;
        else if (raw.includes('elec') || raw.includes('power')) typeMap.Electricity++;
        else if (raw.includes('gas')) typeMap.Gas++;
        else if (raw.includes('sew') || raw.includes('swr')) typeMap.Sewage++;
        else if (raw.includes('tel') || raw.includes('fiber') || raw.includes('fbr')) typeMap.Telecom++;
        else typeMap.Water++;
      });

      const formattedTypeData = Object.entries(typeMap).map(([name, value]) => ({
        name,
        value,
        color: UTILITY_TYPE_COLORS[name] || '#0F5C66'
      }));
      setTypeData(formattedTypeData);

      // 3. Compute Monthly Bar Chart data
      const monthCountMap = {};
      DEFAULT_MONTHS.forEach(m => { monthCountMap[m] = 0; });

      records.forEach(r => {
        const dateStr = r.installed_date || r.created_at;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            if (monthCountMap[monthName] !== undefined) {
              monthCountMap[monthName]++;
            } else {
              monthCountMap[monthName] = 1;
            }
          }
        }
      });

      // Format for recharts
      const formattedMonthly = Object.entries(monthCountMap).map(([month, count]) => ({
        month,
        records: count
      }));
      setMonthlyData(formattedMonthly);

      // 4. Fetch User Counts across role tables
      const [usersRes, verifiersRes, adminsRes] = await Promise.all([
        supabase.from('users_profile').select('id', { count: 'exact' }),
        supabase.from('verifiers').select('id', { count: 'exact' }),
        supabase.from('admins').select('id', { count: 'exact' })
      ]);

      const usersCount = usersRes.count ?? (usersRes.data ? usersRes.data.length : 0);
      const verifiersCount = verifiersRes.count ?? (verifiersRes.data ? verifiersRes.data.length : 0);
      const adminsCount = adminsRes.count ?? (adminsRes.data ? adminsRes.data.length : 0);

      setUserCounts({
        users: usersCount,
        verifiers: verifiersCount,
        admins: adminsCount,
        total: usersCount + verifiersCount + adminsCount
      });

    } catch (err) {
      console.error('[useDashboardStats] Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Supabase Realtime subscription on utilities table
    const channel = supabase
      .channel('admin_dashboard_utilities_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'utilities' },
        (payload) => {
          console.log('[Realtime] Utilities changed:', payload.eventType);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return {
    stats,
    typeData,
    monthlyData,
    userCounts,
    utilities,
    loading,
    error,
    refetch: fetchStats
  };
};
