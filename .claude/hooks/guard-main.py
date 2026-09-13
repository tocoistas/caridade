#!/usr/bin/env python3
"""PreToolUse(Bash) — impede o Claude de commitar ou fazer push directo para main.

Recebe o JSON do hook em stdin. Sai com código 2 (bloqueia e devolve a mensagem
ao modelo) quando o comando é `git commit` num checkout em main, ou `git push`
que actualize main. Lida com `cd <dir> && git …` e `git -C <dir> …`.
"""
import json
import os
import re
import shlex
import subprocess
import sys

MSG = (
    "Bloqueado pelo guard-main: alterações nunca vão directamente para main. "
    "Crie um branch (git switch -c <tipo>/<descricao>), faça commit aí, abra PR "
    "com gh pr create e conclua com scripts/dev/finish-pr.sh <n> (skill pr-workflow)."
)


def branch_of(repo: str) -> str:
    try:
        return subprocess.run(
            ["git", "-C", repo, "symbolic-ref", "--short", "HEAD"],
            capture_output=True, text=True, timeout=5,
        ).stdout.strip()
    except Exception:
        return ""


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    cmd = (data.get("tool_input") or {}).get("command") or ""
    cur = data.get("cwd") or os.getcwd()

    for seg in re.split(r"&&|\|\||;|\n", cmd):
        seg = seg.strip()
        m = re.match(r"^cd\s+(.+)$", seg)
        if m:
            target = m.group(1).strip().strip("'\"")
            cur = os.path.normpath(os.path.join(cur, os.path.expanduser(target)))
            continue
        try:
            toks = shlex.split(seg)
        except ValueError:
            continue
        # ignora prefixos de variáveis de ambiente (FOO=1 git …)
        while toks and re.match(r"^\w+=", toks[0]):
            toks = toks[1:]
        if not toks or os.path.basename(toks[0]) != "git":
            continue
        repo, i = cur, 1
        while i < len(toks) and toks[i].startswith("-"):
            if toks[i] == "-C" and i + 1 < len(toks):
                repo = os.path.normpath(os.path.join(cur, os.path.expanduser(toks[i + 1])))
                i += 2
            elif toks[i] == "-c":
                i += 2
            else:
                i += 1
        if i >= len(toks):
            continue
        sub, args = toks[i], toks[i + 1:]
        branch = branch_of(repo)

        if sub == "commit" and branch == "main":
            print(MSG, file=sys.stderr)
            return 2
        if sub == "push":
            if "--delete" in args or "-d" in args:
                if any(a in ("main", "refs/heads/main") for a in args):
                    print(MSG, file=sys.stderr)
                    return 2
                continue
            refspecs = [a for a in args if not a.startswith("-")][1:]  # [remote, refspec…]
            if any(r in ("main", "HEAD:main") or r.endswith(":main") or r.endswith(":refs/heads/main") for r in refspecs):
                print(MSG, file=sys.stderr)
                return 2
            if not refspecs and branch == "main":
                print(MSG, file=sys.stderr)
                return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
