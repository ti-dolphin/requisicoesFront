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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import { getAccessoriesByPatrimonyId } from "../utils"; // Assuming this function exists
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
  const { toggleCreatingPatrimonyAccessory, refreshPatrimonyAccessory } =
    useContext(PatrimonyInfoContext);
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

  return (
    <div>
      <Badge>
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
              <IconButton onClick={handleOpenCreatePatrimonyAccessory}>
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
        </Box>
      </Modal>
    </div>
  );
}
