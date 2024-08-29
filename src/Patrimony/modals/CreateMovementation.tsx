import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Button, IconButton, Stack, TextField } from "@mui/material";
import AddCircle from "@mui/icons-material/AddCircle";
import { fetchAllProjects, fetchPersons, Person, Project } from "../../Requisitions/utils";
import { useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { Movementation } from "../types";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import "dayjs/locale/pt-br"; 
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import SaveIcon from "@mui/icons-material/Save";
import { createMovementation } from "../utils";
import { useParams } from "react-router-dom";
import { MovimentationContext } from "../context/movementationContext";
import { userContext } from "../../Requisitions/context/userContext";

dayjs.locale("pt-br");

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 'fit-content',
  flexShrink : 1,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

interface ProjectOption {
  label: string;
  id: number;
}

interface PersonOption{ 
  label: string,
  id: number
}

interface CreateMovementationProps {
  handleSave?: () => Promise<number>;
  responsable? : number;
}

export default function CreateMovementation({
  handleSave,
  responsable,

}: CreateMovementationProps) {
  const { id_patrimonio } = useParams();
  const {
    creatingPatrimonyInfo,
    toggleCreatingPatrimonyInfo,
    toggleRefreshPatrimonyInfo,
    setCurrentFilter,
  } = React.useContext(PatrimonyInfoContext);
  const { user } = React.useContext(userContext);
  const {
    toggleRefreshMovimentation,
    toggleCreatingMovementation,
    creatingMovementation,
  } = React.useContext(MovimentationContext);
  const [projectOptions, setProjectOptions] = useState<Project[]>([]);
  const [personOptions, setPersonOptions] = useState<Person[]>();

  const [newMovementation, setNewMovementation] = useState<Movementation>({
    id_movimentacao: 0, // Default value for number
    id_projeto: 0,
    id_patrimonio: 0,
    id_ultima_movimentacao: 0, // Default value for number
    data: "", // Default value for string
    id_responsavel: 0, // Default value for string
    numeroMovimentacao: 0, // Default value for number
    observacao: "",
  });

  const handleSaveMovementation = async () => {
    if (creatingPatrimonyInfo[0] && handleSave) {
      //CREATING PATRIMONY AND FIRST MOVEMENTATION
      console.log("a patrimony is being created, it will be saved firts");
      const insertIdPatrimony = await handleSave();
      if (insertIdPatrimony) {
        const insertIdMovementation = await createMovementation({
          ...newMovementation,
          ["id_patrimonio"]: insertIdPatrimony,
        });
        if (insertIdMovementation) {
          console.log("insertIdMovementation: ", insertIdMovementation);
          setCurrentFilter("Ativos");
          toggleRefreshPatrimonyInfo();
          toggleCreatingPatrimonyInfo();
          return;
        }
      }
      return;
    }
    const insertIdMovementation = await createMovementation({
      ...newMovementation,
      ["id_patrimonio"]: Number(id_patrimonio),
    });
    if (insertIdMovementation) {
      toggleRefreshMovimentation();
      toggleCreatingMovementation();
    }
    // no caso de estar criando a movimentação para o patrimonio já existente, o id virá do contexto de criação da movimentação, que irá receber o id do patrimônio
  };

  const handleOpen = () => {
    if (Number(responsable) !== Number(user?.CODPESSOA)) {
      console.log("responsable: ", responsable);
      console.log("user.codpessoa: ", user?.CODPESSOA);
      window.alert("Somente o resopnsável pode movimentar!");
      return;
    }
    toggleCreatingMovementation();
  };

  const handleClose = () => {
    creatingPatrimonyInfo[0]
      ? toggleCreatingPatrimonyInfo()
      : toggleCreatingMovementation();
  };

  const renderProjectOptions = () => {
    const projectOptionsArray: { label: string; id: number }[] = [];
    projectOptions.forEach((project) => {
      projectOptionsArray.push({
        label: String(project.DESCRICAO),
        id: project.ID,
      });
    });
    return projectOptionsArray;
  };

  const renderPersonOptions = () => {
    const personOptionsArray: { label: string; id: number }[] = [];
    personOptions?.forEach((person) => {
      personOptionsArray.push({
        label: String(person.NOME),
        id: Number(person.CODPESSOA),
      });
    });
    return personOptionsArray;
  };

  const handleSelectProject = (
    _event: React.SyntheticEvent<Element, Event>,
    value: ProjectOption | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reason: AutocompleteChangeReason,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _details?: AutocompleteChangeDetails<ProjectOption> | undefined
  ) => {
    if (value) {
      setNewMovementation({
        ...newMovementation,
        ["id_projeto"]: value?.id,
      });
    }
  };

  const handleSelectReponsable = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _event: React.SyntheticEvent<Element, Event>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value: PersonOption | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _reason: AutocompleteChangeReason,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _details?: AutocompleteChangeDetails<PersonOption> | undefined
  ) => {
    if (value) {
      console.log({
        ...newMovementation,
        ["id_responsavel"]: value.id,
      });

      setNewMovementation({
        ...newMovementation,
        ["id_responsavel"]: value.id,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    console.log({
      ...newMovementation,
      [id]: value,
    });
    setNewMovementation({
      ...newMovementation,
      [id]: value,
    });
  };

  const getMovementationKeys = () => {
    return [
      { label: "Projeto", dataKey: "id_projeto" },
      { label: "Responsável", dataKey: "id_responsavel" },
      { label: "Data da Movimentação", dataKey: "data" },
      { label: "Observação", dataKey: "observacao" },
    ];
  };

  React.useEffect(() => {
    async function setAutoCompleteOptions() {
      const projectData = await fetchAllProjects();
      if (projectData) {
        setProjectOptions(projectData);
      }
      const personData = await fetchPersons();
      if (personData) {
        setPersonOptions(personData);
      }
    }
    setAutoCompleteOptions();
  }, []);

  return (
    <div>
      <IconButton
        sx={{ display: creatingPatrimonyInfo[0] ? "none" : "block" }}
        onClick={handleOpen}
      >
        <AddCircle sx={{ color: "#F7941E" }} />
      </IconButton>

      <Modal
        open={creatingMovementation || creatingPatrimonyInfo[1] !== undefined}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box display="flex" flexDirection="column" gap="1rem" sx={style}>
          <Stack direction="row" justifyContent="end" spacing={2}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Nova Movimentação
            </Typography>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ color: "red", width: "0.5rem", alignSelf: "flex-end" }}
            >
              <CloseIcon />
            </Button>
          </Stack>
          <Stack spacing={2}>
            {getMovementationKeys().map((column) =>
              column.dataKey === "id_projeto" ? (
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={renderProjectOptions()}
                  sx={{ width: 300 }}
                  onChange={handleSelectProject}
                  renderInput={(params) => (
                    <TextField {...params} label={column.label} />
                  )}
                />
              ) : column.dataKey === "data" ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DateField"]}>
                    <DateField
                      format="DD/MM/YYYY"
                      disabled
                      defaultValue={dayjs(new Date())}
                      label={column.label}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              ) : column.dataKey === "id_responsavel" ? (
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={renderPersonOptions()}
                  sx={{ width: 300 }}
                  onChange={handleSelectReponsable}
                  renderInput={(params) => (
                    <TextField {...params} label={column.label} />
                  )}
                />
              ) : (
                <TextField
                  onChange={handleChange}
                  id={column.dataKey}
                  multiline
                  placeholder={column.label}
                ></TextField>
              )
            )}
            <Button onClick={handleSaveMovementation}>
              <SaveIcon />
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
