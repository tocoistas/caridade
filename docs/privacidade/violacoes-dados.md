# Procedimento de resposta a violações de dados pessoais

> Documento operacional interno. Aplica-se a qualquer incidente que afecte a
> confidencialidade, integridade ou disponibilidade de dados pessoais tratados pelo
> Projecto Caridade (web, app Android, Firestore `caridade`, exportações CSV).
> **Rever com assessoria jurídica** antes de o dar como definitivo.

## Enquadramento

| Regime | Obrigação principal |
|---|---|
| RGPD (UE) 2016/679, art. 33.º | Notificar a autoridade de controlo competente **sem demora injustificada e, se possível, até 72 horas** após ter conhecimento, salvo se a violação não for susceptível de resultar num risco para os direitos e liberdades |
| RGPD, art. 34.º | Comunicar aos titulares **sem demora injustificada** quando o risco for elevado |
| RGPD, art. 33.º, n.º 5 | Documentar **todas** as violações (factos, efeitos, medidas), mesmo as não notificadas |
| Lei n.º 22/11 (Angola) | Garantir a segurança e confidencialidade do tratamento e colaborar com a Agência de Protecção de Dados (APD); confirmar com assessoria jurídica o prazo e a forma de comunicação à APD |

## Exemplos de violação

- Acesso indevido ao painel `/admin` ou à API (credenciais comprometidas, sessão roubada).
- Exportação CSV com dados de beneficiários partilhada fora da equipa.
- Regras Firestore publicadas por engano com acesso de clientes.
- Credenciais do Google Cloud/Firebase expostas; perda de telemóvel com a app autenticada.
- Eliminação acidental de registos (disponibilidade).

## Fases

### 1. Detecção e registo (imediato)
- Quem detecta avisa de imediato o **responsável de privacidade** (a designar — ver `README.md`) e o administrador técnico.
- Abrir registo no ficheiro interno de incidentes (fora do repositório público): data/hora de detecção, descrição, sistemas, quem reportou.

### 2. Contenção (primeiras horas)
| Situação | Acção |
|---|---|
| Conta comprometida | Admin → *Utilizadores* → **Suspender** (revoga todas as sessões) → emitir código de acesso novo |
| Admin comprometido | `node scripts/admin/bootstrap-admin.mjs --email <e-mail> --reset` (revoga sessões) |
| Suspeita de sessões roubadas em massa | Apagar a colecção `sessoes` (todas as pessoas voltam a iniciar sessão) |
| Regras abertas por engano | `firebase deploy --only firestore:rules` com a versão deny-all de `main` |
| Credenciais de cloud expostas | Revogar/rodar na consola Google Cloud (IAM), rever registos de auditoria |
| Código vulnerável | PR `security/…` com correcção (skill `security-audit`), deploy imediato |

### 3. Avaliação do risco (até 24 h)
Considerar: tipo de dados (dados de saúde/situação social de beneficiários = **risco elevado**), volume,
identificabilidade, possibilidade de dano (discriminação, fraude, dano reputacional, segurança física),
dados encriptados ou não, pessoas vulneráveis ou menores envolvidos.

| Risco | Notificar autoridade | Comunicar titulares |
|---|---|---|
| Improvável | Não (documentar) | Não |
| Provável | Sim | Não obrigatório |
| Elevado | Sim | Sim |

### 4. Notificação (até 72 h)
Conteúdo mínimo (RGPD art. 33.º, n.º 3): natureza da violação, categorias e número aproximado de titulares e
registos, contacto do responsável de privacidade, consequências prováveis, medidas adoptadas ou propostas.
Se não houver toda a informação, notificar por fases.

Autoridades a considerar (confirmar com assessoria jurídica):
- **Angola** — Agência de Protecção de Dados (APD).
- **UE** — autoridade de controlo do Estado-Membro onde estejam os titulares afectados ou do estabelecimento principal.

### 5. Comunicação aos titulares
Linguagem clara, pelo canal de contacto disponível (telefone/e-mail indicado no registo), com: o que aconteceu,
dados afectados, riscos, o que fizemos, o que a pessoa pode fazer, contacto.

### 6. Pós-incidente (até 30 dias)
- Análise de causa-raiz e PR(s) de correcção; actualizar este procedimento, `registo-actividades-tratamento.md`
  e, se aplicável, a avaliação de impacto.
- Rever acessos (princípio do menor privilégio), formação da equipa.

## Contactos (preencher — manter fora do repositório público se forem pessoais)

| Função | Contacto |
|---|---|
| Responsável de privacidade | `[a designar]` — canal público: info@caridade.ao |
| Administrador técnico | `[a designar]` |
| Assessoria jurídica | `[a designar]` |
