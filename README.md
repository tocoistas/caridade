<h1 align="center">🤝 Projeto Caridade</h1>

<p align="center">
  Uma plataforma solidária focada em facilitar doações, conectar voluntários e apoiar beneficiários.
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre o Projeto</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-como-começar">Como Começar</a> •
  <a href="#-como-contribuir">Como Contribuir</a>
</p>

---

## ✨ Sobre o Projeto

O **Projeto Caridade** foi criado com o objetivo central de facilitar ações solidárias. Através da plataforma, doadores podem oferecer recursos financeiros ou materiais de forma simples e rápida. A aplicação também centraliza a inscrição de novos voluntários e o cadastro de indivíduos ou famílias que precisam de doações, ligando quem quer ajudar a quem precisa de ajuda.

## 🚀 Funcionalidades

- **💸 Doações Financeiras:** Interface fácil para contribuições monetárias seguras.
- **📦 Doação de Bens:** Registo e organização de donativos materiais (roupas, alimentos, etc.).
- **🙋 Voluntariado:** Formulário prático de inscrição para novos voluntários.
- **📝 Cadastro de Beneficiários:** Sistema para registar as necessidades de pessoas e famílias.
- **📞 Contacto:** Canal direto para comunicação com a organização.
- **🔐 Área de Administração:** Painel protegido (`/admin`) para a equipa consultar e exportar os cadastros submetidos.

## 🛠 Tecnologias

Um stack moderno para uma causa nobre:

- **[Next.js](https://nextjs.org/)** - Framework React com App Router
- **[React](https://reactjs.org/)** - Biblioteca principal
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização elegante e responsiva
- **[Firebase](https://firebase.google.com/)** - Backend as a Service (Armazenamento e BD)

## 🔐 Área de Administração

Os dados submetidos nos formulários (voluntários, beneficiários, contactos e
inscrições na newsletter) são gravados no **Firestore**. Por segurança, as
regras (`firestore.rules`) **não permitem a leitura pública** — só um
administrador autenticado pode consultar os registos.

A consulta é feita na rota protegida **`/admin`**, que exige início de sessão
com e-mail e palavra-passe (Firebase Authentication) e apresenta os cadastros
organizados por tipo, com pesquisa e exportação para CSV.

### Como criar um administrador

Não existe registo público de administradores — as contas são criadas
manualmente na consola do Firebase:

1. No **Firebase Console → Authentication**, ative o método
   *E-mail/Palavra-passe* e crie um utilizador (e-mail + palavra-passe).
2. Copie o **UID** do utilizador criado.
3. No **Firestore** (base de dados `caridade`), crie uma coleção chamada
   **`admins`** e, dentro dela, um documento cujo **ID é exatamente esse UID**
   (o conteúdo do documento é irrelevante — pode ficar vazio).
4. Aceda a `/admin`, inicie sessão e passará a ver o painel de cadastros.

> As regras de segurança verificam a existência de `admins/{uid}` para
> autorizar a leitura, pelo que remover o documento revoga imediatamente o
> acesso dessa conta.

Não esqueça de publicar as regras após alterações: `firebase deploy --only firestore:rules`.

## 💻 Como Começar

### Pré-requisitos
Certifique-se de que tem o seguinte instalado na sua máquina:
- [Node.js](https://nodejs.org/) (versão mais recente recomendada)
- Git

Terá também de criar e configurar um projeto no [Firebase](https://firebase.google.com/) para as variáveis de ambiente.

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/tocoistas/caridade.git
```

2. Entre no diretório do projeto:
```bash
cd caridade
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. O projeto estará disponível em `http://localhost:3000`.

## 🤝 Como Contribuir

Toda a ajuda é muito bem-vinda e apreciada! Seja a resolver um bug, sugerir ideias ou adicionar uma funcionalidade, a sua contribuição faz a diferença. ❤️

1. Faça um **Fork** deste projeto.
2. Crie a sua Branch para a nova funcionalidade:
```bash
git checkout -b feature/MinhaNovaFuncionalidade
```
3. Faça as alterações e commit:
```bash
git commit -m "feat: Adiciona uma nova interface para voluntários"
```
> **Nota de boas práticas:** *Por favor, escreva sempre as suas mensagens de commit em português.*

4. Faça o Push para a sua branch:
```bash
git push origin feature/MinhaNovaFuncionalidade
```
5. Abra um **Pull Request** no GitHub detalhando a sua alteração.

<p align="center">
  <i>Construído com solidariedade. Participe na nossa comunidade!</i>
</p>
