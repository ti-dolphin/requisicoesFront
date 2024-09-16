/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Stack,
  Badge,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Theme,
  Button,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import { deletePatrimonyAccessory, getAccessoriesByPatrimonyId } from "../utils"; // Assuming this function exists
import { PatrimonyAccessory } from "../types";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { useParams } from "react-router-dom";
import PatrimonyAccessoryFileModal from "./PatrimonyAccessoryFileModal";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CreatePatrimonyAccessoryModal from "./CreatePatrimonyAccessory";

// Styles using breakpoints for responsiveness
const modalStyle = (theme: Theme) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
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

const innerModalStyle = (theme: Theme) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  [theme.breakpoints.down("sm")]: {
    width: "90%",
  },
});

export default function PatrimonyAccessoryModal() {
  const { id_patrimonio } = useParams();
  const {
    deletingPatrimonyAccessory,
    refreshPatrimonyAccessory,
    toggleCreatingPatrimonyAccessory,
    toggleDeletingPatrimonyAccessory,
    toggleRefreshPatrimonyAccessory,
  } = useContext(PatrimonyInfoContext);
  const [accessories, setAccessories] = useState<PatrimonyAccessory[]>([]);
  const [selectedAccessory, setSelectedAccessory] =
    useState<PatrimonyAccessory | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAccessoriesByPatrimonyId(Number(id_patrimonio));
      console.log("data: ", data);
      setAccessories(data);
    };
    fetchData();
  }, [refreshPatrimonyAccessory]);

  const handleClose = () => setOpen(false);

  const handleOpenInnerModal = (accessory: PatrimonyAccessory) => {
    setSelectedAccessory(accessory);
  };

  const handleCloseInnerModal = () => {
    setSelectedAccessory(null);
  };

  function RenderRow(
    props: ListChildComponentProps & { accessories: PatrimonyAccessory[] }
  ) {
    const { index, style, accessories } = props;
    const { toggleDeletingPatrimonyAccessory } =
      useContext(PatrimonyInfoContext);

    return (
      <ListItem style={style} key={index} component="div">
        <ListItemButton>
          <Stack
            direction="row"
            alignItems="center"
            width="100%"
            justifyContent="space-between"
          >
            <ListItemText secondary={`${accessories[index].nome}`} />
            <Stack direction="row">
              <IconButton
                onClick={() => handleOpenInnerModal(accessories[index])}
              >
                <AttachFileIcon sx={{ color: "#F7941E" }} />
              </IconButton>
              <IconButton
                onClick={() =>
                  toggleDeletingPatrimonyAccessory(true, accessories[index])
                }
              >
                <DeleteIcon sx={{ color: "#F7941E" }} />
              </IconButton>
            </Stack>
          </Stack>
        </ListItemButton>
      </ListItem>
    );
  }

  const handleOpenCreatePatrimonyAccessory = () => {
    toggleCreatingPatrimonyAccessory();
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleCloseDeletePatrimonyAccessory = () => {
    toggleDeletingPatrimonyAccessory(false);
  };

  const handleDeletePatrimonyAccessory = async( ) => {
   if(deletingPatrimonyAccessory[1]){ 
     const response = await deletePatrimonyAccessory(
       deletingPatrimonyAccessory[1]?.id_acessorio_patrimonio
     );
     if (response && response.status === 200) {
       toggleRefreshPatrimonyAccessory();
       toggleDeletingPatrimonyAccessory(false);
     }
   }
  };
  return (
    <div>
      <Badge badgeContent={accessories.length} color="primary">
        <IconButton onClick={handleOpen}>
          <HomeRepairServiceIcon sx={{ color: "#F7941E" }} />
        </IconButton>
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
          <FixedSizeList
            height={isMobile ? 300 : 400}
            width="100%"
            itemSize={isMobile ? 70 : 46}
            itemCount={accessories.length}
            overscanCount={5}
          >
            {({ index, style }) => (
              <RenderRow
                index={index}
                style={style}
                accessories={accessories}
                data={undefined}
              />
            )}
          </FixedSizeList>
          {selectedAccessory && (
            <PatrimonyAccessoryFileModal
              open={!!selectedAccessory}
              selectedAccessory={selectedAccessory}
              handleCloseInnerModal={handleCloseInnerModal}
              innerModalStyle={innerModalStyle(theme)}
            />
          )}
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
