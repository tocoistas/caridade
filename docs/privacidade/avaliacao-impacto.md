# Avaliação de impacto sobre a protecção de dados (AIPD / DPIA) — resumo

> Rascunho técnico da AIPD exigida pelo RGPD art. 35.º para tratamento em larga escala de categorias
> especiais de dados e de pessoas vulneráveis. Deve ser concluída e assinada pelo responsável pelo
> tratamento com apoio jurídico. Em Angola, o tratamento de dados sensíveis está sujeito a regime
> reforçado pela Lei n.º 22/11 (incluindo, em regra, autorização prévia da APD — confirmar).

## 1. Descrição do tratamento

| Item | Descrição |
|---|---|
| Finalidade | Identificar pessoas e famílias em situação de vulnerabilidade e prestar apoio (bens, saúde, ligação a doadores) |
| Titulares | Beneficiários (adultos; agregados com menores — só contagens), voluntários, profissionais de saúde, doadores |
| Dados | Identificação (nome, n.º de documento, data de nascimento), contactos, morada, composição do agregado, **situação social**, **necessidades de saúde**, pedidos de apoio, registos de entregas e referenciações |
| Categorias especiais | Dados de saúde (RGPD art. 9.º) e dados que revelam situação de vulnerabilidade económica/social |
| Sistemas | Next.js no Firebase App Hosting (Cloud Run, europe-west4), Firestore `caridade`, app Android, exportações CSV |
| Acesso | Só pelo servidor; autorização por papel (admin, coordenador, voluntário, profissional, beneficiário) |

## 2. Necessidade e proporcionalidade

- **Fundamento de licitude**: consentimento explícito do titular (RGPD art. 6.º, n.º 1, al. a) e art. 9.º, n.º 2,
  al. a)); para registos operacionais internos, interesse legítimo/actividade de organização sem fins lucrativos
  (art. 9.º, n.º 2, al. d)) — a validar juridicamente.
- **Minimização**: agregado familiar só em contagens; tipos de apoio em lista fechada; texto livre limitado
  (≤ 5000 caracteres) e com aviso para não incluir diagnósticos detalhados.
- **Exactidão**: rectificação a pedido; gestão pode corrigir.
- **Conservação**: ver `retencao.md` (anonimização após 60 meses).
- **Transparência**: aviso junto do formulário + política de privacidade + consentimento separado para dados sensíveis.

## 3. Riscos e medidas

| Risco | Probabilidade | Gravidade | Medidas existentes | Risco residual |
|---|---|---|---|---|
| Acesso indevido por conta comprometida | Média | Alta | scrypt, limites de tentativas, sessões revogáveis, suspensão, códigos de uso único, papéis com menor privilégio, dados confidenciais (Eixo 3) só para gestão | Médio → Baixo com 2FA (recomendado) |
| Escalada de privilégios / acesso directo à base | Baixa | Alta | Firestore deny-all; autorização no servidor; esquemas estritos; testes e2e e de regras no CI | Baixo |
| Fuga por exportação CSV | Média | Alta | Exportação só para quem vê a colecção; protecção contra injecção de fórmulas; orientação de apagar após uso | Médio — recomendada marca de água/registo de exportações |
| Divulgação a terceiros (subcontratantes) | Baixa | Média | Google Cloud/Firebase com DPA e cláusulas contratuais-tipo; região UE para hosting | Baixo |
| Transferência internacional sem garantias (Angola ↔ UE) | Média | Média | Documentar transferências; pedir autorização à APD quando exigido | A validar juridicamente |
| Rastreamento sem consentimento (analytics) | — | Média | Google Analytics só após consentimento (Consent Mode com recusa por omissão) | Baixo |
| Estigmatização / uso indevido de dados sociais pela equipa | Baixa | Alta | Formação, compromisso de confidencialidade, acesso por papel | Baixo |
| Perda de disponibilidade | Baixa | Média | Infraestrutura gerida; recomendada activação de PITR e backups do Firestore | Médio → Baixo com PITR |

## 4. Recomendações pendentes

1. Designar responsável de privacidade (e avaliar necessidade de DPO — RGPD art. 37.º).
2. Notificação/pedido de autorização à **APD** para tratamento de dados sensíveis e transferências (Lei n.º 22/11).
3. Activar **Point-in-Time Recovery** e backups agendados do Firestore `caridade`.
4. Autenticação de dois factores para papéis `admin` e `coordenador`.
5. Registo de auditoria de acessos a colecções confidenciais e exportações.
6. Termo de confidencialidade assinado por voluntários e profissionais com acesso a dados.
7. Revisão anual desta avaliação.
