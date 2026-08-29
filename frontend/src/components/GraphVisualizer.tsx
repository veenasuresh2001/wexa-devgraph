import ForceGraph2D from "react-force-graph-2d";

export interface GraphNode {
  id: string;
  name?: string;
  label?: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphVisualizerProps {
  data?: GraphData | null;
}

const cssVar = (name: string): string => {
  if (typeof window === "undefined") return "#000000";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || "#888888"
  );
};

export default function GraphVisualizer({ data }: GraphVisualizerProps) {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return <div className="empty-state">No graph data available yet.</div>;
  }

  const getNodeColor = (label?: string): string => {
    switch (label) {
      case "Developer":
        return cssVar("--node-dev");
      case "Skill":
        return cssVar("--node-skill");
      case "Project":
        return cssVar("--node-project");
      default:
        return cssVar("--text-faint");
    }
  };

  return (
    <div
      style={{
        height: "450px",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <ForceGraph2D
        graphData={data}
        backgroundColor="transparent"
        linkColor={() => cssVar("--edge")}
        nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const label = node.name || node.id || "";
          const fontSize = 11 / globalScale;
          const color = getNodeColor(node.label);

          // Draw Node Circle
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = cssVar("--text-muted");
          ctx.fillText(label, x, y + 10);
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
      />
    </div>
  );
}