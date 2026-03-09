# MCP Tool Search - Complete Guide 🔍

## What is Tool Search?

**Tool Search** is a Claude Code built-in capability that enables **lazy loading** of MCP tools to dramatically reduce token consumption.

**Released:** January 14, 2026 by Anthropic

**Type:** `tool_search_tool_regex_20251119` (Built-in System Tool)

---

## The Problem It Solved

### Before Tool Search (2025)
```
Claude Code Session Start
  ↓
Load ALL MCP tool definitions upfront
  ↓
77,000 tokens consumed (for 50+ tools)
  ↓
Only 123K tokens left for actual work (out of 200K)
  ↓
💸 Context pollution! 38.5% of budget wasted
```

**Real Example:** Developer Scott Spence documented starting a session and watching **66,000 tokens disappear** before typing anything.

### After Tool Search (2026)
```
Claude Code Session Start
  ↓
Load ONLY Tool Search tool (~3K tokens)
  ↓
Claude needs a specific tool?
  ↓
Tool Search finds it via regex/BM25
  ↓
Load 3-5 relevant tools (~3K tokens)
  ↓
Total: ~8.7K tokens instead of 77K
  ↓
✅ 85% reduction! 191K tokens available for work
```

---

## How Tool Search Works

### Automatic Activation

Tool Search is **automatically enabled** when:
```
MCP tool descriptions > 10% of context window
  ↓
Tools marked with defer_loading: true
  ↓
Claude receives Tool Search tool instead
```

**No configuration needed!** It just works.

### Two Search Modes

#### 1. Regex Mode (Precise Matching)
```python
# Claude knows roughly what it needs
Tool Search query: "search.*paper"
  ↓
Matches: search_papers, search_paper_by_id
```

**Use case:** Claude knows the tool name pattern

#### 2. BM25 Mode (Semantic Search)
```python
# Claude needs to discover relevant tools
Tool Search query: "find academic articles from databases"
  ↓
Semantic similarity matching
  ↓
Returns: search_papers, get_paper_details, get_available_sources
```

**Use case:** Exploratory discovery, natural language queries

### Loading Strategy

```
User: "Research quantum computing papers"
  ↓
Tool Search: regex="search.*paper"
  ↓
Found: search_papers, search_paper_archive
  ↓
Load ONLY these 2 tools (~600 tokens each)
  ↓
Execute search_papers(query="quantum computing")
  ↓
If user asks to download:
  Tool Search: regex="download.*paper"
  ↓
Load: download_paper (~600 tokens)
```

**Key:** Tools load **on-demand**, not upfront!

---

## Performance Benchmarks

### Token Savings (Anthropic Internal Testing)

| Scenario | Without Tool Search | With Tool Search | Reduction |
|----------|---------------------|------------------|-----------|
| 50 MCP tools | 77,000 tokens | 8,700 tokens | **89%** |
| GitHub MCP | 17,000 tokens | 3,000 tokens | **82%** |
| 5 MCP servers | 55,000 tokens | 8,500 tokens | **85%** |
| Anthropic internal | 134,000 tokens | 5,000 tokens | **96%** |

### Accuracy Improvements

Tool Search also **improves accuracy** when working with large tool libraries:

| Model | Without Tool Search | With Tool Search | Improvement |
|-------|---------------------|------------------|-------------|
| Opus 4 | 49% accuracy | 74% accuracy | **+25%** |
| Opus 4.5 | 79.5% accuracy | 88.1% accuracy | **+8.6%** |

**Why?** Less noise in context = better tool selection.

---

## Implementation Details

### Tool Search Tool Structure

```json
{
  "name": "tool_search",
  "type": "tool_search_tool_regex_20251119",
  "description": "Search for tools matching a pattern or description",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Regex pattern or natural language query"
      },
      "mode": {
        "type": "string",
        "enum": ["regex", "bm25"],
        "description": "Search mode: regex for patterns, bm25 for semantic"
      }
    }
  }
}
```

### Example Tool Search Flow

**Scenario:** User wants to research papers about "transformer architectures"

