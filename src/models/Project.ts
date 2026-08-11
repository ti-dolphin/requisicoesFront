import { ReducedUser } from "./User";

export interface Project {
  ID: number;
  DESCRICAO: string;
  CODGERENTE: number;
  ATIVO: number;
  ID_RESPONSAVEL: number;

  responsavel? : ReducedUser
}

export interface ProjectResponsavelPayload {
  ID_RESPONSAVEL: number | null;
}
