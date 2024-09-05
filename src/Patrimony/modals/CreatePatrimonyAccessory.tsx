import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import {
    Badge,
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import CloseIcon from "@mui/icons-material/Close";
import { PatrimonyAccessory } from "../types";
import SaveIcon from "@mui/icons-material/Save";
import { createAccessory } from "../utils";



const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  flexShrink: 1,
  boxShadow: 24,
  p: 4,
};

export default function CreatePatrimonyAccessoryModal() {
  const { creatingPatrimonyAccessory, toggleCreatingPatrimonyAccessory, toggleRefreshPatrimonyAccessory } = useContext(PatrimonyInfoContext);

  const { id_patrimonio } = useParams<{ id_patrimonio: string }>();

  const [patrimonyAccessory, setPatrimonyAccessory] =
    useState<PatrimonyAccessory>({
      descricao : '',
      id_acessorio_patrimonio: 0,
      nome: "",
      id_patrimonio: Number(id_patrimonio),
    });


  const handleClose = () => toggleCreatingPatrimonyAccessory();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key : string
  ) => {
    const { value } = e.currentTarget;
    setPatrimonyAccessory({
      ...patrimonyAccessory,
      [key]: value,
    });
  };


  const handleSave = async () => {
    console.log("Saving patrimony accessory:", patrimonyAccessory);
    try {
      const response = await createAccessory(patrimonyAccessory);
      console.log("Accessory created successfully:", response);
      toggleRefreshPatrimonyAccessory();
      toggleCreatingPatrimonyAccessory();
    } catch (error) {
      console.error("Failed to create accessory:", error);
    }
  };

  return (
    <div>
      <Badge>
        <IconButton onClick={toggleCreatingPatrimonyAccessory}>
          <HomeRepairServiceIcon sx={{ color: "#F7941E" }} />
        </IconButton>
      </Badge>
      <Modal
        open={creatingPatrimonyAccessory}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, gap: "1rem" }}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Novo Acessório de Patrimônio
            </Typography>
            <Button
              onClick={toggleCreatingPatrimonyAccessory}
              variant="outlined"
              sx={{ color: "red" }}
            >
              <CloseIcon />
            </Button>
          </Stack>
          <Stack direction="column" spacing={2}>
            <TextField
              required
         
              label="Nome"
              value={patrimonyAccessory.nome}
              onChange={(e) => handleChange(e, 'nome')}
            />
            <TextField
              required
              label="Descrição"
              value={patrimonyAccessory.descricao}
              onChange={(e) => handleChange(e, 'descricao')}
            />
          </Stack>
          <Button
            onClick={handleSave}
            sx={{ width: "1rem", marginX: "1rem", marginTop: "1rem" }}
          >
            <SaveIcon />
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
