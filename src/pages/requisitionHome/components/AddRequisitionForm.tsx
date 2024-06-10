import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Person, Project, fetchAllProjects } from "../../../utils";
import { fetchPersons, postRequisition } from "../../../utils";
import { Button } from "@mui/material";
import ItemsTable from "./ItemsTable";
import { Modal, Stack, Box } from "@mui/material";
import React from "react";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: '25px',
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};
interface RequisitionFields {
  id_responsavel: number;
  id_projeto: number;
  description: string;
}
interface ItemstableModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  requisitionID: number;
}

export const ItemstableModal: React.FC<ItemstableModalProps> = ({
  isOpen,
  setIsOpen,
  requisitionID
}) => {
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, border: "none", width: "95vw", height: "95vh" }}>
          <Stack direction="column">
            <Stack
              direction="column"
              alignItems="center"
              sx={{ height: "90vh", padding: "none" }}
            >
              <ItemsTable id_requisicao={requisitionID} />
              <Stack sx={{ marginTop: "8rem" }} direction="row" spacing={2}>
                <Button onClick={handleClose}>Voltar</Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
const AddRequisitionForm: React.FC = () => {
  useEffect(() => {
    async function performAsync() {
      console.log("performed");
      const personData = await fetchPersons();
      const projectData = await fetchAllProjects();
      if (personData && projectData) {
        setPersons(personData);
        setProjects(projectData);
        console.log("personData: ", personData);
      }
    }
    performAsync();
  }, []);

  const [fields, setFields] = useState<RequisitionFields>({
    id_responsavel: 0,
    id_projeto: 0,
    description: "",
  });
  const [ projects, setProjects ] = useState<Project[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentId, setCurrentId ] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    console.log(
      "body: ",
      JSON.stringify([
        {
          ...fields,
          status: "Cotação",
        },
      ])
    );
   const response = await postRequisition([
      { 
        ...fields,
        status : 'Cotação'
      }
    ]);
    if(response) { 
      console.log('ID: ', response.data);
      setCurrentId(Number(response.data));
    }
     setIsOpen(true);
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
          id="id_responsavel"
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
          onChange={(e) => handleSelect(e)}
          required
        >
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
          id="id_projeto"
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required
          onChange={(e) => handleSelect(e)}
        >
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
          id="description"
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
      <Button type="submit">Seguir</Button>
      {currentId > 0 && (
        <ItemstableModal
          requisitionID={currentId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </form>
  );
};

export default  AddRequisitionForm;
