export default function ExclusaoDados() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-montserrat font-bold text-4xl text-petroleo mb-8">Instruções de Exclusão de Dados</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700">
        <p className="mb-4">
          De acordo com as leis de protecção de dados, o Projecto Caridade garante o seu direito de
          solicitar a exclusão de todas as suas informações pessoais das nossas bases de dados.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">Como solicitar a exclusão?</h2>
        <p className="mb-4">
          Para solicitar a eliminação dos seus dados (tais como os dados de cadastro de beneficiário, inscrições 
          de voluntariado ou contactos), por favor siga os seguintes passos:
        </p>
        
        <ul className="list-decimal pl-8 mb-4 space-y-2">
          <li>
            Envie um e-mail para <strong>info@caridade.ao</strong> com o assunto "Solicitação de Exclusão de Dados".
          </li>
          <li>
            No corpo do e-mail, inclua o seu nome completo e o endereço de e-mail e/ou número de telefone
            que usou nos nossos formulários.
          </li>
          <li>
            Especifique se deseja excluir todos os seus dados ou apenas os de uma secção específica 
            (ex: cancelar a inscrição de voluntariado).
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">Prazo de Processamento</h2>
        <p className="mb-4">
          A nossa equipa processará a sua solicitação o mais rápido possível e num prazo máximo de <strong>15 dias úteis</strong>.
          Irá receber um e-mail de confirmação assim que a exclusão for concluída.
        </p>

        <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">O que acontece após a exclusão?</h2>
        <p className="mb-4">
          Uma vez confirmada a exclusão, os seus dados pessoais serão permanentemente apagados dos nossos sistemas,
          como o Firebase Firestore e bases de dados de e-mail. Se for um caso em andamento (por exemplo, um processo 
          de assistência social), a eliminação dos dados descontinuará o processo e a nossa capacidade de avaliação 
          será interrompida.
        </p>
      </div>
    </div>
  );
}