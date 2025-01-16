import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MovimentationTable from "../components/tables/MovimentationTable";
import { Patrimony } from "../types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import PatrimonyFileModal from "../modals/PatrimonyFileModal;";
import CreateMovementation from "../modals/CreateMovementation";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import {
  getResponsableForPatrimony,
  getSinglePatrimony,
  upatePatrimony,
} from "../utils";
import { useNavigate, useParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import PatrimonyAccessoryModal from "../modals/PatrimonyAccessoriesModal";
// import { userContext } from "../../Requisitions/context/userContext";
import ChecklistIcon from "@mui/icons-material/Checklist";

const PatrimonyDetails = () => {
  const { id_patrimonio } = useParams();
  const { refreshPatrimonyInfo, toggleRefreshPatrimonyInfo } =
    useContext(PatrimonyInfoContext);
  // const { user  } = useContext(userContext);
  const navigate = useNavigate();
  const [patrimonyData, setPatrimonyData] = useState<Patrimony>();
  const [editing, setEditing] = useState<[boolean, string?]>([false]);
  const [responsable, setResponsable] = useState<number>();

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    key: string
  ) => {
    setEditing([true, key]);
    const { value } = e.currentTarget;
    console.log(value);
    if (patrimonyData) {
      if (key === "id_patrimonio") {
        window.alert("Não é permitido editar o número do Patrimônio");
        return;
      }
      console.log({
        ...patrimonyData,
        [key as keyof Patrimony]: value,
      });
      setPatrimonyData({
        ...patrimonyData,
        [key as keyof Patrimony]: value,
      });
    }
  };

  const handleCancelEdition = () => {
    setEditing([false]);
    toggleRefreshPatrimonyInfo();
  };

  const fetchPatrimonyData = useCallback(async () => {
    console.log("fetchPatrimonyData");
    const data = await getSinglePatrimony(Number(id_patrimonio));
    const responsable = await getResponsableForPatrimony(Number(id_patrimonio));
    if (data) {
      setResponsable(responsable[0].id_responsavel);
      console.log("patrimonyData: ", data[0]);
      setPatrimonyData(data[0]);
    }
  }, [id_patrimonio]);

  const handleSave = async () => {
    if (patrimonyData) {
      const formattedValorCompra = patrimonyData.valor_compra
        ? parseFloat(
            patrimonyData.valor_compra.toString().replace(",", ".")
          ).toFixed(2)
        : null;
      const updatedData = {
        ...patrimonyData,
        valor_compra: formattedValorCompra ? Number(formattedValorCompra) : 0,
      };
      const response = await upatePatrimony(updatedData);
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
        return "Descrição";
      case "pat_legado":
        return "Código Patrimônio";
      case "nome_tipo":
        return "Tipo";
      case "fabricante":
        return "Fabricante";
      case "valor_compra":
        return "Valor de Compra";
    }
  };

  const renderLabelValue = (key: string) => {
    if (editing[0]) {
      return patrimonyData && `${patrimonyData[key as keyof Patrimony]}`;
    }

    if (key === "id_patrimonio") {
      return patrimonyData && `000${patrimonyData[key as keyof Patrimony]}`;
    }
    if (key === "valor_compra") {
      return (
        patrimonyData &&
        new Intl.NumberFormat("pt-BR", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(patrimonyData[key as keyof Patrimony]))
      );
    }
    return patrimonyData && `${patrimonyData[key as keyof Patrimony]}`;
  };

  const handleChangeDate = (day: Dayjs | null) => {
    if (day && patrimonyData) {
      setEditing([true, "data_compra"]);
      setPatrimonyData({
        ...patrimonyData,
        ["data_compra"]: day.toString(),
      });
    }
  };

  const handleBack = () => {
    navigate("/patrimony");
  };

  const handleActiveChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    console.log(event);
    if (patrimonyData) {
      if (checked) {
        await upatePatrimony({
          ...patrimonyData,
          ["ativo"]: 1,
        });
        toggleRefreshPatrimonyInfo();
        return;
      } else {
        await upatePatrimony({
          ...patrimonyData,
          ["ativo"]: 0,
        });
        toggleRefreshPatrimonyInfo();
        return;
      }
    }
  };

  useEffect(() => {
    console.log("USE EFFECT");
    fetchPatrimonyData();
  }, [refreshPatrimonyInfo, fetchPatrimonyData]);

  return (
    <Box sx={{ height: "98vh", overflow: "auto", padding: 2 }}>
      <Box
        overflow="auto"
        display="flex"
        sx={{
          height: "fit-content",
          paddingX: "2rem",
          alignItems: "center",
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowLeftIcon />
        </IconButton>
        <Typography
          textTransform="capitalize"
          className="text-gray-[#2B3990]"
          sx={{
            fontSize: {
              xs: "16px",
              sm: "16px",
              md: "18px",
              lg: "20px",
              xl: "22px",
            },
          }}
          fontFamily="Roboto"
        >
          {patrimonyData?.nome}
        </Typography>
      </Box>

      <Stack direction="row" gap={1} height="90%" flexWrap="wrap">
        <Box
          sx={{ borderRadius: "15px", padding: 2 }}
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
              <Tooltip
                onClick={() =>
                  window.open(`/patrimony/checklist/${id_patrimonio}`)
                }
                title="Checklists do patrimônio"
              >
                <IconButton>
                  <ChecklistIcon sx={{ color: "#F7941E" }} />
                </IconButton>
              </Tooltip>
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
                          format="DD/MM/YYYY"
                          onChange={(e) => handleChangeDate(e)}
                          defaultValue={dayjs.utc(patrimonyData[key])}
                          label="Data de Compra"
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  ) : key === "ativo" ? (
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={handleActiveChange}
                          defaultChecked={patrimonyData[key] > 0}
                        />
                      }
                      label="Ativo"
                    />
                  ) : (
                    <TextField
                      onChange={(e) => handleChange(e, key)}
                      // onClick={() => handleClickTextField(key)}
                      disabled={key === "nome_tipo"}
                      fullWidth
                      id="outlined-basic"
                      multiline
                      value={
                        renderLabelValue(key) === "null"
                          ? ""
                          : renderLabelValue(key)
                      }
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
                        onClick={handleCancelEdition} //refresh to get the default values back
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
          sx={{ borderRadius: "15px" }}
          height="100%"
          // paddingY="2rem"
          paddingX="1rem"
          width={{ xs: "100%", lg: "78%" }}
        >
          <Stack direction="column" height="100%" overflow="auto" spacing={2}>
            {
              <Box position="relative" height="5%">
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
                    Histórico de Movimentações
                  </Typography>

                  <CreateMovementation responsable={responsable} />
                </Stack>
              </Box>
            }
            <MovimentationTable />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default PatrimonyDetails;
