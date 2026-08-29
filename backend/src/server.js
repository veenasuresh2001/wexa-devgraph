const express = require("express");
const cors = require("cors");
require("dotenv").config();

const driver = require("./db/neo4j");

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Wexa CognoDB API is running",
  });
});

// Health check endpoint
app.get("/api/health/db", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      "RETURN 'CognoDB connection successful' AS message"
    );

    res.json({
      success: true,
      message: result.records[0].get("message"),
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to connect to CognoDB",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

// Graph Statistics
app.get("/api/graph/stats", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      RETURN
        size([(n:Developer) | n]) AS developers,
        size([(n:Skill) | n]) AS skills,
        size([(n:Project) | n]) AS projects,
        size([(n:Technology) | n]) AS technologies,
        size([(n:Company) | n]) AS companies
    `);

    if (result.records.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No graph statistics found",
      });
    }

    const record = result.records[0];

    res.json({
      success: true,
      data: {
        developers: record.get("developers").toNumber(),
        skills: record.get("skills").toNumber(),
        projects: record.get("projects").toNumber(),
        technologies: record.get("technologies").toNumber(),
        companies: record.get("companies").toNumber(),
      },
    });
  } catch (error) {
    console.error("Graph statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get graph statistics",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

// Get List of Developers
app.get("/api/developers", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (d:Developer)
      RETURN d.id AS id, d.name AS name, labels(d)[0] AS label
      ORDER BY d.name ASC
    `);

    const developers = result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      label: record.get("label"),
    }));

    res.json({
      success: true,
      data: developers,
    });
  } catch (error) {
    console.error("Fetch developers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch developers",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

// Full Graph Data Extraction (Nodes & Edges for 2D Force Graph)
app.get("/api/graph", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT 200
    `);

    const nodesMap = new Map();
    const links = [];

    result.records.forEach((record) => {
      const sourceNode = record.get("n");
      const targetNode = record.get("m");
      const rel = record.get("r");

      if (sourceNode) {
        const id = sourceNode.properties.id || sourceNode.identity.toString();
        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id,
            name: sourceNode.properties.name || sourceNode.properties.title || id,
            label: sourceNode.labels[0] || "Unknown",
          });
        }
      }

      if (targetNode) {
        const id = targetNode.properties.id || targetNode.identity.toString();
        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id,
            name: targetNode.properties.name || targetNode.properties.title || id,
            label: targetNode.labels[0] || "Unknown",
          });
        }
      }

      if (rel && sourceNode && targetNode) {
        links.push({
          source: sourceNode.properties.id || sourceNode.identity.toString(),
          target: targetNode.properties.id || targetNode.identity.toString(),
          type: rel.type,
        });
      }
    });

    res.json({
      success: true,
      nodes: Array.from(nodesMap.values()),
      links,
    });
  } catch (error) {
    console.error("Fetch graph data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch graph data",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

app.get("/api/developers/:devId/recommendations", async (req, res) => {
  const session = driver.session();
  const { devId } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {id: $devId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(p:Project)
      WHERE NOT (d)-[:WORKS_ON]->(p)
      RETURN DISTINCT p.id AS id, p.name AS name, 'Recommended Project via Skill Matching' AS reason
      LIMIT 5
      `,
      { devId }
    );

    const recommendations = result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      reason: record.get("reason"),
    }));

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Fetch recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

// Skill Gap Analysis Endpoint
app.get("/api/projects/:projectId/skill-gaps", async (req, res) => {
  const session = driver.session();
  const { projectId } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (p:Project {id: $projectId})-[:REQUIRES_SKILL]->(s:Skill)
      WHERE NOT EXISTS {
        MATCH (p)<-[:WORKS_ON]-(d:Developer)-[:HAS_SKILL]->(s)
      }
      RETURN s.id AS id, s.name AS name
      `,
      { projectId }
    );

    const skillGaps = result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
    }));

    res.json({
      success: true,
      data: skillGaps,
    });
  } catch (error) {
    console.error("Fetch skill gaps error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skill gaps",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

module.exports = app;