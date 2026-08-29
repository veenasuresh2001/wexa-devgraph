# Wexa DevGraph Explorer 🚀
A full-stack graph-powered application built for the **Wexa AI Take-Home Assignment**. **Wexa DevGraph Explorer** maps relationships between developers, skills, tech stacks, projects, and companies to drive multi-hop graph recommendations.

## 📌 Use Case & "Why a Graph Database?"

### Use Case
Tech organizations frequently struggle with talent discovery, skill-gap analysis, and staffing projects based on complex skill overlap. **Wexa DevGraph Explorer** solves this by modeling developers, their skills, technologies used, target projects, and affiliated companies as a connected network.

### Why a Graph Database?
In a relational SQL database, finding projects recommended for a developer based on shared skills across companies requires multiple expensive `JOIN` operations (e.g., `Developers` ➔ `DeveloperSkills` ➔ `Skills` ➔ `ProjectSkills` ➔ `Projects`). 

Using **CognoDB (Graph Database via Cypher)**:
* **Native Relationships:** Traversals are evaluated via direct pointers rather than relational joins.
* **Expressive Cypher Traversals:** Multi-hop queries like matching developers to projects based on shared skill nodes are written intuitively without complex subqueries.
* **Flexible Schema:** New entity types (e.g., Certifications, Teams) can be added dynamically without costly schema migrations.

## For getting started locally 
From Root :
npm run dev 

Run the database seed script to populate sample developers, skills, and relationships:
npm run seed 
from backend

## Deployment on Vercel 

Please check, https://wexa-devgraph-2uv7eydbd-veena-sureshs-projects.vercel.app/

## screenrecording 
https://drive.google.com/file/d/1O0jQ-v7HgRg1AlZZM8vmsFm5aOMCZoEZ/view?usp=drive_link