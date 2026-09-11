import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OverviewView from './components/OverviewView';
import ActionItemsView from './components/ActionItemsView';
import AnalyticsView from './components/AnalyticsView';
import SubscriptionsView from './components/SubscriptionsView';
import EmailsView from './components/EmailsView';
import AskGmailView from './components/AskGmailView';
import CostDashboardView from './components/CostDashboardView';

const API_BASE = 'http://localhost:8001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [digest, setDigest] = useState(null);
  const [actions, setActions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [senders, setSenders] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState(null);

  // Cost Dashboard states
  const [costOverview, setCostOverview] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [costTimeline, setCostTimeline] = useState([]);
  const [costRecommendations, setCostRecommendations] = useState([]);
  const [gcpUsage, setGcpUsage] = useState(null);
  
  // Emails view states
  const [emailsData, setEmailsData] = useState({ total: 0, items: [] });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Ask Gmail states
  const [answerData, setAnswerData] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload emails on search or category filter change
  useEffect(() => {
    loadEmails(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const loadAllData = async () => {
    try {
      // 1. Sync & Status
      const statusRes = await fetch(`${API_BASE}/sync/status`);
      if (statusRes.ok) setSyncStatus(await statusRes.json());

      // 2. Overview stats
      const statsRes = await fetch(`${API_BASE}/analytics/overview`);
      if (statsRes.ok) setStats(await statsRes.json());

      // 3. AI Digest
      const digestRes = await fetch(`${API_BASE}/insights/digest`);
      if (digestRes.ok) setDigest(await digestRes.json());

      // 4. Action items
      const actionsRes = await fetch(`${API_BASE}/insights/actions?status=all`);
      if (actionsRes.ok) setActions(await actionsRes.json());

      // 5. Analytics data
      const trendsRes = await fetch(`${API_BASE}/analytics/trends`);
      if (trendsRes.ok) setTrends(await trendsRes.json());

      const catsRes = await fetch(`${API_BASE}/analytics/categories`);
      if (catsRes.ok) setCategories(await catsRes.json());

      const sendersRes = await fetch(`${API_BASE}/analytics/top-senders`);
      if (sendersRes.ok) setSenders(await sendersRes.json());

      // 6. Subscriptions
      const subsRes = await fetch(`${API_BASE}/insights/subscriptions`);
      if (subsRes.ok) setSubscriptionsData(await subsRes.json());

      // 7. Cost Intelligence Overview, Breakdown & Usage
      try {
        const [cOverRes, cBreakRes, cTimeRes, cRecRes, cGcpRes] = await Promise.all([
          fetch(`${API_BASE}/costs/overview`),
          fetch(`${API_BASE}/costs/breakdown`),
          fetch(`${API_BASE}/costs/timeline`),
          fetch(`${API_BASE}/costs/recommendations`),
          fetch(`${API_BASE}/costs/gcp-usage`)
        ]);
        if (cOverRes.ok) setCostOverview(await cOverRes.json());
        if (cBreakRes.ok) setCostBreakdown(await cBreakRes.json());
        if (cTimeRes.ok) setCostTimeline(await cTimeRes.json());
        if (cRecRes.ok) setCostRecommendations(await cRecRes.json());
        if (cGcpRes.ok) setGcpUsage(await cGcpRes.json());
      } catch (cErr) {
        console.warn("Cost Intelligence endpoints unavailable:", cErr);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const loadEmails = async (cat, query) => {
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'All') params.append('category', cat);
      if (query) params.append('search', query);

      const res = await fetch(`${API_BASE}/emails/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmailsData(data);
      }
    } catch (err) {
      console.error("Failed to load emails list:", err);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync/trigger`, { method: 'POST' });
      if (res.ok) {
        await loadAllData();
        await loadEmails(selectedCategory, searchQuery);
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncGmailToDrive = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync/sync-gmail-drive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 3, max_results: 50 }),
      });
      if (res.ok) {
        await loadAllData();
        await loadEmails(selectedCategory, searchQuery);
      }
    } catch (err) {
      console.error("Sync to Drive failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleAction = async (itemId) => {
    try {
      const target = actions.find(a => a.item_id === itemId);
      const newStatus = target?.status === 'completed' ? 'pending' : 'completed';

      const res = await fetch(`${API_BASE}/insights/actions/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setActions(actions.map(a => a.item_id === itemId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error("Failed to toggle action item:", err);
    }
  };

  const handleSelectEmail = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE}/emails/${messageId}`);
      if (res.ok) setSelectedEmail(await res.json());
    } catch (err) {
      console.error("Failed to load email details:", err);
    }
  };

  const handleAskQuestion = async (q) => {
    setIsAsking(true);
    try {
      const res = await fetch(`${API_BASE}/insights/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      if (res.ok) setAnswerData(await res.json());
    } catch (err) {
      console.error("Ask query failed:", err);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 selection:bg-red-500/30 selection:text-red-200">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-red-600/[0.04] rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-amber-600/[0.03] rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          syncStatus={syncStatus}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
          onSyncGmailToDrive={handleSyncGmailToDrive}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewView 
              stats={stats} 
              digest={digest} 
              onSelectEmail={handleSelectEmail} 
            />
          )}

          {activeTab === 'costs' && (
            <CostDashboardView
              costOverview={costOverview}
              costBreakdown={costBreakdown}
              costTimeline={costTimeline}
              costRecommendations={costRecommendations}
              gcpUsage={gcpUsage}
            />
          )}

          {activeTab === 'actions' && (
            <ActionItemsView 
              actions={actions} 
              onToggleAction={handleToggleAction} 
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              trends={trends} 
              categories={categories} 
              senders={senders} 
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView 
              subscriptionsData={subscriptionsData} 
            />
          )}

          {activeTab === 'emails' && (
            <EmailsView
              emailsData={emailsData}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              selectedCategory={selectedCategory}
              onSelectEmail={handleSelectEmail}
              selectedEmail={selectedEmail}
              onCloseModal={() => setSelectedEmail(null)}
            />
          )}

          {activeTab === 'ask' && (
            <AskGmailView
              onAskQuestion={handleAskQuestion}
              answerData={answerData}
              isAsking={isAsking}
            />
          )}
        </main>
      </div>
    </div>
  );
}
