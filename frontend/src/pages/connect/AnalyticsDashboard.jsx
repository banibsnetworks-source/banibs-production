import React from 'react';
import ConnectLayout from '../../components/connect/ConnectLayout';
import AnalyticsContent from '../../components/business/AnalyticsContent';

/**
 * AnalyticsDashboard - Connect Layout wrapper for analytics
 * Now uses the shared AnalyticsContent component
 */
const AnalyticsDashboard = () => {
  return (
    <ConnectLayout>
      <AnalyticsContent />
    </ConnectLayout>
  );
};

export default AnalyticsDashboard;
  const navigate = useNavigate();
  const { selectedBusinessProfile, isBusinessMode } = useAccountMode();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (!isBusinessMode || !selectedBusinessProfile) {
      return;
    }
    fetchDashboard();
  }, [dateRange, selectedBusinessProfile, isBusinessMode]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business-analytics/dashboard/${selectedBusinessProfile.id}?date_range=${dateRange}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business-analytics/export/${exportType}/${selectedBusinessProfile.id}?date_range=${dateRange}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!isBusinessMode || !selectedBusinessProfile) {
    return (
      <ConnectLayout>
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Activity className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Switch to Business Mode</h2>
          <p className="text-muted-foreground">
            Business Insights Analytics are only available in Business mode.
          </p>
        </div>
      </ConnectLayout>
    );
  }

  if (loading || !dashboard) {
    return (
      <ConnectLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </ConnectLayout>
    );
  }

  const COLORS = ['#EAB308', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const KPICard = ({ icon: Icon, label, value, change, trend, subtitle }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-yellow-600" />
        {change !== 0 && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '='} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <ConnectLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Insights Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedBusinessProfile.name}</p>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  dateRange === range
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.kpis.profile_views && (
            <KPICard icon={Eye} {...dashboard.kpis.profile_views} />
          )}
          {dashboard.kpis.post_reach && (
            <KPICard icon={TrendingUp} {...dashboard.kpis.post_reach} />
          )}
          {dashboard.kpis.engagements && (
            <KPICard icon={Heart} {...dashboard.kpis.engagements} />
          )}
          {dashboard.kpis.discoveries && (
            <KPICard icon={Target} {...dashboard.kpis.discoveries} />
          )}
          {dashboard.kpis.job_performance && (
            <KPICard icon={Briefcase} {...dashboard.kpis.job_performance} />
          )}
          {dashboard.kpis.rating && (
            <KPICard icon={Star} {...dashboard.kpis.rating} />
          )}
        </div>

        {/* Traffic & Reach */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Traffic & Reach</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.profile_views_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name="Profile Views" stroke="#EAB308" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Posts */}
        {dashboard.top_posts && dashboard.top_posts.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Top Performing Posts</h2>
              <button 
                onClick={() => handleExport('top-posts')}
                className="flex items-center gap-2 text-sm text-yellow-600 hover:underline"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Post</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Impressions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Engagements</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.top_posts.map((post, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm text-foreground">{post.title}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{post.impressions}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{post.engagements}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{post.engagement_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Discovery Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Discovery Sources</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Search', value: dashboard.discovery_breakdown.search },
                    { name: 'Category', value: dashboard.discovery_breakdown.category },
                    { name: 'Directory', value: dashboard.discovery_breakdown.directory },
                    { name: 'Posts', value: dashboard.discovery_breakdown.posts },
                    { name: 'Direct', value: dashboard.discovery_breakdown.direct }
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {dashboard.local_rank_text && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-foreground">{dashboard.local_rank_text}</p>
              </div>
            )}
          </div>

          {/* Jobs Performance */}
          {dashboard.job_performance && dashboard.job_performance.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Job Performance</h2>
                <button 
                  onClick={() => handleExport('jobs')}
                  className="flex items-center gap-2 text-sm text-yellow-600 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <div className="space-y-3">
                {dashboard.job_performance.slice(0, 5).map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.views} views • {job.applications} applications</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{job.apply_rate}%</p>
                      <p className="text-xs text-muted-foreground">apply rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ratings & Reviews */}
        {dashboard.rating_analytics && dashboard.rating_analytics.total_reviews > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Ratings & Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{dashboard.rating_analytics.average_rating.toFixed(1)}</p>
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= dashboard.rating_analytics.average_rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{dashboard.rating_analytics.total_reviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">New this period:</p>
                    <p className="text-2xl font-semibold text-foreground">{dashboard.rating_analytics.new_reviews_period}</p>
                  </div>
                </div>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={[
                    {name: '5★', count: dashboard.rating_analytics.distribution['5']},
                    {name: '4★', count: dashboard.rating_analytics.distribution['4']},
                    {name: '3★', count: dashboard.rating_analytics.distribution['3']},
                    {name: '2★', count: dashboard.rating_analytics.distribution['2']},
                    {name: '1★', count: dashboard.rating_analytics.distribution['1']}
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EAB308" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Activity & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard.activity_log && dashboard.activity_log.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {dashboard.activity_log.map((activity, idx) => (
                  <p key={idx} className="text-sm text-foreground">{activity}</p>
                ))}
              </div>
            </div>
          )}
          
          {dashboard.recommendations && dashboard.recommendations.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recommendations</h2>
              <div className="space-y-3">
                {dashboard.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
};

export default AnalyticsDashboard;
