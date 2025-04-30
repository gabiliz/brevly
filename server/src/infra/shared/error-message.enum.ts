export enum ErrorMessages {
  SHORT_URL_ALREADY_EXISTS = 'Essa URL encurtada já existe.',
  INVALID_INPUT = 'Os dados de entrada são inválidos.',
  INVALID_LINK_DATA = 'O link inserido é inválido.',

  LINK_NOT_FOUND = 'Link não encontrado.',

  DELETE_FAILED = 'Houve um erro ao deletar o link.',
  UPDATE_FAILED = 'Houve um erro ao incrementar o acesso ao link.',

  UNEXPECTED_ERROR = 'Ocorreu um erro inesperado.',
  DATABASE_CONNECTION_FAILED = 'Conexão com o banco de dados falhou.',
  UNAUTHORIZED_ACCESS = 'Acesso não autorizado.',
  FORBIDDEN = 'Acesso negado.',
}
