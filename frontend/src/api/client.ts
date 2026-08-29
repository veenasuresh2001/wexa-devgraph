const API_BASE = "/api";

export interface GraphStats {
  developers: number;
  skills: number;
  projects: number;
  technologies: number;
  companies: number;
}

export interface StatsResponse {
  success: boolean;
  data: GraphStats;
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/graph/stats`);
  if (!res.ok) throw new Error("Failed to fetch statistics");
  return res.json();
}

export async function fetchDevelopers() {
  const res = await fetch(`${API_BASE}/developers`);
  if (!res.ok) throw new Error("Failed to fetch developers");
  return res.json();
}

export async function fetchGraphData() {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error("Failed to fetch graph data");
  return res.json();
}

export async function fetchRecommendations(devId: string) {
  const res = await fetch(`${API_BASE}/developers/${devId}/recommendations`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function fetchSkillGaps(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/skill-gaps`);
  if (!res.ok) throw new Error("Failed to fetch skill gaps");
  return res.json();
}