# Prazos de conservação (retenção)

> Proposta técnica baseada nos princípios da limitação da conservação (RGPD art. 5.º, n.º 1, al. e)) e da
> proporcionalidade da Lei n.º 22/11. **Os prazos têm de ser validados pela direcção e por assessoria jurídica**
> (em especial eventuais obrigações contabilísticas/fiscais ligadas a donativos).
>
> Aplicação: `node scripts/admin/aplicar-retencao.mjs` (ensaio por omissão; `--aplicar` para executar),
> recomendada mensalmente. Coleções técnicas usam política TTL do Firestore.

| Coleção | Dados | Prazo | Depois do prazo | Referência temporal |
|---|---|---|---|---|
| `contactos` | Mensagens de contacto | **24 meses** | Eliminar | `createdAt` |
| `newsletter_subscriptions` | E-mail | Até retirada do consentimento; revisão a cada **24 meses** sem interacção | Eliminar | `subscribedAt` |
| `voluntarios` | Inscrição de voluntário | **36 meses** | Eliminar | `createdAt` |
| `beneficiarios` | Cadastro (inclui dados sensíveis) | **60 meses** após o último apoio | Anonimizar (manter só país e contagens agregadas) | `createdAt` |
| `pedidosApoio` | Pedidos do beneficiário | **60 meses** | Anonimizar | `criadoEm` |
| `distribuicoes`, `campanhas`, `stock` | Operações do Eixo 1 | **60 meses** (prestação de contas) | Anonimizar nomes/contactos | `criadoEm` |
| `referencias`, `accoesPrevcao` | Eixo 2 | **60 meses** | Anonimizar nomes | `criadoEm` |
| `necessidades`, `doacoesEspecificas` | Eixo 3 (confidencial) | **60 meses** | Anonimizar | `criadoEm` |
| `profissionaisVoluntarios` | Profissionais | **36 meses** após fim da colaboração | Eliminar | `criadoEm` |
| `utilizadores` | Contas | Enquanto activas; **24 meses** sem login → aviso e eliminação | Eliminar (+ `emails`, `sessoes`) | `ultimoLoginEm` |
| `pedidosTitulares` | Pedidos de direitos | **36 meses** após conclusão | Eliminar | `createdAt` |
| `sessoes` | Sessões | 7 dias (web) / 30 dias (app) | TTL automático | `expiraEm` |
| `limites` | Contadores anti-abuso (hash) | ≤ 1 hora | TTL automático | `expiraEm` |
| Registos do servidor (Cloud Logging) | IP, caminho, erros | 30 dias (retenção por omissão do projecto) | Automático | — |
| Exportações CSV locais | Qualquer | Apagar após o uso; nunca guardar em pastas partilhadas | — | — |

## Regras

- Anonimizar = remover ou substituir nome, contactos, documento de identificação, morada e texto livre;
  manter apenas dados necessários a estatísticas agregadas.
- Um pedido de eliminação do titular prevalece sobre estes prazos, salvo obrigação legal (documentar).
- Alterar um prazo ⇒ actualizar este ficheiro, `registo-actividades-tratamento.md`, a política de privacidade
  (`messages/pt.json` → `privacidade`) e o script de retenção na mesma PR.
