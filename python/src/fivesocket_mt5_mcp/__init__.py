import shutil
import subprocess
import sys

NPM_PACKAGE = "fivesocket-mt5-mcp@1"


def main() -> None:
    npx = shutil.which("npx")
    if npx is None:
        sys.stderr.write(
            "fivesocket-mt5-mcp needs Node.js 20 or newer (it runs the npm package "
            f"{NPM_PACKAGE}, which handles the OAuth sign-in). Install Node.js from "
            "https://nodejs.org, or add https://api.fivesocket.com/mcp to your client "
            "as a remote MCP server instead.\n"
        )
        sys.exit(1)
    sys.exit(subprocess.call([npx, "-y", NPM_PACKAGE, *sys.argv[1:]]))
