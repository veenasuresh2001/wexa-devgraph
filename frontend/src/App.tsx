import React, { useEffect, useState } from "react";
import { 
  fetchStats, 
  fetchGraphData, 
  fetchDevelopers, 
  fetchRecommendations, 
  fetchSkillGaps  
} from "./api/client.ts";
import type { GraphStats } from "./api/client.ts";
import GraphVisualizer from "./components/GraphVisualizer";
import "./App.css";

function App() {
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedDev, setSelectedDev] = useState<string>("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview data concurrently
      const [statsRes, graphRes, devListRes] = await Promise.all([
        fetchStats(),
        fetchGraphData(),
        fetchDevelopers()
      ]);

      setStats(statsRes.data);
      setGraphData(graphRes.data || graphRes);
      setDevelopers(devListRes.data || devListRes);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        "Unable to connect to CognoDB Backend. Please ensure the Express server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDevChange = async (devId: string) => {
    setSelectedDev(devId);
    if (!devId) {
      setRecommendations([]);
      return;
    }
    try {
      const res = await fetchRecommendations(devId);
      setRecommendations(res.data || res);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  if (loading) {
    return <div className="status-screen">Loading graph network…</div>;
  }

  if (error) {
    return <div className="status-screen error">{error}</div>;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <span className="status-dot pulse" />
          <p className="eyebrow">Graph Data Platform</p>
        </div>

        <div className="header-main">
          <div>
            <h1>Wexa DevGraph Explorer</h1>
            <p className="tagline">
              Discover developers, skills, and multi-hop project connections
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.developers ?? 0}</h3>
          <p>Developers</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.skills ?? 0}</h3>
          <p>Skills</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.projects ?? 0}</h3>
          <p>Projects</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.technologies ?? 0}</h3>
          <p>Technologies</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.companies ?? 0}</h3>
          <p>Companies</p>
        </div>
      </section>

      {/* Graph Interactive Visualizer */}
      <section className="section">
        <h2>Interactive Graph Network</h2>
        <GraphVisualizer data={graphData} />
      </section>

      {/* Multi-hop Query Exploration */}
      <section className="section">
        <h2>Graph Recommendations (2-Hop Traversal)</h2>
        <div className="card">
          <label htmlFor="dev-select"><strong>Select Developer: </strong></label>
          <select 
            id="dev-select" 
            value={selectedDev} 
            onChange={(e) => handleDevChange(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", marginLeft: "10px" }}
          >
            <option value="">-- Choose Developer --</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name || dev.id}
              </option>
            ))}
          </select>

          {recommendations.length > 0 && (
            <div className="list" style={{ marginTop: "16px" }}>
              <h4>Recommended Connections / Projects:</h4>
              {recommendations.map((item, idx) => (
                <div key={idx} className="list-item">
                  <span className="node-dot dev" />
                  <div>
                    <strong>{item.name || item.title || item.id}</strong>
                    <small>{item.reason || item.type || "Suggested Node"}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;