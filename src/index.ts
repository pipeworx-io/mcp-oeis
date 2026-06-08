interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * OEIS (On-Line Encyclopedia of Integer Sequences) MCP.
 * Authoritative database of integer sequences. Identify a sequence from its
 * first terms, look up well-known sequences (Fibonacci, primes, etc.) by
 * A-number, and retrieve formulas, comments, and metadata.
 */


const BASE = 'https://oeis.org';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

interface OeisResult {
  number?: number;
  id?: string;
  name?: string;
  data?: string;
  comment?: string[];
  formula?: string[];
  keyword?: string;
  offset?: string;
  author?: string;
  references?: number;
}

const tools: McpToolExport['tools'] = [
  {
    name: 'search_sequence',
    description:
      'Search the OEIS (On-Line Encyclopedia of Integer Sequences), the authoritative database of integer sequences. Identify a sequence from its first terms by passing a comma-separated list of integers (e.g. "1,1,2,3,5,8" finds the Fibonacci numbers), look up a specific sequence by A-number (e.g. "A000045"), or search free-text keywords (e.g. "prime gaps"). Returns up to 10 matching sequences per page with their A-number, name, terms, keywords, author, and offset. Use the start argument to paginate (10 results at a time).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'A comma-separated list of integers (e.g. "1,1,2,3,5,8"), an A-number (e.g. "A000045"), or free-text keywords (e.g. "prime gaps").',
        },
        start: {
          type: 'number',
          description: 'Pagination offset; results come 10 at a time. Default 0.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_sequence',
    description:
      'Fetch a single OEIS integer sequence by its A-number (e.g. "A000045" for the Fibonacci numbers, "A000040" for the primes). Accepts the A-number with or without the "A" prefix and zero-padding ("A000045", "45", and "000045" are all valid). Returns the full record: name, terms (data), comments, formulas, keywords, offset, author, and reference count. Use this to get the formula or mathematical description of a known sequence.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'An OEIS A-number such as "A000045", or just "45" / "000045".',
        },
      },
      required: ['id'],
    },
  },
];

function aNumber(num: number | undefined): string {
  return 'A' + String(num ?? 0).padStart(6, '0');
}

async function oeisSearch(q: string, start?: number): Promise<OeisResult[]> {
  const params = new URLSearchParams({ q, fmt: 'json' });
  if (typeof start === 'number' && start > 0) params.set('start', String(start));
  const res = await fetch(`${BASE}/search?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) {
    throw new Error(`OEIS: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  }
  const body = (await res.json()) as unknown;
  // With fmt=json the response is a top-level JSON array of result objects.
  // Zero results may come back as [] (or null); normalize to an array.
  if (Array.isArray(body)) return body as OeisResult[];
  return [];
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'search_sequence': {
        const query = args.query;
        if (typeof query !== 'string' || !query.trim()) {
          return { error: 'Required argument "query" is missing. Pass a comma-separated list of integers, an A-number, or free-text keywords.' };
        }
        const start = typeof args.start === 'number' ? args.start : 0;
        const results = await oeisSearch(query.trim(), start);
        if (!results.length) return { count: 0, results: [] };
        return {
          count: results.length,
          results: results.map((r) => ({
            a_number: aNumber(r.number),
            name: r.name ?? null,
            data: r.data ?? null,
            keyword: r.keyword ?? null,
            author: r.author ?? null,
            offset: r.offset ?? null,
          })),
        };
      }
      case 'get_sequence': {
        const rawId = args.id;
        if (typeof rawId !== 'string' || !rawId.trim()) {
          return { error: 'Required argument "id" is missing. Pass an A-number like "A000045".' };
        }
        const digits = rawId.trim().replace(/^A/i, '').replace(/\D/g, '');
        if (!digits) return { error: 'sequence not found', id: rawId };
        const anum = 'A' + digits.padStart(6, '0');
        const results = await oeisSearch(anum);
        const match = results.find((r) => aNumber(r.number) === anum) ?? results[0];
        if (!match) return { error: 'sequence not found', id: anum };
        return {
          a_number: aNumber(match.number),
          name: match.name ?? null,
          data: match.data ?? null,
          comment: match.comment ?? [],
          formula: match.formula ?? [],
          keyword: match.keyword ?? null,
          offset: match.offset ?? null,
          author: match.author ?? null,
          references: match.references ?? null,
        };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
