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
import { Badge, BadgeProps, Button, CircularProgress, Stack } from "@mui/material";
import {
  deleteRequisitionFile,
  getRequisitionFiles,
  postRequisitionLinkFile,
} from "../../utils";
import { anexoRequisicao, InteractiveListProps, ItemFile } from "../../types";
import { useState } from "react";
import DeleteRequisitionFileModal from "./warnings/DeleteRequisitionFileModal";
import { OpenFileModalProps } from "../../types";
import CloseIcon from "@mui/icons-material/Close";
import { RequisitionContext } from "../../context/RequisitionContext";
import { userContext } from "../../context/userContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OpenFileModal = ({
  ID_REQUISICAO,
  currentStatus,
}: OpenFileModalProps) => {
  const { activeStep } = React.useContext(RequisitionContext);
  const { user } = React.useContext(userContext);

  const [requisitionFiles, setRequisitionFiles] = useState<anexoRequisicao[]>(
    []
  );
  const [open, setOpen] = React.useState(false);
  const [refreshToggler, setRefreshToggler] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isInputLinkOpen, setIsInputLinkOpen] = useState<boolean>(false);
  const [inputlinkValue, setInputlinkValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputlinkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputlinkValue(e.target.value);
  };

  const handleSaveLink = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      setIsLoading(true);
      console.log("inputlinkValue ", inputlinkValue);
      const response = await postRequisitionLinkFile(
        ID_REQUISICAO,
        inputlinkValue
      );
      if (response?.status === 200){ 
         setIsInputLinkOpen(false);
         setIsLoading(false);
      }
      setInputlinkValue("");
      setRefreshToggler(!refreshToggler);
      return;
    }
  };

  const handleOpenInputLink = () => {
    setIsInputLinkOpen(true);
  };
  const handleCloseInputLink = () => {
    setIsInputLinkOpen(false);
  };

  const fetchRequisitionFiles = async () => {
    const data = await getRequisitionFiles(ID_REQUISICAO);
    if (data) {
      setRequisitionFiles(data);
      return;
    }
    setRequisitionFiles([]);
  };

  const attachFileAllowed = ( ) => { 
    if(activeStep !== undefined && activeStep < 1 ){ 
      return true;
    }
    if(user && user.PERM_COMPRADOR){ 
      return true;
    }
  }

  React.useEffect(() => {
    fetchRequisitionFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggler]);
  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    "& .MuiBadge-badge": {
      ...theme,
    },
  }));
  return (
    <div>
      <IconButton
        sx={{
          border: "none",
          height: "30px",
          borderRadius: "0px",
          display: "flex",
          alignItems: "center",
          alignSelf: "center",
          gap: "0.5rem",
        }}
        onClick={handleOpen}
      >
        <Typography sx={{ color: "#2B3990", textDecoration: "underline" }}>
          Anexos
        </Typography>

        <StyledBadge badgeContent={requisitionFiles.length} color="secondary">
          <AttachFileIcon />
        </StyledBadge>
      </IconButton>
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
              textAlign="center"
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Anexos da Requisição
            </Typography>
            <Stack justifyContent="center" direction="row" spacing={2}>
              {attachFileAllowed() && (
                <>
                  <InputFile
                    setIsLoading={setIsLoading}
                    id={ID_REQUISICAO}
                    setRefreshToggler={setRefreshToggler}
                    refreshToggler={refreshToggler}
                  />
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      "&:active": {
                        backgroundColor: "transparent", // Altere a cor de fundo ao clicar
                      },
                    }}
                    onClick={handleOpenInputLink}
                  >
                    Anexar Link
                  </Button>
                </>
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
            </Stack>
            {isLoading && (
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Enviando...</Typography>
              </Stack>
            )}
            {requisitionFiles.length > 0 && !isLoading && (
              <InteractiveList
                currentStatus={currentStatus}
                files={requisitionFiles}
                refreshToggler={refreshToggler}
                setRefreshToggler={setRefreshToggler}
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
  currentStatus
}: InteractiveListProps) {
  const [dense] = React.useState(false);
  const [
    isDeleteRequisitionFileModalOpen,
    setIsDeleteRequisitionFileModalOpen,
  ] = useState<boolean>(false);
  const [currentFileIdBeingDeleted, setCurrentFileIdbeingDeleted] = useState<
    ItemFile | anexoRequisicao
  >();

  const handleDelete = async (file : ItemFile | anexoRequisicao) => {
    const responseStatus = await deleteRequisitionFile(file);
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
                  currentStatus === "Em edição" && (
                    <IconButton
                      onClick={() => {
                        setCurrentFileIdbeingDeleted(item);
                        setIsDeleteRequisitionFileModalOpen(
                          !isDeleteRequisitionFileModalOpen
                        );
                      }}
                      edge="end"
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
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
                  style={{ overflowX: "hidden" }}
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
      {currentFileIdBeingDeleted && (
        <DeleteRequisitionFileModal
          isDeleteRequisitionFileModalOpen={isDeleteRequisitionFileModalOpen}
          setIsDeleteRequisitionFileModalOpen={
            setIsDeleteRequisitionFileModalOpen
          }
          handleDelete={handleDelete}
          currentFileIdBeingDeleted={currentFileIdBeingDeleted}
        />
      )}
    </Box>
  );
}

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

export default OpenFileModal;
