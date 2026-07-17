#!/usr/bin/env python3
"""
Verifica o estado do rollout do Firebase App Hosting para um commit específico.

Ao contrário de "pegar no rollout mais recente" (a API NÃO devolve os rollouts
por ordem cronológica), este script associa o rollout ao commit exato:
  1. procura o BUILD cujo `source.codebase.hash == COMMIT`;
  2. encontra o ROLLOUT que referencia esse build;
  3. imprime `ESTADO|NOME|` (ou `PENDING||` se ainda não existir).

Variáveis de ambiente: PROJECT, LOCATION, BACKEND_ID, COMMIT, TOKEN.
"""
import json
import os
import sys
import urllib.request

PROJECT = os.environ["PROJECT"]
LOCATION = os.environ["LOCATION"]
BACKEND = os.environ["BACKEND_ID"]
COMMIT = os.environ["COMMIT"]
TOKEN = os.environ["TOKEN"]

BASE = (
    "https://firebaseapphosting.googleapis.com/v1beta/projects/"
    f"{PROJECT}/locations/{LOCATION}/backends/{BACKEND}"
)


def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": "Bearer " + TOKEN})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    builds = get("/builds?pageSize=30").get("builds", [])
    build_id = None
    for b in builds:
        if b.get("source", {}).get("codebase", {}).get("hash") == COMMIT:
            build_id = b["name"].split("/")[-1]
            break

    if not build_id:
        print("PENDING||")
        return

    rollouts = get("/rollouts?pageSize=30").get("rollouts", [])
    for r in rollouts:
        if r.get("build", "").split("/")[-1] == build_id:
            print(f"{r.get('state', '')}|{r['name'].split('/')[-1]}|")
            return

    print("PENDING||")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001 — reporta como pendente e volta a tentar
        print("PENDING||", file=sys.stdout)
        print(f"aviso: {e}", file=sys.stderr)
