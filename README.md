# mcp-oeis

OEIS (On-Line Encyclopedia of Integer Sequences) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Oeis data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
