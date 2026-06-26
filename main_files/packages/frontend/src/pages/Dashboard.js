import React, { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';
import AiDigestPanel from '../components/AiDigestPanel';
import ActivityFeed from '../components/ActivityFeed';
import InsightsPanel from '../components/InsightsPanel';
import BottomCommandBar from '../components/BottomCommandBar';

const Dashboard = ({ onNavigate, user }) => {
  const [data, setData] = useState({
    activity: [],
    digest: null,
    insights: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('gitspeak_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [activityRes, digestRes, insightsRes] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard/activity', { headers }),
          fetch('http://localhost:4000/api/dashboard/digest', { headers }),
          fetch('http://localhost:4000/api/dashboard/insights', { headers })
        ]);

        const activityData = await activityRes.json();
        const digestData = await digestRes.json();
        const insightsData = await insightsRes.json();

        setData({
          activity: activityData.activities || [],
          digest: digestData.digest || null,
          insights: insightsData.insights || null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] selection:bg-white/10">
      <TopNavBar onNavigate={onNavigate} currentPage="dashboard" user={user} />
      <main className="pt-12 px-lg pb-32 max-w-[1440px] mx-auto">
        {loading ? (
          <div className="text-[#8B949E] text-center mt-10">Loading dashboard...</div>
        ) : (
          <>
            <AiDigestPanel digest={data.digest} />
            <div className="grid grid-cols-12 gap-lg items-start">
              <div className="col-span-12 lg:col-span-8 space-y-xs">
                <ActivityFeed activities={data.activity} />
              </div>
              <div className="col-span-12 lg:col-span-4 space-y-lg">
                <InsightsPanel insights={data.insights} />
              </div>
            </div>
          </>
        )}
      </main>
      <BottomCommandBar />
    </div>
  );
};

export default Dashboard;
