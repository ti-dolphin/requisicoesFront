import { User } from "../User";

export type UserEditFormState = {
  NOME: string;
  EMAIL: string;
  ATIVO: boolean;
  PERM_LOGIN: boolean;
  PERM_REQUISITAR: boolean;
  PERM_COMERCIAL: boolean;
  PERM_COMPRADOR: boolean;
  PERM_RH: boolean;
  PERM_ADMINISTRADOR: boolean;
};

// Converte um usuário do banco no estado do formulário de edição.
// PERM_RH é derivado de PERM_GESTAO_PESSOAS (representante do grupo RH).
export const mapUserToEditForm = (user: User): UserEditFormState => ({
  NOME: user.NOME ?? "",
  EMAIL: user.EMAIL ?? "",
  ATIVO: Boolean(user.ATIVO),
  PERM_LOGIN: Boolean(user.PERM_LOGIN),
  PERM_REQUISITAR: Number(user.PERM_REQUISITAR) === 1,
  PERM_COMERCIAL: Number(user.PERM_COMERCIAL) === 1,
  PERM_COMPRADOR: Number(user.PERM_COMPRADOR) === 1,
  PERM_RH: Boolean(user.PERM_GESTAO_PESSOAS),
  PERM_ADMINISTRADOR: Number(user.PERM_ADMINISTRADOR) === 1,
});

// Monta o payload de atualização. O checkbox "RH" expande para o grupo de
// permissões de gestão de pessoas (mesma lógica da tela de cadastro).
export const buildEditPayload = (form: UserEditFormState): Partial<User> => {
  const rhPermissions = {
    PERM_APONT: form.PERM_RH,
    PERM_STATUS_APONT: form.PERM_RH,
    PERM_GESTAO_PESSOAS: form.PERM_RH,
    PERM_CONTROLE_RECESSO: form.PERM_RH,
    PERM_PONTO: form.PERM_RH,
    PERM_APONTAMENTO_PONTO: form.PERM_RH,
    PERM_APONTAMENTO_PONTO_JUSTIFICATIVA: form.PERM_RH,
    PERM_BANCO_HORAS: form.PERM_RH,
    PERM_FOLGA: form.PERM_RH,
  };

  return {
    ...rhPermissions,
    NOME: form.NOME,
    EMAIL: form.EMAIL,
    ATIVO: form.ATIVO,
    PERM_LOGIN: form.PERM_LOGIN,
    PERM_REQUISITAR: form.PERM_REQUISITAR ? 1 : 0,
    PERM_COMERCIAL: form.PERM_COMERCIAL ? 1 : 0,
    PERM_COMPRADOR: form.PERM_COMPRADOR ? 1 : 0,
    PERM_ADMINISTRADOR: form.PERM_ADMINISTRADOR ? 1 : 0,
  };
};