```python
# Step 1: Claude receives user query
User: "Find recent papers on transformer architectures"

# Step 2: Claude uses Tool Search
Tool Search (regex mode):
  query: "search.*paper"
  → Finds: search_papers, search_paper_details

# Step 3: Load relevant tools (lazy)
Load: search_papers (600 tokens)

# Step 4: Execute
search_papers(
  query="transformer architectures",
  days_back=30,
  limit=10
)

# Step 5: User wants to read a paper
User: "Read the first paper"

# Step 6: Tool Search again
Tool Search (regex mode):
  query: "read.*paper"
  → Finds: read_paper

# Step 7: Load new tool
Load: read_paper (600 tokens)

# Step 8: Execute
read_paper(source="arxiv", paper_id="2401.12345")
```

**Total tokens for tools:** ~1,200 tokens (vs 77K without Tool Search!)

---

## Best Practices

### For MCP Server Developers

#### 1. Write Clear Tool Descriptions
```python
@mcp.tool()
async def search_papers(
    query: str,
    sources: Optional[List[str]] = None,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """Search for academic papers across multiple sources.

    Use this tool when you need to:
    - Find papers by keyword/topic
    - Search across arXiv, PubMed, etc.
    - Filter by publication date

    Examples:
    - search_papers("quantum computing", limit=5)
    - search_papers("machine learning", sources=["arxiv"], days_back=7)
    """
```

**Why:** Better BM25 semantic matching!

#### 2. Use Consistent Naming Patterns
```python
# Good (regex-friendly)
search_papers()
get_paper_details()
download_paper()
read_paper()

# Bad (hard to discover)
fetch_academic_articles()
retrieve_publication_metadata()
obtain_pdf_file()
extract_text_content()
```

**Why:** Easier regex matching like `".*paper.*"`

#### 3. Group Related Tools
```python
# Papers
search_papers()
get_paper_details()
download_paper()
read_paper()

# Sources
get_available_sources()
search_by_source()
```

**Why:** Tool Search can find entire groups with one query.

### For Claude Code Users

#### 1. Let Tool Search Work Automatically
❌ **Don't:** Manually limit MCP servers to reduce tokens
✅ **Do:** Install all MCP servers you need, Tool Search handles it

#### 2. Use Descriptive Task Names
```python
# Good (triggers BM25 semantic search)
"Research papers about neural networks"
"Download the latest quantum computing papers"

# Also good (triggers regex search)
"Use search_papers for ML papers"
```

#### 3. Monitor Token Usage
```bash
# Check context usage in Claude Code
# Settings > Cost Management > Token Usage

# Before Tool Search: ~77K tokens for MCP
# After Tool Search: ~8-10K tokens
```

---

## Troubleshooting

### Tool Not Found

**Problem:** Tool Search can't find your tool

**Solutions:**
1. Check tool description contains relevant keywords
2. Use explicit tool name: "Use the search_papers tool"
3. Verify MCP server is registered: `claude mcp list`

### Too Many Tools Loaded

**Problem:** Tool Search loads irrelevant tools

**Solutions:**
1. Use more specific queries: "search papers" → "search academic papers by keyword"
2. Check tool descriptions aren't too generic
3. Use regex mode with specific pattern: `search_papers.*`

### Tool Search Not Activating

**Problem:** All tools loaded upfront (old behavior)

**Check:**
1. Are your MCP tools < 10% of context? (Tool Search won't activate)
2. Update Claude Code to latest version (Jan 2026+)
3. Check settings: Tool Search should be "Auto" (default)

---

## References

- [Official Tool Search API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- [Token Reduction Analysis](https://medium.com/@joe.njenga/claude-code-just-cut-mcp-context-bloat-by-46-9-51k-tokens-down-to-8-5k-with-new-tool-search-ddf9e905f734)
- [MCP Tool Search Guide](https://www.atcyrus.com/stories/mcp-tool-search-claude-code-context-pollution-guide)
- [Lazy Loading Explained](https://jpcaparas.medium.com/claude-code-finally-gets-lazy-loading-for-mcp-tools-explained-39b613d1d5cc)

---

**Status:** Updated 2026-01-28
**Version:** Tool Search v1.0 (type: tool_search_tool_regex_20251119)
