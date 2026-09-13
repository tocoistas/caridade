# Subcontratantes e transferências internacionais

> Lista de entidades que tratam dados pessoais por conta do Projecto Caridade (RGPD art. 28.º) e das
> transferências internacionais associadas (RGPD cap. V; Lei n.º 22/11 — transferências para fora de Angola).
> Qualquer novo serviço externo com dados pessoais exige actualização deste ficheiro, do registo de
> actividades e da política de privacidade **antes** de entrar em produção.

| Subcontratante | Serviço | Dados | Localização | Garantias | Estado |
|---|---|---|---|---|---|
| Google Cloud / Firebase (Google LLC; Google Cloud EMEA Ltd.) | App Hosting (Cloud Run) `europe-west4` | Tráfego HTTP, dados em trânsito | Países Baixos (UE) | Termos de tratamento de dados da Google Cloud (CDPA), cláusulas contratuais-tipo | Em uso |
| Google Cloud / Firebase | Firestore `caridade` | Todos os dados pessoais | `africa-south1` — África do Sul | CDPA + cláusulas contratuais-tipo; África do Sul **não** tem decisão de adequação da UE | Em uso — avaliar migração para região UE ou documentar avaliação de impacto da transferência |
| Google Cloud | Cloud Logging | IP, URL, erros | Configuração do projecto | CDPA | Em uso |
| Google LLC | Google Analytics 4 (só com consentimento) | Cookies `_ga*`, uso do site | EUA / global | EU-US Data Privacy Framework, cláusulas contratuais-tipo | Em uso (condicionado ao consentimento) |
| Google LLC | Google Fonts (servidas pelo próprio site via `next/font`) | — (sem pedidos ao Google no browser) | — | — | Sem transferência |
| GitHub, Inc. | Repositório de código e CI | Nenhum dado pessoal de titulares (repositório público sem dados) | EUA | — | Em uso |

## Acções pendentes

1. Aceitar/confirmar os termos de tratamento de dados (CDPA) na consola Google Cloud e Google Analytics.
2. Configurar retenção do Google Analytics em 14 meses e desactivar partilha de dados com a Google para outros fins.
3. Decidir sobre a região do Firestore: manter `africa-south1` (proximidade a Angola) com avaliação de transferência documentada, ou migrar para região UE.
4. Confirmar com assessoria jurídica se as transferências Angola → UE/África do Sul/EUA exigem autorização prévia da APD.
