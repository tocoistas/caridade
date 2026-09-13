# Registo das actividades de tratamento (RAT)

> Registo exigido pelo RGPD art. 30.º e base para a notificação/autorização junto da Agência de Protecção
> de Dados de Angola (Lei n.º 22/11). Mantido pela equipa técnica; **validar com a direcção e assessoria jurídica**.
> Última revisão técnica: 2026-09-13.

## Responsável pelo tratamento

| Item | Valor |
|---|---|
| Denominação | Projecto Caridade — `[a preencher: denominação legal e forma jurídica]` |
| Identificação fiscal | `[a preencher]` |
| Morada | `[a preencher — morada legal]` |
| Contacto para privacidade | info@caridade.ao |
| Responsável de privacidade / DPO | `[a designar]` |

## Infraestrutura e localização dos dados

| Componente | Fornecedor | Localização | Notas |
|---|---|---|---|
| Aplicação web (SSR + API) | Google Cloud — Firebase App Hosting / Cloud Run | UE — `europe-west4` (Países Baixos) | Processa pedidos; não guarda dados de forma persistente |
| Base de dados Firestore `caridade` | Google Cloud | **África — `africa-south1` (Joanesburgo, África do Sul)** | Todos os dados pessoais; PITR **desactivado** (recomendado activar) |
| Registos do servidor | Google Cloud Logging | Global/UE (configuração do projecto) | IP, caminho, códigos de erro; sem corpos de pedidos |
| Analytics (só com consentimento) | Google Analytics 4 | EUA/global (Google LLC) | Consent Mode, IP anonimizado |
| App Android | Dispositivo do utilizador | — | Token de sessão em armazenamento privado |

Transferências decorrentes: titulares em Angola/UE → processamento na UE → armazenamento na África do Sul;
analytics → EUA. Ver `subcontratantes.md` e validar garantias (cláusulas contratuais-tipo da Google; autorização da APD
para transferências a partir de Angola, quando exigida).

## Actividades

### A1 — Inscrição de voluntários
| Campo | Descrição |
|---|---|
| Finalidade | Receber e gerir candidaturas de voluntariado |
| Titulares | Candidatos a voluntário |
| Dados | Nome, e-mail, país, telefone, área de interesse, mensagem |
| Base legal | Consentimento (RGPD 6.º/1/a) e diligências pré-contratuais a pedido do titular (6.º/1/b) |
| Origem / coleção | Formulário `/voluntario` → `voluntarios` |
| Acesso | Admin, coordenador |
| Conservação | 36 meses |

### A2 — Cadastro de beneficiários
| Campo | Descrição |
|---|---|
| Finalidade | Avaliar e prestar apoio a pessoas e famílias em vulnerabilidade |
| Titulares | Beneficiários (e agregado — só contagens) |
| Dados | Identificação (nome, n.º documento, data de nascimento), contactos, morada, n.º adultos/crianças, **situação e necessidades (inclui saúde)**, tipos de apoio |
| Categorias especiais | Sim — saúde e situação social (RGPD art. 9.º; dados sensíveis na Lei n.º 22/11) |
| Base legal | Consentimento explícito (6.º/1/a + 9.º/2/a) |
| Origem / coleção | Formulário `/cadastro-beneficiario` e app (Eixo 1) → `beneficiarios` |
| Acesso | Admin, coordenador |
| Conservação | 60 meses após último apoio, depois anonimização |
| AIPD | Sim — `avaliacao-impacto.md` |

### A3 — Mensagens de contacto
| Finalidade | Responder a pedidos de informação |
|---|---|
| Dados | Nome, e-mail, país, telefone, assunto, mensagem |
| Base legal | Interesse legítimo em responder / consentimento |
| Coleção | `contactos` · Acesso: admin, coordenador · Conservação: 24 meses |

### A4 — Newsletter
| Finalidade | Enviar novidades sobre a actividade |
|---|---|
| Dados | E-mail |
| Base legal | Consentimento (retirável a qualquer momento) |
| Coleção | `newsletter_subscriptions` · Acesso: admin, coordenador · Conservação: até retirada |

### A5 — Contas do portal
| Finalidade | Autenticar e autorizar o acesso ao portal por papel |
|---|---|
| Titulares | Beneficiários, voluntários, profissionais, coordenadores, administradores |
| Dados | Nome, e-mail, papel, estado, hash da palavra-passe (scrypt), sessões (hash do token, cliente, validade), último login, registos anti-abuso (hash) |
| Base legal | Execução do serviço pedido pelo titular (6.º/1/b); segurança (6.º/1/f) |
| Coleções | `utilizadores`, `emails`, `sessoes`, `limites` · Acesso: o próprio; admin (gestão) · Conservação: `retencao.md` |

### A6 — Pedidos de apoio
| Finalidade | Beneficiários pedem e acompanham apoio |
|---|---|
| Dados | Título, descrição (pode conter dados sensíveis), estado, identificação do beneficiário |
| Base legal | Consentimento explícito (9.º/2/a) |
| Coleção | `pedidosApoio` · Acesso: o próprio; admin, coordenador · Conservação: 60 meses → anonimização |

### A7 — Operação dos eixos (registos internos)
| Finalidade | Gerir campanhas, stock, entregas (Eixo 1); profissionais, referenciações, prevenção (Eixo 2); necessidades confidenciais e doações específicas (Eixo 3) |
|---|---|
| Dados | Nomes e contactos de doadores/beneficiários/voluntários, descrições, **motivos de referenciação e necessidades (podem incluir saúde)**, n.º de cédula profissional |
| Base legal | Interesse legítimo / actividade legítima de organização sem fins lucrativos com garantias (9.º/2/d) — **validar juridicamente** |
| Coleções | `campanhas`, `stock`, `distribuicoes`, `profissionaisVoluntarios`, `referencias`, `accoesPrevcao`, `necessidades`, `doacoesEspecificas` |
| Acesso | Por papel (`ROLE_CAPS`); Eixo 3 só admin/coordenador |
| Conservação | 36–60 meses → anonimização |

### A8 — Pedidos dos titulares
| Finalidade | Cumprir direitos de acesso, rectificação, eliminação, oposição, portabilidade |
|---|---|
| Dados | Nome, e-mail, tipo de pedido, descrição, estado |
| Base legal | Obrigação legal (6.º/1/c) |
| Coleção | `pedidosTitulares` · Acesso: admin · Conservação: 36 meses após conclusão |

### A9 — Estatísticas de utilização (analytics)
| Finalidade | Medir audiência do site para o melhorar |
|---|---|
| Dados | Identificadores de cookie, páginas visitadas, dados técnicos do dispositivo |
| Base legal | Consentimento (6.º/1/a; Directiva 2002/58/CE art. 5.º/3) |
| Destinatário | Google Analytics 4 · Conservação: 14 meses (configurar na propriedade GA) |

## Medidas técnicas e organizativas (resumo — RGPD art. 32.º)

- Acesso a dados só pelo servidor; regras Firestore deny-all; autorização por papel com menor privilégio.
- Palavras-passe com scrypt; sessões opacas revogáveis; limites de tentativas; protecção CSRF; cabeçalhos de segurança.
- Validação estrita de entradas; nenhum segredo no repositório público; análise de dependências e segredos no CI.
- TLS em trânsito; encriptação em repouso gerida pela Google.
- Processo de PR com revisão e testes automáticos; procedimentos de violação e de pedidos dos titulares.
- Pendentes: PITR/backups, 2FA para gestão, registo de auditoria de acessos (ver `avaliacao-impacto.md`).
