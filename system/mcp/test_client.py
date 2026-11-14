"""Talk to the server the way Claude would: start it, list its tools, call each one."""
import asyncio, sys, pathlib
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession

async def main():
    params = StdioServerParameters(command=sys.executable, args=[str(pathlib.Path(__file__).with_name("server.py"))])
    async with stdio_client(params) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            tools = await s.list_tools()
            print("TOOLS:", [t.name for t in tools.tools])
            calls = [
                ("get_rule", {"situation": "elevator door fault, should the card offer a fix?", "confidence": 41}),
                ("list_components", {}),
                ("get_component", {"name": "button"}),
                ("get_tokens", {"theme": "night", "group": "color"}),
                ("check_code", {"code": '<div class="card" style="color:#ff6b1a">\n<button class="cta"></button>\n</div>', "kind": "html"}),
            ]
            for name, args in calls:
                res = await s.call_tool(name, args)
                text = res.content[0].text
                print(f"\n===== {name}({args if len(str(args))<90 else '…'})\n{text[:700]}")

asyncio.run(main())
