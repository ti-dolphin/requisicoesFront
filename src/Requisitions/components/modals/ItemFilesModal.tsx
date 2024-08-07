import Modal from "@mui/material/Modal";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import InputFile from "../../pages/requisitionDetail/components/InputFile";
import { Badge, BadgeProps, Button, Stack } from "@mui/material";
import { deleteItemFile, fetchItemFiles, postItemLinkFile } from "../../utils";
import { InteractiveListProps, ItemFile } from "../../types";
import { useState } from "react";
import DeleteRequisitionFileModal from "./warnings/DeleteRequisitionFileModal";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: "80%",
    md: "70%",
    lg: "40%",
    xl: "30%",
  },
  overflowY: "auto",
  maxHeight: 400,
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  boxShadow: 24,
  p: 4,
};
const styleInputlink = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};
interface ItemFilesModalProps {
  itemID: number;
  editItemsAllowed?: boolean;
  displayAlert?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ItemFilesModal = ({ itemID, editItemsAllowed }: ItemFilesModalProps) => {
  const [ItemFiles, setItemFiles] = useState<ItemFile[]>([]);
  const [open, setOpen] = React.useState(false);
  const [refreshToggler, setRefreshToggler] = useState(false);
  const [isInputLinkOpen, setIsInputLinkOpen] = useState<boolean>(false);
  const [inputlinkValue, setInputlinkValue] = useState<string>("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputlinkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputlinkValue(e.target.value);
  };

  const handleOpenInputLink = () => {
    setIsInputLinkOpen(true);
  };

  const handleCloseInputLink = () => {
    setIsInputLinkOpen(false);
  };
  const handleSaveLink = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      const response = await postItemLinkFile(itemID, inputlinkValue);
      if (response?.status === 200) setIsInputLinkOpen(false);
      setInputlinkValue("");
      setRefreshToggler(!refreshToggler);
      return;
    }
  };

  const getItemFiles = async () => {
    const response = await fetchItemFiles(itemID);
    if (response) {
      console.log("response.data - itemFilesModal: ", ItemFiles);
      setItemFiles(response.data);
      return;
    }
    setItemFiles([]);
  };

  React.useEffect(() => {
    getItemFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggler]);
  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    "& .MuiBadge-badge": {
      ...theme,
    },
  }));

  return (
    <div>
      <button
        onClick={handleOpen}
        className="cursor-pointer  text-blue-800 hover:text-blue-500"
      >
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <AttachFileIcon sx={{ rotate: "45deg" }} />
          <StyledBadge
            badgeContent={ItemFiles.length}
            color="secondary"
          ></StyledBadge>
        </Stack>
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <button
            onClick={handleClose}
            style={{
              color: "red",
              position: "absolute",
              right: "1rem",
              top: "1rem",
            }}
          >
            <CloseIcon />
          </button>
          <Stack direction="column" spacing={2}>
            <Typography
              color="primary"
              textAlign="center"
              id="modal-modal-title"
              component="h2"
            >
              Anexos do Item
            </Typography>

            {editItemsAllowed && (
              <Stack justifyContent="center" spacing={2} direction="row">
                <InputFile
                  id={itemID}
                  setRefreshToggler={setRefreshToggler}
                  refreshToggler={refreshToggler}
                  caller="ItemFilesModal"
                />
                <Button onClick={handleOpenInputLink} variant="outlined">
                  Anexar Link
                </Button>
              </Stack>
            )}
            <Modal
              open={isInputLinkOpen}
              onClose={handleCloseInputLink}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={styleInputlink}>
                <Stack direction="column" spacing={1}>
                  <Typography
                    color="primary"
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Insira o link
                  </Typography>
                  <input
                    className="border border-blue-700 rounded-sm outline-none"
                    value={inputlinkValue}
                    onChange={handleInputlinkChange}
                    onKeyDown={handleSaveLink}
                  />
                </Stack>
              </Box>
            </Modal>
            {ItemFiles.length > 0 && (
              <InteractiveList
                refreshToggler={refreshToggler}
                setRefreshToggler={setRefreshToggler}
                files={ItemFiles}
              />
            )}
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

function InteractiveList({
  files,
  setRefreshToggler,
  refreshToggler,
}: InteractiveListProps) {
  const [dense] = React.useState(false);
  const [
    isDeleteRequisitionFileModalOpen,
    setIsDeleteRequisitionFileModalOpen,
  ] = useState<boolean>(false);
  const [currentFileIdBeingDeleted, setCurrentFileIdbeingDeleted] =
    useState<number>(0);
  const handleDelete = async (id: number) => {
    const responseStatus = await deleteItemFile(id);
    if (responseStatus === 200) {
      setIsDeleteRequisitionFileModalOpen(false);
      setRefreshToggler(!refreshToggler);
      return;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid item xs={12} md={6}>
        <Demo>
          <List dense={dense}>
            {files.map((item) => (
              <ListItem
                secondaryAction={
                  <IconButton
                    onClick={() => {
                      setCurrentFileIdbeingDeleted(item.id);
                      setIsDeleteRequisitionFileModalOpen(
                        !isDeleteRequisitionFileModalOpen
                      );
                    }}
                    edge="end"
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <a href={item.arquivo} target="blank" download>
                      <FolderIcon />
                    </a>
                  </Avatar>
                </ListItemAvatar>
                <a
                  href={item.arquivo}
                  target="blank"
                  download
                  className="hover:text-blue-600 hover:underline"
                >
                  {item.nome_arquivo}
                </a>
              </ListItem>
            ))}
          </List>
        </Demo>
      </Grid>
      <DeleteRequisitionFileModal
        isDeleteRequisitionFileModalOpen={isDeleteRequisitionFileModalOpen}
        setIsDeleteRequisitionFileModalOpen={
          setIsDeleteRequisitionFileModalOpen
        }
        handleDelete={handleDelete}
        id={currentFileIdBeingDeleted}
      />
    </Box>
  );
}

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

export default ItemFilesModal;
