# Privacidade e protecção de dados — visão geral

O Projecto Caridade trata dados pessoais de pessoas em situação de vulnerabilidade, incluindo dados de saúde.
Este directório reúne o programa de conformidade técnica com:

- **Lei n.º 22/11, de 17 de Junho — Lei da Protecção de Dados Pessoais (Angola)**, fiscalizada pela
  **Agência de Protecção de Dados (APD)**;
- **Regulamento (UE) 2016/679 — RGPD**, aplicável quando se oferecem serviços a pessoas na UE ou se trata dados na UE
  (o site é global e está alojado na UE);
- **Directiva 2002/58/CE (ePrivacy)**, art. 5.º, n.º 3 — consentimento para cookies não essenciais.

> ⚠️ Estes documentos são uma base técnica e organizativa. **Não substituem aconselhamento jurídico.**
> Os pontos marcados `[a preencher]`/`validar juridicamente` têm de ser fechados por quem representa legalmente a organização.

## Documentos

| Documento | Conteúdo |
|---|---|
| [`registo-actividades-tratamento.md`](registo-actividades-tratamento.md) | Finalidades, dados, bases legais, acessos, conservação, localização |
| [`avaliacao-impacto.md`](avaliacao-impacto.md) | AIPD para dados sensíveis de beneficiários |
| [`retencao.md`](retencao.md) | Prazos de conservação e anonimização |
| [`pedidos-titulares.md`](pedidos-titulares.md) | Procedimento para exercício de direitos |
| [`violacoes-dados.md`](violacoes-dados.md) | Resposta a incidentes e notificação (72 h) |
| [`subcontratantes.md`](subcontratantes.md) | Fornecedores e transferências internacionais |

## O que a plataforma implementa

| Requisito | Implementação |
|---|---|
| Transparência (RGPD 12.º–14.º) | Política de privacidade completa e política de cookies em 11 idiomas; aviso junto de cada formulário |
| Consentimento (6.º, 7.º, 9.º) | Caixas não pré-marcadas; consentimento separado para dados sensíveis; versão da política e data gravadas pelo servidor |
| Cookies/analytics (ePrivacy 5.º/3) | Banner com Aceitar/Rejeitar/Personalizar; Google Analytics só após consentimento; preferências reabríveis no rodapé |
| Direitos dos titulares (15.º–22.º) | Página `/direitos-dados` → `pedidosTitulares`; na conta: *Os meus dados* (exportação JSON) e *Eliminar conta* |
| Minimização e retenção (5.º) | Validação estrita de campos; `scripts/admin/aplicar-retencao.mjs`; TTL em sessões e limites |
| Segurança (32.º) | Acesso só pelo servidor, regras deny-all, scrypt, sessões revogáveis, CSRF, cabeçalhos de segurança, CI com auditoria |
| Menores | Registo de contas exige declaração de idade ≥ 16 anos; menores só como contagens no agregado |
| Responsabilização (5.º/2, 30.º, 35.º) | RAT, AIPD, procedimentos e histórico de PRs |

## Checklist organizativa (fora do código)

- [ ] Designar responsável de privacidade (avaliar necessidade de DPO — RGPD art. 37.º).
- [ ] Preencher identificação legal do responsável pelo tratamento.
- [ ] Notificar/obter autorização da **APD** (tratamento de dados sensíveis e transferências internacionais).
- [ ] Validar bases legais, prazos de retenção e textos das políticas com jurista.
- [ ] Aceitar termos de tratamento de dados da Google Cloud e do Google Analytics; retenção GA = 14 meses.
- [ ] Activar PITR e backups do Firestore `caridade`.
- [ ] Termos de confidencialidade para voluntários/profissionais com acesso a dados.
- [ ] Formação anual da equipa; revisão anual destes documentos.
