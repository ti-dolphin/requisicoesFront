/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Project, fetchAllProjects, fetchAllTypes } from "../../../utils";
import { postRequisition } from "../../../utils";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Box,
  Button,
  TextField,
} from "@mui/material";
import React from "react";
import { ProductsTableModal } from "../../../components/modals/ProductsTableModal";
import { useContext } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
import { userContext } from "../../../context/userContext";
import { RequisitionType } from "../../../types";

interface RequisitionFields {
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
  DESCRIPTION: string;
  TIPO : number;
}
interface ProjectOption {
  label: string;
  id: number;
}
interface TypeOption{ 
  label: string;
  id: number;
}
const AddRequisitionForm: React.FC = () => {
  useEffect(() => {
    async function performAsync() {
      const projectData = await fetchAllProjects();
      const typeData = await fetchAllTypes();
      if (projectData) {
        setProjects(projectData);
      }
      if(typeData) {
        setTypes(typeData);
      } 
    }
    performAsync();
  }, []);

  const [fields, setFields] = useState<RequisitionFields>({
    ID_RESPONSAVEL: 0,
    ID_PROJETO: 0,
    DESCRIPTION: "",
    TIPO: 0,
  });
  const { user } = useContext(userContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [types, setTypes] = useState<RequisitionType[]>([]);

  const [currentId, setCurrentId] = useState<number>(0);
  const { toggleAdding } = useContext(ItemsContext);

  const handleSelect = (
    event: React.SyntheticEvent<Element, Event>,
    value: ProjectOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<ProjectOption> | undefined
  ) => {
    console.log("Selecionado:", value, event, reason, details);
    if (value) {
      console.log({
        ...fields,
        ID_PROJETO: Number(value?.id),
      });
      setFields({
        ...fields,
        ID_PROJETO: Number(value?.id),
      });
    }
  };
  const handleSelectType = (
    event: React.SyntheticEvent<Element, Event>,
    value: TypeOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<ProjectOption> | undefined
  ) => {
     console.log("Selecionado:", value, event, reason, details);
     console.log({
       ...fields,
       TIPO: Number(value?.id),
     });
    setFields({ 
      ...fields,
        TIPO: Number(value?.id),
      });
    }


  const renderTypeOptions = () => {
    const typesArray: { label: string; id: number }[] = [];
    types.forEach((type) => {
      typesArray.push({
        label: String(type.nome_tipo),
        id: type.id_tipo_requisicao,
      });
    });
    return typesArray;
  }

  const renderProjectOptions = () => {
    const projectsArray: { label: string; id: number }[] = [];
    projects.forEach((project) => {
      projectsArray.push({
        label: String(project.DESCRICAO),
        id: project.ID,
      });
    });
    return projectsArray;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFields({
      ...fields,
      [id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      if (currentId === 0) {
        const response = await postRequisition([
          {
            ...fields,
            ["STATUS"]: "Em edição",
            ["ID_RESPONSAVEL"]: user.CODPESSOA,
          },
        ]);
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
          htmlFor="repeat-password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Projeto
        </label>
        <Autocomplete
          disablePortal
          id="selectProject"
          options={renderProjectOptions()}
          getOptionLabel={(option) => option.label}
          onChange={handleSelect}
          renderInput={(params) => <TextField {...params} label="Projeto" />}
        />
      </Box>

      <Box className="mb-5">
        <label
          htmlFor="repeat-password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Tipo da Requisição
        </label>
        <Autocomplete
          disablePortal
          id="selectProject"
          options={renderTypeOptions()}
          getOptionLabel={(option) => option.label}
          onChange={handleSelectType}
          renderInput={(params) => <TextField {...params} label="Tipo" />}
        />
      </Box>

      <Box className="mb-5">
        <label
          htmlFor="repeat-password"
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
        />
      </Box>
      <Button onClick={() => handleSubmit} type="submit">
        Seguir
      </Button>
      {currentId > 0 && <ProductsTableModal requisitionID={currentId} />}
    </form>
  );
};

export default AddRequisitionForm;
