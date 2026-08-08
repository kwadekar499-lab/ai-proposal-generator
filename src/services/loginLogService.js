import { insforge } from '../lib/insforge.js';

function detectBrowserAndDevice() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js Test Environment';
  let browser = 'Unknown Browser';
  let device = 'Desktop';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = 'Mobile / Tablet';
  }

  return { browser, device };
}

export const loginLogService = {
  async recordLogin(userId) {
    if (!userId) return;
    const now = new Date().toISOString();
    const { browser, device } = detectBrowserAndDevice();

    try {
      // 1. Insert record into login_logs
      await insforge.database.from('login_logs').insert([{
        user_id: userId,
        login_time: now,
        browser,
        device
      }]);

      // 2. Update profiles.last_login
      await insforge.database.from('profiles')
        .update({ last_login: now })
        .eq('id', userId);
    } catch (err) {
      console.error('Failed to log user login session:', err);
    }
  },

  async getAdminAnalytics() {
    // 1. Fetch recent login logs
    const { data: logs, error: logsErr } = await insforge.database
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsErr) throw logsErr;

    // 2. Fetch profiles for user mapping
    const { data: profiles } = await insforge.database
      .from('profiles')
      .select('id, name, email');

    const profileMap = (profiles || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    const allLogs = logs || [];

    // Calculate Today stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = allLogs.filter(l => (l.created_at || l.login_time || '').startsWith(todayStr));

    const totalLoginsToday = todayLogs.length;
    const dau = new Set(todayLogs.map(l => l.user_id)).size;

    // Last 20 logins with mapped user info
    const last20Logins = allLogs.slice(0, 20).map(l => ({
      ...l,
      userName: profileMap[l.user_id]?.name || 'Registered User',
      userEmail: profileMap[l.user_id]?.email || l.user_id || 'User'
    }));

    // Generate 7-day trend chart data
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[dateStr] = { dateStr, label, count: 0 };
    }

    allLogs.forEach(l => {
      const dStr = (l.created_at || l.login_time || '').split('T')[0];
      if (daysMap[dStr]) {
        daysMap[dStr].count += 1;
      }
    });

    const trendData = Object.values(daysMap);

    return {
      totalLoginsToday,
      dau,
      last20Logins,
      trendData
    };
  }
};
