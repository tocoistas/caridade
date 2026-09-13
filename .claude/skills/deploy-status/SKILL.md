---
name: deploy-status
description: Verificar o deploy de produção do site no Firebase App Hosting (backend 'caridade', europe-west4) após um merge em main — workflow de monitorização, rollout do commit exacto e verificação HTTP de caridade.ao. Usar após merges ou quando o site parece desactualizado/em baixo.
---

# Estado do deploy (Firebase App Hosting)

O único alvo de deploy é o **Firebase App Hosting** (Cloud Run), ligado ao GitHub:
cada push em `main` cria um rollout. O workflow
`.github/workflows/firebase-apphosting.yml` apenas **monitoriza** esse rollout
(associa-o ao commit exacto via `.github/scripts/check_rollout.py`).
Não existe deploy para GitHub Pages.

| Item | Valor |
|---|---|
| Projecto | `insjcm` |
| Backend | `caridade` (`europe-west4`) |
| URL técnico | `https://caridade--insjcm.europe-west4.hosted.app` |
| Domínio | `https://caridade.ao` |
| Config | `apphosting.yaml` (runConfig + env `NEXT_PUBLIC_*`) |

## Verificar

```bash
sha=$(git rev-parse origin/main)
gh run list --workflow "Deploy para Firebase App Hosting" --limit 3
gh run watch "$(gh run list --workflow 'Deploy para Firebase App Hosting' --commit "$sha" --json databaseId --jq '.[0].databaseId')" --exit-status
firebase apphosting:backends:list --project insjcm
curl -sI https://caridade.ao | head -5
curl -s https://caridade.ao/robots.txt
```

## Falhas comuns

- **`npm ci` falha no build** → lockfile dessincronizado (regenerar com `npm install`, PR).
- **Tempo limite no workflow** → o rollout pode continuar; confirmar na consola Firebase → App Hosting.
- **Erro de env em build** → variável `NEXT_PUBLIC_*` em falta em `apphosting.yaml` (precisa de `BUILD` e `RUNTIME`).
- Regras Firestore **não** fazem parte deste deploy (ver skill `firestore-rules`).
