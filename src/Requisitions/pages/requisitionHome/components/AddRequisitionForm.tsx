/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useContext } from "react";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  TextField,
} from "@mui/material";
import {
  Project,
  fetchAllProjects,
  fetchAllTypes,
  postRequisition,
} from "../../../utils";
import { ProductsTableModal } from "../../../components/modals/ProductsTableModal/ProductsTableModal";
import { ItemsContext } from "../../../context/ItemsContext";
import { userContext } from "../../../context/userContext";
import { Requisition, RequisitionType } from "../../../types";
import { BaseButtonStyles } from "../../../../utilStyles";

interface ProjectOption {
  label: string;
  id: number;
}

interface TypeOption {
  label: string;
  id: number;
}

const AddRequisitionForm: React.FC = () => {
  const [fields, setFields] = useState<Partial<Requisition>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [types, setTypes] = useState<RequisitionType[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);

  const { user } = useContext(userContext);
  const { toggleAdding } = useContext(ItemsContext);

  useEffect(() => {
    async function performAsync() {
      const projectData = await fetchAllProjects();
      const typeData = await fetchAllTypes();
      if (projectData) {
        setProjects(projectData);
      }
      if (typeData) {
        setTypes(typeData);
      }
    }
    performAsync();
  }, []);

  const handleSelectProject = (
    event: React.SyntheticEvent<Element, Event>,
    value: ProjectOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<ProjectOption>
  ) => {
    console.log("Projeto selecionado:", value, event, reason, details);
    if (value) {
      setFields((prev) => ({
        ...prev,
        ID_PROJETO: value.id,
      }));
    }
  };

  const handleSelectType = (
    event: React.SyntheticEvent<Element, Event>,
    value: TypeOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<TypeOption>
  ) => {
    console.log("Tipo selecionado:", value, event, reason, details);
    if (value) {
      setFields((prev) => ({
        ...prev,
        TIPO: value.id,
      }));
    }
  };

  const renderProjectOptions = (): ProjectOption[] => {
    return projects.map((project) => ({
      label: String(project.DESCRICAO),
      id: project.ID,
    }));
  };

  const renderTypeOptions = (): TypeOption[] => {
    return types.map((type) => ({
      label: String(type.nome_tipo),
      id: type.id_tipo_requisicao,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const getBrazilianDateTime = (): string => {
    const now = new Date();
    const opcoes = {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    } as const;
    const dateTimeInBrazil = now
      .toLocaleString("sv-SE", opcoes)
      .replace(" ", "T");
    return `${dateTimeInBrazil}.000Z`; // Adiciona milissegundos para compatibilidade com ISO
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      if (currentId === 0) {
        const requisitionData: Requisition = {
          ID_REQUISICAO: 0, // Será gerado pelo backend
          DESCRIPTION: fields.DESCRIPTION || "",
          ID_PROJETO: fields.ID_PROJETO || 0,
          ID_RESPONSAVEL: user.CODPESSOA,
          OBSERVACAO: fields.OBSERVACAO || null,
          TIPO: fields.TIPO || 0,
          criado_por: user.CODPESSOA,
          alterado_por: user.CODPESSOA,
          data_alteracao: getBrazilianDateTime(),
          data_criacao: getBrazilianDateTime(),
          id_status_requisicao: 1, // Assumindo que "Em edição" é o status inicial com ID 1
        };

        const response = await postRequisition(requisitionData);
        if (response) {
          setCurrentId(Number(response.data));
        }

        toggleAdding();
      } else {
        toggleAdding();
      }
    }
  };

  return (
    <form className="max-w-sm mx-auto mt-5 w-[90%]" onSubmit={handleSubmit}>
      <Box className="mb-5">
        <label
          htmlFor="selectProject"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Projeto
        </label>
        <Autocomplete
          disablePortal
          id="selectProject"
          options={renderProjectOptions()}
          getOptionLabel={(option) => option.label}
          onChange={handleSelectProject}
          renderInput={(params) => <TextField {...params} label="Projeto" />}
        />
      </Box>

      <Box className="mb-5">
        <label
          htmlFor="selectType"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Tipo da Requisição
        </label>
        <Autocomplete
          disablePortal
          id="selectType"
          options={renderTypeOptions()}
          getOptionLabel={(option) => option.label}
          onChange={handleSelectType}
          renderInput={(params) => <TextField {...params} label="Tipo" />}
        />
      </Box>

      <Box className="mb-5">
        <label
          htmlFor="DESCRIPTION"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Descrição
        </label>
        <TextField
          multiline
          sx={{ width: "100%" }}
          type="text"
          id="DESCRIPTION"
          placeholder="Descrição..."
          required
          onChange={handleChange}
          value={fields.DESCRIPTION || ""}
        />
      </Box>

      <Button sx={{ ...BaseButtonStyles }} type="submit">
        Seguir
      </Button>
      {currentId > 0 && <ProductsTableModal requisitionID={currentId} />}
    </form>
  );
};

export default AddRequisitionForm;
