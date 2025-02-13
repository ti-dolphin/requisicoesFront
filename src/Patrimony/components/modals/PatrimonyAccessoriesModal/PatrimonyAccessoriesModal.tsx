/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Stack,
  Badge,
  useMediaQuery,
  useTheme,
  Theme,
  Button,
  styled,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatrimonyInfoContext } from "../../../context/patrimonyInfoContext";
import {
  createPatrimonyAccessoryFile,
  deletePatrimonyAccessory,
  getAccessoriesByPatrimonyId,
  getPatrimonyAccessoryFiles,
} from "../../../utils"; // Assuming this function exists
import { PatrimonyAccessory, PatrimonyAccessoryFile } from "../../../types";
import { useParams } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CreatePatrimonyAccessoryModal from "../CreatePatrimonyAccessory/CreatePatrimonyAccessory";
import CameraFileLogo from '../../../assets/cameraFileLogo-Chy76Qi9-Chy76Qi9.png';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { BaseButtonStyles } from "../../../../utilStyles";
// Styles using breakpoints for responsiveness
const modalStyle = (theme: Theme) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  maxHeight: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  display: 'flex',
  flexDirection: "column",
  overflowY: 'scroll',
  gap: '2rem',
  p: 4,
  [theme.breakpoints.down("sm")]: {
    width: "100%", // Full width on mobile
    p: 2,
  },
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};



export default function PatrimonyAccessoryModal() {
  const { id_patrimonio } = useParams();
  const {
    deletingPatrimonyAccessory,
    refreshPatrimonyAccessory,
    refreshPatrimonyAccessoryFiles,
    toggleCreatingPatrimonyAccessory,
    toggleDeletingPatrimonyAccessory,
    toggleRefreshPatrimonyAccessory,
  } = useContext(PatrimonyInfoContext);
  const [accessories, setAccessories] = useState<PatrimonyAccessory[]>([]);
  useState<PatrimonyAccessory | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [accessoryFileMap, setAccessoryFileMap] =
    useState<Map<PatrimonyAccessory, PatrimonyAccessoryFile[]>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchPatrimonyAccessoryFiles = async (patrimonyAccessoryId: number) => {
    const data = await getPatrimonyAccessoryFiles(patrimonyAccessoryId);
    if (data) {
      return data;
    }
  };

  const setFilesAccordingToAccessory = async (data: PatrimonyAccessory[]) => {
    const tempMap = new Map(accessoryFileMap);
    for (const accessory of data) {
      const files = await fetchPatrimonyAccessoryFiles(
        accessory.id_acessorio_patrimonio
      );
      if (files) {
        tempMap.set(accessory, files);
      }
    }
    setAccessoryFileMap(tempMap);
  };
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAccessoriesByPatrimonyId(Number(id_patrimonio));
      setAccessories(data);
      setFilesAccordingToAccessory(data);
    };
    fetchData();
  }, [refreshPatrimonyAccessory, refreshPatrimonyAccessoryFiles]);

  const handleClose = () => setOpen(false);




  const handleOpenCreatePatrimonyAccessory = () => {
    toggleCreatingPatrimonyAccessory();
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleCloseDeletePatrimonyAccessory = () => {
    toggleDeletingPatrimonyAccessory(false);
  };

  const handleDeletePatrimonyAccessory = async () => {
    if (deletingPatrimonyAccessory[1]) {
      const response = await deletePatrimonyAccessory(
        deletingPatrimonyAccessory[1]?.id_acessorio_patrimonio
      );
      if (response && response.status === 200) {
        toggleRefreshPatrimonyAccessory();
        toggleDeletingPatrimonyAccessory(false);
      }
    }
  };
  const renderAcessoryImage = (accessory: PatrimonyAccessory) => {
    if (accessoryFileMap?.get(accessory)) {
      const files = accessoryFileMap?.get(accessory);
      if (files && files[0]) return files[files.length - 1].arquivo;
      return CameraFileLogo;
    }
  };
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, accessoryId: number) => {

    if (e.target.files) {
      setIsLoading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const response = await createPatrimonyAccessoryFile(
        Number(accessoryId),
        formData
      );
      if (response && response.status === 200) {
        setIsLoading(false);
        toggleRefreshPatrimonyAccessory();
        return;
      }
      window.alert("Erro ao fazer upload!");
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Badge badgeContent={accessories.length} color="primary">
        <Tooltip title="Acessórios">
          <IconButton onClick={handleOpen}>
            <HomeRepairServiceIcon sx={{ color: "#F7941E" }} />
          </IconButton>
        </Tooltip>
      </Badge>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle(theme)}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2">
              Acessórios do Patrimônio
            </Typography>
            <Stack direction="row">
              <IconButton
                sx={{ color: "#F7941E" }}
                onClick={handleOpenCreatePatrimonyAccessory}
              >
                <AddCircleIcon />
              </IconButton>
              <IconButton sx={{ color: "red" }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="column" gap="1rem" alignItems="center">
            {accessories &&
              accessories.map((accessory, index) => (
                <Card sx={{ borderRadius: "10px", width: 300 }}>
                  <CardMedia
                    image={isLoading ? "" : renderAcessoryImage(accessory)}
                    sx={{ height: 200 }}
                  >
                    {isLoading && (
                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 2, height: "100%" }}
                      >
                        <CircularProgress />
                      </Stack>
                    )}
                  </CardMedia>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography textTransform="capitalize" color="blue">
                        {accessory.nome}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          toggleDeletingPatrimonyAccessory(
                            true,
                            accessories[index]
                          )
                        }
                      >
                        <DeleteIcon sx={{ color: "#F7941E" }} />
                      </IconButton>
                    </Stack>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        mt: 2,
                        width: isMobile ? "100%" : "auto", // Responsividade no botão
                      }}
                    >
                      Anexar
                      <VisuallyHiddenInput
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleUploadFile(e, accessory.id_acessorio_patrimonio)
                        }
                        sx={BaseButtonStyles}
                        type="file"
                      />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </Stack>
          <CreatePatrimonyAccessoryModal />
          <Modal
            open={deletingPatrimonyAccessory[0]}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                ...style,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Tem erteza de que deseja deletar este acessório?{" "}
              </Typography>

              <Stack direction="row" justifyContent="center" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleDeletePatrimonyAccessory}
                  sx={{ borderColor: "blue", color: "blue" }}
                >
                  Sim
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ borderColor: "red", color: "red" }}
                  onClick={handleCloseDeletePatrimonyAccessory}
                >
                  Não
                </Button>
              </Stack>
            </Box>
          </Modal>
        </Box>
      </Modal>
    </div>
  );
}
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});