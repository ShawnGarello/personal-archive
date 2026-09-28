"""Dependency-free checks of tracked files only; never read local private files."""
import ast
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def main():
    tracked = subprocess.check_output(
        ["git", "ls-files", "-z"], cwd=ROOT
    ).decode("utf-8").split("\0")
    tracked = {name for name in tracked if name}
    failures = []
    for name in sorted(tracked):
        path = ROOT / name
        parts = Path(name).parts
        # Check names before reading content, including accidentally forced files.
        if any(p.lower() in {"private", "artifacts"} for p in parts) or (
            path.suffix.lower() == ".pdf" and "resume" in path.name.lower()
        ) or (path.name.startswith(".env") and path.name != ".env.example"):
            failures.append("Forbidden private/artifact/environment path is tracked.")
            continue
        if path.is_symlink():
            failures.append(f"{name}: tracked symlinks require explicit review.")
            continue
        if path.suffix.lower() not in {".py", ".json", ".md"}:
            continue
        try:
            content = path.read_text(encoding="utf-8")
            if path.suffix == ".py":
                ast.parse(content, filename=name)  # Does not import bpy or execute code.
            elif path.suffix == ".json":
                json.loads(content)
            else:
                # Validate relative file links outside fenced code; anchors are not checked.
                prose = re.sub(r"```.*?```|~~~.*?~~~", "", content, flags=re.S)
                for match in re.finditer(r"\]\((<[^>]+>|[^\s)]+)(?:\s+\"[^\"]*\")?\)", prose):
                    target = urlsplit(match.group(1).strip("<>"))
                    if target.scheme or target.netloc or not target.path:
                        continue
                    resolved = (path.parent / unquote(target.path)).resolve()
                    try:
                        relative = resolved.relative_to(ROOT).as_posix()
                    except ValueError:
                        failures.append(f"{name}: link leaves the repository.")
                        continue
                    if relative not in tracked and not any(
                        item.startswith(relative.rstrip("/") + "/") for item in tracked
                    ):
                        failures.append(f"{name}: link target is not tracked: {relative}")
        except (OSError, UnicodeError, SyntaxError, ValueError) as exc:
            failures.append(f"{name}: {exc}")
    for failure in failures:
        print(failure, file=sys.stderr)
    if failures:
        return 1
    print(f"Repository checks passed for {len(tracked)} tracked files.")
    print("No Blender execution, external-link validation, or browser testing performed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
