export type CourseNode = {
  id: string;
  code: string;
  credits: number;
  prereqIds: string[];
};

export type TopoResult = { order: string[] };

export class GraphCycleError extends Error {
  code = 'cycle_detected' as const;
  constructor(message: string) {
    super(message);
  }
}

export function topoSort(nodes: CourseNode[]): TopoResult {
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const ids = new Set(nodes.map((n) => n.id));

  for (const n of nodes) {
    indegree.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const n of nodes) {
    for (const p of n.prereqIds) {
      if (!ids.has(p)) continue;
      indegree.set(n.id, (indegree.get(n.id) || 0) + 1);
      adj.get(p)!.push(n.id);
    }
  }

  const q: string[] = [];
  for (const [id, deg] of indegree) if (deg === 0) q.push(id);

  const order: string[] = [];
  while (q.length) {
    const v = q.shift()!;
    order.push(v);
    for (const w of adj.get(v) || []) {
      const d = (indegree.get(w) || 0) - 1;
      indegree.set(w, d);
      if (d === 0) q.push(w);
    }
  }

  if (order.length !== ids.size) {
    throw new GraphCycleError('Prerequisite cycle detected');
  }
  return { order };
}

