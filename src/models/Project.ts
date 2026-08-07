import { ReducedUser } from "./User";

export interface Project {
  ID: number;
  DESCRICAO: string;
  CODGERENTE: number;
  ATIVO: number;
  ID_RESPONSAVEL: number;

  responsavel? : ReducedUser
}

export interface ProjectResponsaveisPayload {
  CODGERENTE: number | null;
  ID_RESPONSAVEL: number | null;
}
