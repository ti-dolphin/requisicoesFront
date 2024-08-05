import { useEffect, useState } from "react";
import { Project, fetchAllProjects } from "../../../utils";
import { postRequisition } from "../../../utils";
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Button, TextField } from "@mui/material";
import React from "react";
import { ProductsTableModal } from "../../../components/modals/ProductsTableModal";
import { useContext } from "react";
import { ItemsContext } from "../../../context/ItemsContext";
import { userContext } from "../../../context/userContext";

interface RequisitionFields {
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
  DESCRIPTION: string;
}
interface ProjectOption {
  label: string;
  id: number;
}

const AddRequisitionForm: React.FC = () => {
  useEffect(() => {
    async function performAsync() {
      const projectData = await fetchAllProjects();
      if (projectData) {
        setProjects(projectData);
      }
    }
    performAsync();
  }, []);

  const [fields, setFields] = useState<RequisitionFields>({
    ID_RESPONSAVEL: 0,
    ID_PROJETO: 0,
    DESCRIPTION: "",
  });
  const { user } =  useContext(userContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const { toggleAdding } = useContext(ItemsContext);

  const handleSelect = (
    event: React.SyntheticEvent<Element, Event>,
    value: ProjectOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<ProjectOption> | undefined
  ) => {
     console.log("Selecionado:", value, event, reason, details);
     if(value){ 
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
  const renderProjectOptions = ( ) => { 
     const projectsArray : {label: string, id: number }[] = [];
      projects.forEach((project) => { 
        projectsArray.push({
          label: String(project.DESCRICAO),
          id: project.ID,
        });
      } );
      return projectsArray;
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFields({
      ...fields,
      [id]: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   if(user){ 
      if (currentId === 0) {
        const response = await postRequisition([
          {
            ...fields,
            ["STATUS"]: "Em edição",
            ['ID_RESPONSAVEL'] : user.CODPESSOA
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
      <div className="mb-5">
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

        {/* <select
          id="ID_PROJETO"
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required
          onChange={(e) => handleSelect(e)}
        >
          <option value=""></option>
          {projects.map((project) => (
            <option value={project.ID}>{project.DESCRICAO}</option>
          ))}
        </select> */}
      </div>
      <div className="mb-5">
        <label
          htmlFor="repeat-password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Descrição
        </label>
        <input
          type="text"
          id="DESCRIPTION"
          placeholder="Descrição..."
          className="shadow-sm
           bg-gray-50 border
            border-gray-300
             text-gray-900 text-sm
              rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-6"
          required
          onChange={handleChange}
        />
      </div>
      <Button onClick={() => handleSubmit} type="submit">
        Seguir
      </Button>
      {currentId > 0 && <ProductsTableModal requisitionID={currentId} />}
    </form>
  );
};

export default AddRequisitionForm;
