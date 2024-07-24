import { useEffect, useState } from "react";
import { Person, Project, fetchAllProjects } from "../../../utils";
import { fetchPersons, postRequisition } from "../../../utils";
import { Button } from "@mui/material";
import React from "react";
import { ProductsTableModal } from "../../../components/modals/ProductsTableModal";
import { useContext } from "react";
import { ItemsContext } from "../../../context/ItemsContext";

interface RequisitionFields {
  ID_RESPONSAVEL: number;
  ID_PROJETO: number;
  DESCRIPTION: string;
}

const AddRequisitionForm: React.FC = () => {
  useEffect(() => {
    async function performAsync() {
      const personData = await fetchPersons();
      const projectData = await fetchAllProjects();
      if (personData && projectData) {
        setPersons(personData);
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [currentId, setCurrentId] = useState<number>(0);
  const { toggleAdding } = useContext(ItemsContext);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFields({
      ...fields,
      [id]: Number(value)
    });
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
     if (currentId === 0) {
        const response = await postRequisition([
          {
            ...fields,
            ['STATUS']: 'Em edição'
          }   
        ]);
       if (response) {
 
         setCurrentId(Number(response.data));
       }
       toggleAdding();
      } else{ 
        toggleAdding();
      }

  };

  return (
    <form className="max-w-sm mx-auto mt-5 w-[90%]" onSubmit={handleSubmit}>
      <div className="mb-5">
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900 "
        >
          Responsável
        </label>
        <select
          id="ID_RESPONSAVEL"
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
          onChange={(e) => handleSelect(e)}
          required
        >
          <option value=""></option>
          {persons.map((person) => (
            <option value={person.CODPESSOA} id={String(person.CODPESSOA)}>
              {person.NOME}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-5">
        <label
          htmlFor="repeat-password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Projeto
        </label>
        <select
          id="ID_PROJETO"
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required
          onChange={(e) => handleSelect(e)}
        >
          <option value=""></option>
          {projects.map((project) => (
            <option value={project.ID}>{project.ID}</option>
          ))}
        </select>
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
      <Button onClick={() => handleSubmit} type="submit">Seguir</Button>
      {currentId > 0 && (
        <ProductsTableModal requisitionID={currentId}
        />

      )}
    </form>
  );
};

export default AddRequisitionForm;
