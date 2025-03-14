import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Alert, AlertColor, Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Button, IconButton, Stack, TextField } from "@mui/material";
import AddCircle from "@mui/icons-material/AddCircle";
import { fetchAllProjects, fetchPersons, Person, Project } from "../../../../Requisitions/utils";
import { useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { Movementation } from "../../../types";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import "dayjs/locale/pt-br";
import { PatrimonyInfoContext } from "../../../context/patrimonyInfoContext";
import { createMovementation, finishChecklistByPatrimonyid, getNonRealizedChecklistByPatrimonyId } from "../../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { MovimentationContext } from "../../../context/movementationContext";
import { userContext } from "../../../../Requisitions/context/userContext";
import { BaseButtonStyles } from "../../../../utilStyles";
import { AlertInterface } from "../../../../Requisitions/types";

dayjs.locale("pt-br");



interface ProjectOption {
  label: string;
  id: number;
}

interface PersonOption {
  label: string,
  id: number
}

interface CreateMovementationProps {
  handleSave?: () => Promise<number>;
  responsable?: number;
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
    changeCreatingPatrimonyInfo
  } = React.useContext(PatrimonyInfoContext);
  const { user } = React.useContext(userContext);
  const navigate = useNavigate();
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
    aceito: 0
  });
  const [alert, setAlert] = useState<AlertInterface>();
  const [shouldShowFinishChecklistButton, setShouldFinishChecklistButton] = useState<boolean>(false);

  const handleSaveMovementation = async () => {
    if (creatingPatrimonyInfo[0] && handleSave) {
      const insertIdPatrimony = await handleSave();
      if (insertIdPatrimony) {
        const insertIdMovementation = await createMovementation({
          ...newMovementation,
          ["id_patrimonio"]: insertIdPatrimony,
        });
        if (insertIdMovementation) {
          navigate(`/patrimony/details/${insertIdPatrimony}`);
          toggleRefreshPatrimonyInfo();
          toggleCreatingPatrimonyInfo();
          return;
        }
      }
      return;
    }
    const response = await createMovementation({
      ...newMovementation,
      ["id_patrimonio"]: Number(id_patrimonio),
    });
    if (response?.status === 200) {
      toggleRefreshPatrimonyInfo();
      toggleRefreshMovimentation();
      toggleCreatingMovementation();
      return;
    }
    console.log('response: ', response)
    window.alert("Houve um erro ao criar a movimentação: \n" + response?.data.message);
  };

   const displayAlert = async (severity: string, message: string) => {
     setTimeout(() => {
       setAlert(undefined);
     }, 3000);
     setAlert({ message: message, severity: severity });
     return;
   };

  const handleOpen = () => {
    if (notAllowedToCreateMovementation()) {
      window.alert("Somente o resopnsável pode movimentar!");
      return;
    }
    toggleCreatingMovementation();
  };

  const notAllowedToCreateMovementation = () => {
    return Number(responsable) !== Number(user?.CODPESSOA) && !user?.PERM_ADMINISTRADOR;
  }

  const handleClose = () => {
    creatingPatrimonyInfo[0]
      ? changeCreatingPatrimonyInfo()
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

  const verifyNonRealizedChecklists = async ( ) => { 
        const nonRealizedChecklist = await getNonRealizedChecklistByPatrimonyId(
          Number(id_patrimonio)
        );
        console.log({nonRealizedChecklist})
        if(nonRealizedChecklist.id &&  user?.PERM_ADMINISTRADOR){ 
          setShouldFinishChecklistButton(true);
          return
        }
        setShouldFinishChecklistButton(false);
  }

  const handleFinishChecklist = async ( ) =>  {
        try{ 
            const response = await finishChecklistByPatrimonyid(Number(id_patrimonio));
            if(response.status === 200){ 
              setShouldFinishChecklistButton(false);
              displayAlert(
                "success",
                "Checklist finalizado, você pode movimentar o patrimônio"
              );
            }
        }catch(e : any){ 
          displayAlert('error', e.message as string);
        }
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

  React.useEffect(() => {
    console.log("verifyNonRealizedChecklists");
    verifyNonRealizedChecklists();
  }, [creatingMovementation]);


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
        <Box
          gap="1rem"
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "85%",
              sm: "65%",
              md: "45%",
              lg: "25%",
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 1,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack direction="row" justifyContent="end" spacing={2}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Nova Movimentação
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "red",
                position: "absolute",
                top: "10px",
                right: "10px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ width: "100%", alignItems: "center" }} spacing={2}>
            {getMovementationKeys().map((column) =>
              column.dataKey === "id_projeto" ? (
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="combo-box-demo"
                  options={renderProjectOptions()}
                  onChange={handleSelectProject}
                  renderInput={(params) => (
                    <TextField {...params} label={column.label} />
                  )}
                />
              ) : column.dataKey === "data" ? (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer
                    components={["DateField"]}
                    sx={{ width: "100%" }}
                  >
                    <DateField
                      format="DD/MM/YYYY"
                      disabled
                      fullWidth
                      defaultValue={dayjs(new Date())}
                      label={column.label}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              ) : column.dataKey === "id_responsavel" ? (
                <Autocomplete
                  disablePortal
                  fullWidth
                  id="combo-box-demo"
                  options={renderPersonOptions()}
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
                  fullWidth
                  placeholder={column.label}
                ></TextField>
              )
            )}
            <Button
              sx={{ ...BaseButtonStyles, width: 200 }}
              onClick={handleSaveMovementation}
            >
              Salvar
            </Button>
          </Stack>
          {shouldShowFinishChecklistButton && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Button
                onClick={handleFinishChecklist}
                sx={{ ...BaseButtonStyles, width: 200 }}
              >
                Finalizar checklist
              </Button>
              <Alert
                sx={{ width: "100%", border: "1px solid orange" }}
                severity="warning"
              >
                Há um checklist pendente, clique em finalizar ou realize para
                movimentar
              </Alert>
            </Box>
          )}
          {alert && (
            <Alert
              sx={{ width: "100%", border: "1px solid green" }}
              severity={alert.severity as AlertColor}
            >
              {alert.message}
            </Alert>
          )}
        </Box>
      </Modal>
    </div>
  );
}
