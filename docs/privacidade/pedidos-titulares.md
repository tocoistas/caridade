# Procedimento para pedidos dos titulares dos dados

> Como responder a pedidos de acesso, rectificação, eliminação, oposição, limitação,
> portabilidade e retirada de consentimento. Rever com assessoria jurídica.

## Direitos

| Direito | RGPD | Como é exercido na plataforma |
|---|---|---|
| Informação | art. 13.º–14.º | Política de privacidade; avisos junto de cada formulário |
| Acesso | art. 15.º | Formulário `/direitos-dados` · conta: *Os meus dados* (exportação JSON) |
| Rectificação | art. 16.º | Formulário `/direitos-dados`; gestão corrige no painel |
| Eliminação ("apagamento") | art. 17.º | Formulário `/direitos-dados` · conta: *Eliminar conta* |
| Limitação | art. 18.º | Formulário `/direitos-dados` |
| Portabilidade | art. 20.º | Conta: exportação JSON; restantes por pedido |
| Oposição | art. 21.º | Formulário `/direitos-dados` |
| Retirada do consentimento | art. 7.º, n.º 3 | Formulário `/direitos-dados`; preferências de cookies no rodapé |
| Reclamação | art. 77.º | Autoridade de controlo (APD em Angola; autoridade da UE competente) |

A Lei n.º 22/11 (Angola) consagra igualmente os direitos de informação, acesso, rectificação, eliminação e
oposição; confirmar prazos e formalidades específicas com assessoria jurídica.

## Prazos

- **Resposta: até 30 dias** após recepção (RGPD art. 12.º, n.º 3), prorrogável por mais 60 dias em casos
  complexos, informando o titular dentro dos primeiros 30 dias.
- Compromisso público actual (página de exclusão de dados): **15 dias úteis** para eliminação — manter como meta.

## Fluxo

1. **Recepção** — pedido chega a `pedidosTitulares` (formulário) ou por e-mail para info@caridade.ao.
   O painel (*Pedidos de titulares*, só administradores) mostra o prazo-limite.
2. **Verificação de identidade** — proporcional ao risco: confirmar pelo contacto (telefone/e-mail) que consta
   nos registos. **Nunca** enviar dados para um contacto diferente do registado sem verificação adicional.
3. **Localizar os dados** — pesquisar por e-mail/telefone/nome em: `voluntarios`, `beneficiarios`, `contactos`,
   `newsletter_subscriptions`, `utilizadores` (+ `pedidosApoio`, `sessoes`, `emails`), registos dos eixos que
   refiram a pessoa (`distribuicoes`, `referencias`, `necessidades`, `doacoesEspecificas`) e exportações CSV locais.
4. **Executar**
   - *Acesso/portabilidade*: exportar JSON dos registos encontrados e entregar por canal seguro.
   - *Rectificação*: corrigir no Firestore (consola) e registar a alteração.
   - *Eliminação*: apagar documentos; se houver obrigação legal ou interesse vital que impeça a eliminação
     (ex.: registo de entrega de bens para prestação de contas), **anonimizar** e explicar ao titular.
     Contas: *Eliminar conta* apaga `utilizadores`, `emails`, `sessoes` e anonimiza `pedidosApoio`.
   - *Oposição/retirada*: parar o tratamento baseado nesse fundamento (ex.: remover da newsletter).
5. **Responder** ao titular com o resultado (ou fundamento da recusa e direito de reclamação).
6. **Fechar** o pedido no painel (estado `concluido`/`recusado`) — o registo do pedido é mantido 3 anos como prova
   de cumprimento, sem cópia dos dados entregues.

## Não fazer

- Pedir mais dados do que os necessários para verificar a identidade.
- Cobrar pela resposta (salvo pedidos manifestamente infundados ou excessivos — RGPD art. 12.º, n.º 5).
- Registar dados sensíveis do pedido em ferramentas externas (chat, e-mail pessoal).
