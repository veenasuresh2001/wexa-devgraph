const driver = require("../db/neo4j");

const formatRecord = (record) => record.toObject();

const graphService = {
  async getOverviewStats() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (d:Developer) WITH count(d) AS developers
        MATCH (s:Skill) WITH developers, count(s) AS skills
        MATCH (p:Project) WITH developers, skills, count(p) AS projects
        MATCH ()-[r]->() WITH developers, skills, projects, count(r) AS relationships
        RETURN developers, skills, projects, relationships
      `);
      const record = result.records[0];
      return {
        developers: record.get("developers").toNumber(),
        skills: record.get("skills").toNumber(),
        projects: record.get("projects").toNumber(),
        relationships: record.get("relationships").toNumber(),
      };
    } finally {
      await session.close();
    }
  },

  async getAllDevelopers() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (d:Developer)
        OPTIONAL MATCH (d)-[h:HAS_SKILL]->(s:Skill)
        RETURN d, collect({skill: s.name, proficiency: h.proficiency}) AS skills
      `);
      return result.records.map((rec) => ({
        ...rec.get("d").properties,
        skills: rec.get("skills"),
      }));
    } finally {
      await session.close();
    }
  },

  async getFullGraph() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, r, m
      `);

      const nodesMap = new Map();
      const links = [];

      result.records.forEach((record) => {
        const source = record.get("n");
        const rel = record.get("r");
        const target = record.get("m");

        if (source && !nodesMap.has(source.identity.toString())) {
          nodesMap.set(source.identity.toString(), {
            id: source.properties.id || source.identity.toString(),
            name: source.properties.name,
            label: source.labels[0],
          });
        }

        if (target && !nodesMap.has(target.identity.toString())) {
          nodesMap.set(target.identity.toString(), {
            id: target.properties.id || target.identity.toString(),
            name: target.properties.name,
            label: target.labels[0],
          });
        }

        if (rel) {
          links.push({
            source: source.properties.id || source.identity.toString(),
            target: target.properties.id || target.identity.toString(),
            type: rel.type,
          });
        }
      });

      return {
        nodes: Array.from(nodesMap.values()),
        links,
      };
    } finally {
      await session.close();
    }
  },

  async getProjectSkillGaps(projectId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (p:Project {id: $projectId})-[:REQUIRES_SKILL]->(s:Skill)<-[h:HAS_SKILL]-(d:Developer)
        WHERE NOT (d)-[:CONTRIBUTED_TO]->(p)
        RETURN d.name AS developer, d.title AS title, s.name AS missingSkill, h.proficiency AS proficiency
        `,
        { projectId }
      );
      return result.records.map(formatRecord);
    } finally {
      await session.close();
    }
  },

  async getCollaboratorRecommendations(developerId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (d1:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(d2:Developer)
        WHERE d1 <> d2
        WITH d2, COUNT(s) AS sharedSkillsCount, COLLECT(s.name) AS sharedSkills
        RETURN d2.name AS recommendedCollaborator, d2.title AS title, sharedSkillsCount, sharedSkills
        ORDER BY sharedSkillsCount DESC
        `,
        { developerId }
      );
      
      return result.records.map((rec) => ({
        recommendedCollaborator: rec.get("recommendedCollaborator"),
        title: rec.get("title"),
        sharedSkillsCount: rec.get("sharedSkillsCount").toNumber(),
        sharedSkills: rec.get("sharedSkills"),
      }));
    } finally {
      await session.close();
    }
  },
};

module.exports = graphService;