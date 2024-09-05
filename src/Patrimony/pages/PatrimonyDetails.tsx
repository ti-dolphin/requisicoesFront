import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import MovimentationTable from "../components/tables/MovimentationTable";
import { Patrimony } from "../types";
import React, { useContext, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { MovementationFileContextProvider } from "../context/movementationFileContext";
import { MovimentationContextProvider } from "../context/movementationContext";
import PatrimonyFileModal from "../modals/PatrimonyFileModal;";
import CreateMovementation from "../modals/CreateMovementation";
import {
  PatrimonyInfoContext,
} from "../context/patrimonyInfoContext";
import {  getResponsableForPatrimony, getSinglePatrimony, upatePatrimony } from "../utils";
import { useNavigate, useParams } from "react-router-dom";
import {
  PatrimonyFileContextProvider,
} from "../context/patrimonyFileContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import PatrimonyAccessoryModal from "../modals/PatrimonyAccessoriesModal";
// import { userContext } from "../../Requisitions/context/userContext";


const PatrimonyDetails = () => {

  const { id_patrimonio } = useParams();
  const { refreshPatrimonyInfo, toggleRefreshPatrimonyInfo } = useContext(PatrimonyInfoContext);
  // const { user  } = useContext(userContext);
  const navigate = useNavigate();
  const [patrimonyData, setPatrimonyData] = useState<Patrimony>();
  const [editing, setEditing] = useState<[boolean, string?]>([false]);
  const [responsable, setResponsable] = useState<number>();


  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    key: string
  ) => {
    const { value } = e.currentTarget;
    if (patrimonyData) {
      setPatrimonyData({
        ...patrimonyData,
        [key as keyof Patrimony]: value,
      });
    }
  };

  const fetchPatrimonyData = async () => {
    console.log("id_patrimonio: ", id_patrimonio);
    const data = await getSinglePatrimony(Number(id_patrimonio));
     const responsable = await getResponsableForPatrimony(Number(id_patrimonio));
    if (data) { 
      setResponsable(responsable[0].id_responsavel);
      console.log("patrimonyData: ", data[0]);
      setPatrimonyData(data[0]);
      console.log(`responsável é: ${responsable[0].id_responsavel}`);
    }
  
  };

  const handleSave = async () => {
    if (patrimonyData) {
      const response = await upatePatrimony(patrimonyData);
      console.log("response update patrimonio: \n", response);
      if (response && response.status === 200) {
        toggleRefreshPatrimonyInfo();
        setEditing([false]);
      }
    }
    setEditing([false]);
  };

  const renderLabel = (key: string) => {
    switch (key) {
      case "id_patrimonio":
        return "Nº Patrimônio";
      case "nome":
        return "Nome";
      case "data_compra":
        return "Data de Compra";
      case "nserie":
        return "Nº de série";
      case "descricao":
        return "Descricao";
      case "pat_legado":
        return "Código Patrimônio";
      case "nome_tipo": 
        return "Tipo"
    }
  };

  const renderLabelValue = (key: string) => {
    if (editing)
      return patrimonyData && `${patrimonyData[key as keyof Patrimony]}`;
    else {
      return patrimonyData && `${patrimonyData[key as keyof Patrimony]}`;
    }
  };

  const handleChangeDate = (day: Dayjs | null) => {
    if (day && patrimonyData) {
      setPatrimonyData({
        ...patrimonyData,
        ["data_compra"]: day.toString(),
      });
    }
  };
  const handleBack = () => {
    navigate("/patrimony");
  };
  const handleClickTextField = (key : string) => { 
        if( key === "id_patrimonio" ){ 
         window.alert("Não é permitido editar o número do patrimônio");
         return;
        }
       setEditing([true, key])
  }
  useEffect(() => {
    fetchPatrimonyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPatrimonyInfo]);

  return (
    <Box sx={{ height: "98vh", overflow: "auto" }}>
      <MovimentationContextProvider>
        <MovementationFileContextProvider>
          <PatrimonyFileContextProvider>
            <Box
              // className="border border-slate-300"
              overflow="auto"
              display="flex"
              sx={{
                height: "5%",
                paddingX: "2rem",
                alignItems: "center",
              }}
            >
              <IconButton onClick={handleBack}>
                <ArrowLeftIcon />
              </IconButton>
              <Typography className="text-gray-[#2B3990]" variant="h6">
                {patrimonyData?.descricao}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} height="90%" flexWrap="wrap">
              <Box
                sx={{borderRadius: '15px', padding :2 }}
                className="border border-slate-300"
                paddingY="2rem"
                height="100%"
                width={{ xs: "100%", lg: "20%" }}
              >
                <Stack
                  direction="column"
                  justifyContent="start"
                  gap="1rem"
                  padding="0.5rem"
                  height="100%"
                  overflow="auto"
                >
                  <Typography
                    className="text-gray-[#2B3990]"
                    variant="h6"
                    textAlign="center"
                  >
                    Detalhes
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <PatrimonyFileModal />
                    <PatrimonyAccessoryModal />
                  </Stack>
                  {patrimonyData &&
                    Object.keys(patrimonyData).map((key) => (
                      <Box display="flex" flexDirection="column" gap="0.5rem">
                        <Typography
                          className="text-gray-600"
                          textTransform="capitalize"
                        >
                          {renderLabel(key)}
                        </Typography>
                        {key === "data_compra" ? (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={["DateField"]}>
                              <DateField
                                onClick={() => setEditing([true, key])}
                                onChange={(e) => handleChangeDate(e)}
                                defaultValue={dayjs(patrimonyData[key])}
                                label="Data de Compra"
                              />
                            </DemoContainer>
                          </LocalizationProvider>
                        ) : (
                          <TextField
                            onChange={(e) => handleChange(e, key)}
                            onClick={() => handleClickTextField(key)}
                            disabled={key === "nome_tipo"}
                            fullWidth
                            id="outlined-basic"
                            multiline
                            value={renderLabelValue(key)}
                            variant="outlined"
                          />
                        )}
                        {editing[0] && editing[1] === key && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              onClick={() => handleSave()}
                              sx={{ width: "1rem", marginX: "1rem" }}
                            >
                              <SaveIcon />
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => setEditing([false])} //refresh to get the default values back
                              sx={{
                                width: "1rem",
                                marginX: "1rem",
                                color: "red",
                              }}
                            >
                              <CancelIcon />
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    ))}
                </Stack>
              </Box>

              <Box
                 className="border border-slate-300"
                 sx={{borderRadius: '15px'}}
                height="100%"
                // paddingY="2rem"
                paddingX="1rem"
                width={{ xs: "100%", lg: "78%" }}
              >
                <Stack
                  direction="column"
                  height="100%"
                  overflow="auto"
                  spacing={2}
                >
                  { <Box position="relative" height="5%">
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        display="flex"
                        alignItems="center"
                        fontSize={{
                          lg: "1.5rem",
                          sm: "1rem",
                          xs: "14px",
                        }}
                        className="text-gray-[#2B3990]"
                        textAlign="center"
                      >
                        Histórico de Movimentacões
                      </Typography>
                      <CreateMovementation responsable={responsable} />
                    </Stack>
                  </Box> }
                  <MovimentationTable />
                </Stack>
              </Box>
            </Stack>
          </PatrimonyFileContextProvider>
        </MovementationFileContextProvider>
      </MovimentationContextProvider>
    </Box>
  );
};

export default PatrimonyDetails;
