import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import React, { useContext, useEffect, useState } from "react";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import { Autocomplete, Button, IconButton, Stack, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Patrimony, patrimonyType } from "../types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { createPatrimony, getTypesOfPatrimony } from "../utils";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { Form } from "react-router-dom";
import CreateMovementation from "./CreateMovementation";

interface ColumnData {
  dataKey: string;
  label: string;
  numeric?: boolean;
  required?: boolean;
}


const columns: ColumnData[] = [
  {
    label: "Tipo",
    dataKey: "tipo",
    required: true,
  },
  {
    label: "Data de Compra",
    dataKey: "data_compra",
    required: false,
  },
  {
    label: "Nome",
    dataKey: "nome",
    required: true,
  },
  {
    label: "Descrição",
    dataKey: "descricao",
    required: true,
  },
  {
    label: "Número de Série",
    dataKey: "nserie",
    numeric: false,
    required: false,
  },
  {
    label: "Código Patrimônio",
    dataKey: "pat_legado",
    required: false,
  },
];



export default function CreatePatrimonyInfoModal() {

  const {creatingPatrimonyInfo, toggleCreatingPatrimonyInfo, changeCreatingPatrimonyInfo } = useContext(PatrimonyInfoContext);

  const [patrimonyInfo, setPatrimonynInfo] = useState<Patrimony>({
    id_patrimonio: 0,
    tipo: 0,
    nome: "",
    data_compra: "", // This should be in ISO date string format, e.g., "2024-08-09"
    nserie: "",
    descricao: "",
    pat_legado: "",
    nome_tipo: '',
    ativo : 1
  });

  const [typeOptions, setTypes ] = useState<patrimonyType[]>([]);
  
  const handleClose = () => toggleCreatingPatrimonyInfo();
   
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ,dataKey: string ) => { 
    const { value } = e.target;
        console.log({ 
          ...patrimonyInfo,
          [dataKey] : value
        });
        setPatrimonynInfo({ 
          ...patrimonyInfo,
          [dataKey ]: value
        });
   };

  const handleSave = async () => {
     const insertId = await createPatrimony(patrimonyInfo);
     if (insertId) {
       return insertId;
     }

  };

  const handleNext = async () => {
   const { data_compra, tipo } = patrimonyInfo;
   console.log('data_compra', data_compra);

  if(data_compra.length){ 
     if (!data_compra || !dayjs(data_compra).isValid()) {
       alert("Por favor, insira uma data de compra válida.");
       return;
     }

     if (!tipo) {
       alert("Por favor, selecione um tipo de patrimônio.");
       return;
     }
     // Verifica se a data não é futura
     if (dayjs(data_compra).isAfter(dayjs())) {
       alert("A data de compra não pode ser uma data futura.");
       return;
     }
  } 
   changeCreatingPatrimonyInfo({
     ...patrimonyInfo,
   });
  };

  const handleChangeDate = (day: Dayjs | null) => {
      console.log({
        ...patrimonyInfo,
        ["data_compra"]: day?.toString(),
      });
     if(day){ 
       setPatrimonynInfo({
         ...patrimonyInfo,
         ["data_compra"]: day?.toString(),
       });
     }
  };

  const renderTypeOptions = ( ) =>  {
           return typeOptions.map((type) => ({
             label: type.nome_tipo,
             id: type.id_tipo_patrimonio,
           }));
  };

  const handleSelectType = (
    event: React.SyntheticEvent,
    value: { label: string; id: number } | null
  ) => {
    console.log(event);
    if (value) {
      console.log({
        ...patrimonyInfo,
        tipo: value.id,
      });
      setPatrimonynInfo({
        ...patrimonyInfo,
        tipo: value.id,
      });
    }
  };

  const fetchTypeOptions = async  () => { 
    const types = await getTypesOfPatrimony();
    setTypes(types);
  }
    useEffect(( ) => { 
      fetchTypeOptions();
    }, []);

  return (
    <div>
      <Modal
        open={creatingPatrimonyInfo[0]}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90%",
              sm: "70%",
              md: "50%",
              lg: "30%",
              xl: "20%",
            },
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: '1rem',
            alignItems: "center",
            flexSruink: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <CreateMovementation handleSave={handleSave} />
          <Stack direction="row" justifyContent="end" spacing={4}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              fontSize="medium"
            >
              Novo Patrimônio
            </Typography>
            <IconButton
              onClick={toggleCreatingPatrimonyInfo}
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
          <Form onSubmit={handleNext}>
            <Stack direction="column" spacing={1.6}>
              {columns.map((column) =>
                column.dataKey === "data_compra" ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DateField"]}>
                      <DateField
                        format="DD/MM/YYYY"
                        onChange={(e) => handleChangeDate(e)}
                        label="Data de Compra"
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                ) : column.dataKey == "tipo" ? (
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={renderTypeOptions()}
                    onChange={handleSelectType} // Adiciona essa linha para chamar a função ao selecionar um item
                    
                    renderInput={(params) => (
                      <TextField {...params} label={column.label} />
                    )}
                  />
                ) : (
                  <TextField
                  sx={{ 
                    width: '100%'
                  }}
                    type={column.numeric ? "number" : "text"}
                    required={column.required}
                    onChange={(e) => handleChange(e, column.dataKey)}
                    label={column.label}
                  ></TextField>
                )
              )}
            </Stack>

            <Button
              type="submit"
              sx={{ width: "1rem", marginX: "1rem", marginTop: "1rem" }}
            >
              <ArrowCircleRightIcon />
            </Button>
          </Form>
        </Box>
      </Modal>
    </div>
  );
}
