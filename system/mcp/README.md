# Green Control MCP

Lets any AI tool (Claude, Cursor, …) ask the Green Control design system questions while it builds, without having the files itself.

| Tool | The question it answers |
|---|---|
| `get_rule` | What should happen in this situation? (pass the AI's confidence to get the band) |
| `list_components` | Which ready-made parts exist? |
| `get_component` | How does this part work? (options, states, source) |
| `get_tokens` | Which colour / space / type value, night or day? |
| `check_code` | Is what I built right? (runs gc-check) |

Answers are read live from `files/DESIGN.md`, `files/tokens.json`, `r/registry.json` and the React components, so they change the moment those files change.

## Run it on your computer (Claude desktop)

1. `pip install "mcp>=2"`
2. Add this to Claude desktop's config (`claude_desktop_config.json`), with the real path:

```json
{ "mcpServers": { "green-control": { "command": "python3", "args": ["/path/to/gc-system/mcp/server.py"] } } }
```

3. Restart Claude. Ask: "Make a card for elevator EL-04, 41% sure." Claude will call `get_rule` first.

`python3 test_client.py` starts the server and calls every tool once, the same way Claude does.
