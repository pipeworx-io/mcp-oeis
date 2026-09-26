# mcp-oeis

OEIS (On-Line Encyclopedia of Integer Sequences) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_sequence` | Search the OEIS (On-Line Encyclopedia of Integer Sequences), the authoritative database of integer sequences. Identify a sequence from its first terms by passing a comma-separated list of integers (e.g. "1,1,2,3,5,8" finds the Fibonacci numbers), look up a specific sequence by A-number (e.g. "A000045"), or search free-text keywords (e.g. "prime gaps"). Returns up to 10 matching sequences per page with their A-number, name, terms, keywords, author, and offset. Use the start argument to paginate (10 results at a time). |
| `get_sequence` | Fetch a single OEIS integer sequence by its A-number (e.g. "A000045" for the Fibonacci numbers, "A000040" for the primes). Accepts the A-number with or without the "A" prefix and zero-padding ("A000045", "45", and "000045" are all valid). Returns the full record: name, terms (data), comments, formulas, keywords, offset, author, and reference count. Use this to get the formula or mathematical description of a known sequence. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "oeis": {
      "url": "https://gateway.pipeworx.io/oeis/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/oeis/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/search_sequence \
  -H 'Content-Type: application/json' \
  -d '{"query":"1,1,2,3,5,8"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/search_sequence`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "oeis": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-oeis"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-oeis
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Oeis data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
