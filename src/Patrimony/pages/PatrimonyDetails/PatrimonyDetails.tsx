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
import MovimentationTable from "../../components/tables/MovimentationTable";
import { Patrimony } from "../../types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import PatrimonyFileModal from "../../components/modals/PatrimonyFileModal;/PatrimonyFileModal;";
import CreateMovementation from "../../components/modals/CreateMovementation/CreateMovementation";
import { PatrimonyInfoContext } from "../../context/patrimonyInfoContext";
import {
  getResponsableForPatrimony,
  getSinglePatrimony,
  updatePatrimony,
} from "../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { ArrowLeftIcon } from "@mui/x-date-pickers/icons";
import PatrimonyAccessoryModal from "../../components/modals/PatrimonyAccessoriesModal/PatrimonyAccessoriesModal";
// import { userContext } from "../../Requisitions/context/userContext";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ProductsTableModal from "../../../Requisitions/components/modals/ProductsTableModal/ProductsTableModal";
import { BaseButtonStyles } from "../../../utilStyles";

interface PatrimonyField {
  label: string;
  dataKey: keyof Patrimony;
  type?: "date" | "switch" | "text";
  disabled?: boolean;
}

const fields: PatrimonyField[] = [
  { label: "Nº Patrimônio", dataKey: "id_patrimonio", disabled: true },
  { label: "Nome", dataKey: "nome" },
  { label: "Produto", dataKey: "nome_produto", disabled: true },
  { label: "Data de Compra", dataKey: "data_compra", type: "date" },
  { label: "Nº de série", dataKey: "nserie" },
  { label: "Descrição", dataKey: "descricao" },
  { label: "Código Patrimônio", dataKey: "pat_legado" },
  { label: "Tipo", dataKey: "nome_tipo", disabled: true },
  { label: "Fabricante", dataKey: "fabricante" },
  { label: "Valor de Compra", dataKey: "valor_compra" },
  { label: "Ativo", dataKey: "ativo", type: "switch" },
];

const PatrimonyDetails = () => {
  const { id_patrimonio } = useParams();
  const { refreshPatrimonyInfo, toggleRefreshPatrimonyInfo } = useContext(PatrimonyInfoContext);
  const navigate = useNavigate();
  const [patrimonyData, setPatrimonyData] = useState<Patrimony>();
  const [editing, setEditing] = useState<[boolean, string?]>([false]);
  const [responsable, setResponsable] = useState<number>();
  const [choosingProductForPatrimony, setChoosingProductForPatrimony] =
    useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    key: string
  ) => {
    setEditing([true, key]);
    const { value } = e.currentTarget;
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
      const response = await updatePatrimony(updatedData);
      if (response && response.status === 200) {
        toggleRefreshPatrimonyInfo();
        setEditing([false]);
      }
    }
    setEditing([false]);
  };

  const renderFieldValue = (field: PatrimonyField) => {
    if (!patrimonyData) return "";

    const value = patrimonyData[field.dataKey];

    if (editing[0]) {
      return value?.toString() || "";
    }

    if (field.dataKey === "id_patrimonio") {
      return `000${value}`;
    }

    if (field.dataKey === "valor_compra") {
      return new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value));
    }

    return value?.toString() || "";
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
        await updatePatrimony({
          ...patrimonyData,
          ["ativo"]: 1,
        });
        toggleRefreshPatrimonyInfo();
        return;
      } else {
        await updatePatrimony({
          ...patrimonyData,
          ["ativo"]: 0,
        });
        toggleRefreshPatrimonyInfo();
        return;
      }
    }
  };

  useEffect(() => {

    fetchPatrimonyData();
  }, [refreshPatrimonyInfo, fetchPatrimonyData, choosingProductForPatrimony]);

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
            <Button
              sx={BaseButtonStyles}
              onClick={() => setChoosingProductForPatrimony(true)}
            >
              Definir produto
            </Button>

            {patrimonyData &&
              fields.map((field) => (
                <Box
                  key={field.dataKey}
                  display="flex"
                  flexDirection="column"
                  gap="0.5rem"
                >
                  {field.type === "date" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DateField"]}>
                        <DateField
                          format="DD/MM/YYYY"
                          onChange={(e) => handleChangeDate(e)}
                          defaultValue={dayjs.utc(patrimonyData[field.dataKey])}
                          label="Data de Compra"
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  ) : field.type === "switch" ? (
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={handleActiveChange}
                          defaultChecked={
                            Number(patrimonyData[field.dataKey]) > 0
                          }
                        />
                      }
                      label="Ativo"
                    />
                  ) : (
                    <TextField
                      label={field.label}
                      InputLabelProps={{
                        shrink: true
                      }}
                      onChange={(e) => handleChange(e, field.dataKey)}
                      disabled={field.disabled}
                      fullWidth
                      id="outlined-basic"
                      multiline
                      value={renderFieldValue(field)}
                      variant="outlined"
                    />
                  )}
                  {editing[0] && editing[1] === field.dataKey && (
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
                        onClick={handleCancelEdition}
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
                    fontSize={{
                      lg: "1.5rem",
                      sm: "1rem",
                      xs: "14px",
                    }}
                    fontWeight="bold"
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
      <ProductsTableModal
        patrimony={patrimonyData}
        choosingProductForPatrimony={choosingProductForPatrimony}
        setChoosingProductForPatrimony={setChoosingProductForPatrimony}
      />
    </Box>
  );
};

export default PatrimonyDetails;
