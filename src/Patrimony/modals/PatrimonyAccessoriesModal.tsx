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
  ListItemText
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

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const innerModalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function PatrimonyAccessoryModal() {
  const { id_patrimonio } = useParams();
  const { creatingPatrimonyAccessory, toggleCreatingPatrimonyAccessory } =
    useContext(PatrimonyInfoContext);
  const [accessories, setAccessories] = useState<PatrimonyAccessory[]>([]);
  const [selectedAccessory, setSelectedAccessory] = useState<PatrimonyAccessory | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAccessoriesByPatrimonyId(Number(id_patrimonio));
      console.log("data: ", data);
      setAccessories(data);
    };
    fetchData();
  }, []);

  const handleClose = () => toggleCreatingPatrimonyAccessory();

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

            <Stack direction={"row"}>
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

 

  return (
    <div>
      <Badge>
        <IconButton onClick={toggleCreatingPatrimonyAccessory}>
          <HomeRepairServiceIcon sx={{ color: "#F7941E" }} />
        </IconButton>
      </Badge>
      <Modal open={creatingPatrimonyAccessory} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="h6" component="h2">
              Acessórios do Patrimônio
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <FixedSizeList
            height={400}
            width="100%"
            itemSize={46}
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
              innerModalStyle={innerModalStyle}
           
            />
          )}
        </Box>
      </Modal>
    </div>
  );
}


