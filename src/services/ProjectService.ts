import api from '../api';
import { Client } from '../models/oportunidades/Client';
import { ProjectFollower } from '../models/oportunidades/ProjectFollower';
import { Project } from '../models/Project';

const API_ENDPOINT = 'projetos';


export const ProjectService = {
  async getMany(params?: any): Promise<Project[]> {
    const response = await api.get<Project[]>(`/${API_ENDPOINT}`, {
      params: params,
    });
    return response.data;
  },

  async getById(id: number): Promise<Project> {
    const response = await api.get<Project>(`/${API_ENDPOINT}/${id}`);
    return response.data;
  },

  async create(project: Omit<Project, "id">): Promise<Project> {
    const response = await api.post<Project>(`/${API_ENDPOINT}`, project);
    return response.data;
  },

  async addFollower(id_projeto: number, id_seguidor: number): Promise<ProjectFollower> {
    const response = await api.post<ProjectFollower>(
      `/${API_ENDPOINT}/${id_projeto}/seguidores`,
      {
        codpessoa: id_seguidor,
        id_projeto: id_projeto,
      }
    );
    return response.data;
  },

  async getClient(id: number): Promise<Client | null> {
    const response = await api.get<Client | null>(
      `/${API_ENDPOINT}/${id}/cliente`
    );
    return response.data;
  },

  async getFollowers(ID: number): Promise<ProjectFollower[]> {
    const response = await api.get<ProjectFollower[]>(
      `/${API_ENDPOINT}/${ID}/seguidores`
    );
    return response.data;
  },

  async deleteFollower(id_seguidor_projeto: number, ID: number) {
        const response = await api.delete(`/${API_ENDPOINT}/${ID}/seguidores/${id_seguidor_projeto}`);
        return response.data;
  },
    

  async update(id: number, project: Partial<Project>): Promise<Project> {
    const response = await api.put<Project>(`/${API_ENDPOINT}/${id}`, project);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/${API_ENDPOINT}/${id}`);
  },
};