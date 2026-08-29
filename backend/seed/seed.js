require("dotenv").config();
const driver = require("../src/db/neo4j");

async function seed() {
  const session = driver.session();

  try {
    console.log("Cleaning existing graph data...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log("Seeding full graph data...");

    const seedQuery = `
      // =====================================================
      // 1. DEVELOPERS
      // =====================================================

      CREATE (veena:Developer {
        id: "dev-1",
        name: "Veena Suresh",
        title: "Frontend Developer",
        experienceYears: 2,
        location: "Kerala"
      })

      CREATE (alice:Developer {
        id: "dev-2",
        name: "Alice Chen",
        title: "Senior Backend Engineer",
        experienceYears: 7,
        location: "Bangalore"
      })

      CREATE (bob:Developer {
        id: "dev-3",
        name: "Bob Smith",
        title: "Full Stack Developer",
        experienceYears: 4,
        location: "Remote"
      })

      CREATE (carol:Developer {
        id: "dev-4",
        name: "Carol Danvers",
        title: "Graph Architect",
        experienceYears: 9,
        location: "Remote"
      })


      // =====================================================
      // 2. SKILLS
      // =====================================================

      CREATE (react:Skill {
        id: "skill-1",
        name: "React",
        category: "Frontend"
      })

      CREATE (cypher:Skill {
        id: "skill-2",
        name: "Cypher",
        category: "Database"
      })

      CREATE (node:Skill {
        id: "skill-3",
        name: "Node.js",
        category: "Backend"
      })

      CREATE (neo4j:Skill {
        id: "skill-4",
        name: "Neo4j/CognoDB",
        category: "Database"
      })


      // =====================================================
      // 3. PROJECTS
      // =====================================================

      CREATE (p1:Project {
        id: "proj-1",
        name: "Enterprise Graph Migration",
        status: "Active",
        complexity: "High"
      })

      CREATE (p2:Project {
        id: "proj-2",
        name: "Developer Portal Dashboard",
        status: "Planning",
        complexity: "Medium"
      })


      // =====================================================
      // 4. TECHNOLOGIES
      // =====================================================

      CREATE (javascript:Technology {
        id: "tech-1",
        name: "JavaScript",
        category: "Programming Language"
      })

      CREATE (reactTech:Technology {
        id: "tech-2",
        name: "React.js",
        category: "Frontend Framework"
      })

      CREATE (nodeTech:Technology {
        id: "tech-3",
        name: "Node.js",
        category: "Backend Runtime"
      })

      CREATE (neo4jTech:Technology {
        id: "tech-4",
        name: "Neo4j",
        category: "Graph Database"
      })

      CREATE (mongodb:Technology {
        id: "tech-5",
        name: "MongoDB",
        category: "Database"
      })

      CREATE (tailwind:Technology {
        id: "tech-6",
        name: "Tailwind CSS",
        category: "CSS Framework"
      })


      // =====================================================
      // 5. COMPANIES
      // =====================================================

      CREATE (prx:Company {
        id: "company-1",
        name: "PRX Care",
        industry: "Healthcare Technology",
        location: "India"
      })

      CREATE (wexa:Company {
        id: "company-2",
        name: "Wexa",
        industry: "Artificial Intelligence",
        location: "India"
      })

      CREATE (techCorp:Company {
        id: "company-3",
        name: "TechCorp",
        industry: "Software",
        location: "Bangalore"
      })


      // =====================================================
      // 6. DEVELOPER -> SKILL
      // =====================================================

      CREATE (veena)-[:HAS_SKILL {
        proficiency: "Expert"
      }]->(react)

      CREATE (veena)-[:HAS_SKILL {
        proficiency: "Intermediate"
      }]->(node)

      CREATE (alice)-[:HAS_SKILL {
        proficiency: "Expert"
      }]->(cypher)

      CREATE (alice)-[:HAS_SKILL {
        proficiency: "Advanced"
      }]->(node)

      CREATE (bob)-[:HAS_SKILL {
        proficiency: "Advanced"
      }]->(react)

      CREATE (bob)-[:HAS_SKILL {
        proficiency: "Intermediate"
      }]->(node)

      CREATE (carol)-[:HAS_SKILL {
        proficiency: "Expert"
      }]->(neo4j)

      CREATE (carol)-[:HAS_SKILL {
        proficiency: "Expert"
      }]->(cypher)


      // =====================================================
      // 7. DEVELOPER -> PROJECT
      // =====================================================

      CREATE (veena)-[:CONTRIBUTED_TO {
        role: "UI Engineer"
      }]->(p2)

      CREATE (alice)-[:CONTRIBUTED_TO {
        role: "Lead Architect"
      }]->(p1)

      CREATE (bob)-[:CONTRIBUTED_TO {
        role: "Full Stack Developer"
      }]->(p2)

      CREATE (carol)-[:CONTRIBUTED_TO {
        role: "Graph Consultant"
      }]->(p1)


      // =====================================================
      // 8. PROJECT -> SKILL
      // =====================================================

      CREATE (p1)-[:REQUIRES_SKILL {
        importance: "Critical"
      }]->(cypher)

      CREATE (p1)-[:REQUIRES_SKILL {
        importance: "Critical"
      }]->(neo4j)

      CREATE (p2)-[:REQUIRES_SKILL {
        importance: "High"
      }]->(react)

      CREATE (p2)-[:REQUIRES_SKILL {
        importance: "Medium"
      }]->(node)


      // =====================================================
      // 9. DEVELOPER -> TECHNOLOGY
      // =====================================================

      CREATE (veena)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(javascript)

      CREATE (veena)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(reactTech)

      CREATE (veena)-[:USES_TECHNOLOGY {
        proficiency: "Intermediate"
      }]->(nodeTech)

      CREATE (veena)-[:USES_TECHNOLOGY {
        proficiency: "Advanced"
      }]->(tailwind)

      CREATE (alice)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(nodeTech)

      CREATE (alice)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(neo4jTech)

      CREATE (alice)-[:USES_TECHNOLOGY {
        proficiency: "Advanced"
      }]->(mongodb)

      CREATE (bob)-[:USES_TECHNOLOGY {
        proficiency: "Advanced"
      }]->(javascript)

      CREATE (bob)-[:USES_TECHNOLOGY {
        proficiency: "Advanced"
      }]->(reactTech)

      CREATE (bob)-[:USES_TECHNOLOGY {
        proficiency: "Advanced"
      }]->(nodeTech)

      CREATE (carol)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(neo4jTech)

      CREATE (carol)-[:USES_TECHNOLOGY {
        proficiency: "Expert"
      }]->(javascript)


      // =====================================================
      // 10. PROJECT -> TECHNOLOGY
      // =====================================================

      CREATE (p1)-[:USES_TECHNOLOGY]->(neo4jTech)
      CREATE (p1)-[:USES_TECHNOLOGY]->(nodeTech)
      CREATE (p1)-[:USES_TECHNOLOGY]->(javascript)

      CREATE (p2)-[:USES_TECHNOLOGY]->(reactTech)
      CREATE (p2)-[:USES_TECHNOLOGY]->(nodeTech)
      CREATE (p2)-[:USES_TECHNOLOGY]->(tailwind)


      // =====================================================
      // 11. DEVELOPER -> COMPANY
      // =====================================================

      CREATE (veena)-[:WORKS_AT]->(prx)
      CREATE (alice)-[:WORKS_AT]->(techCorp)
      CREATE (bob)-[:WORKS_AT]->(wexa)
      CREATE (carol)-[:WORKS_AT]->(wexa)


      // =====================================================
      // 12. PROJECT -> COMPANY
      // =====================================================

      CREATE (p1)-[:OWNED_BY]->(wexa)
      CREATE (p2)-[:OWNED_BY]->(prx)
    `;

    await session.run(seedQuery);

    console.log("✅ Graph database successfully seeded!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();