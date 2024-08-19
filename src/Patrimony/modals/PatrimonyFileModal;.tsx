import * as React from "react";
import { styled, css } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import Fade from "@mui/material/Fade";
import {
  Badge,
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import AttachFile from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import { PatrimonyFile } from "../types";
import { useContext, useEffect, useState } from "react";
import { createPatrimonyfile, getPatrimonyFiles } from "../utils";
import { PatrimonyFileContext } from "../context/patrimonyFileContext";
import DeletePatrimonyFileModal from "./DeletePatrimonyFileModal";

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

function RenderRow(props: ListChildComponentProps & {fileData  : PatrimonyFile[] }) {
  const { index, style, fileData } = props;
  const handleOpenLink = (url: string) => {
    window.open(url, "_blank");
  };
  const {toggleDeletingPatrimonyFile } = useContext(PatrimonyFileContext);
  return (
    <ListItem style={style} key={index} component="div">
      <ListItemButton>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ListItemText
            onClick={() => handleOpenLink(fileData[index].arquivo)}
            sx={{ textTransform: "underline", color: "blue" }}
            primary={`${fileData[index].nome_arquivo}`}
          />
          <IconButton
            onClick={() => toggleDeletingPatrimonyFile(true, fileData[index])}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </ListItemButton>
    </ListItem>
  );
}

//MAIN COMPONENT
export default function PatrimonyFileModal() {
  const { id_patrimonio } = useParams();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [fileData, setFileData] = useState<PatrimonyFile[]>();
  const {refreshPatrimonyFile, toggleRefreshPatrimonyFile } = useContext(PatrimonyFileContext);

  const fetchPatrimonyFiles = async( ) => { 
    const data = await getPatrimonyFiles(Number(id_patrimonio));
    if(data){ 
      console.log('\ndata\n: ', data);
      console.log('\ndata length: ', data.length)
      setFileData(data);
    }
  }

   const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && id_patrimonio) {
       console.log("id_patrimonio : ", id_patrimonio);
       const file = e.target.files[0];
       const formData = new FormData();
       formData.append("file", file);
       const response = await createPatrimonyfile(
         Number(id_patrimonio),
         formData
       );
       if (response && response.status === 200) {
         toggleRefreshPatrimonyFile();
         return;
       }
       window.alert("Erro ao fazer upload!");
     }
   };

   useEffect(() => {
    console.log("\n\nuseEffect ->  fetchPatrimonyFiles()");
     fetchPatrimonyFiles();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshPatrimonyFile]);
  
  return (
    <div>
      <Badge badgeContent={fileData?.length || 0} color="primary">
        <IconButton onClick={handleOpen}>
          <AttachFile />
        </IconButton>
      </Badge>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: StyledBackdrop }}
      >
        <Fade in={open}>
          <ModalContent
            sx={{
              ...style,
              minWidth: "300px",
              width: {
                xs: "300px",
                sm: "400px",
                md: "500px",
                lg: "600px",
              },
            }}
          >
            <DeletePatrimonyFileModal />
            <Stack direction="row" justifyContent="end">
              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  color: "red",
                  width: "10px",
                  right: "10px",
                }}
              >
                <CloseIcon />
              </Button>
            </Stack>

            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Anexar
              <VisuallyHiddenInput onChange={handleUploadFile} type="file" />
            </Button>

            <h2 id="transition-modal-title" className="modal-title">
              Anexos
            </h2>

            <FixedSizeList
              height={400}
              width="100%"
              itemSize={46}
              itemCount={fileData?.length || 0}
              overscanCount={5}
            >
              {({ index, style }) => (
                <RenderRow
                  index={index}
                  style={style}
                  fileData={fileData || []}
                  data={fileData}
                />
              )}
            </FixedSizeList>
          </ModalContent>
        </Fade>
      </Modal>
    </div>
  );
}
//MAIN COMPONENT

const Backdrop = React.forwardRef<HTMLDivElement, { open?: boolean }>(
  (props, ref) => {
    const { open, ...other } = props;
    return (
      <Fade in={open}>
        <div ref={ref} {...other} />
      </Fade>
    );
  }
);

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  overFlowX: "scroll",
};

const ModalContent = styled("div")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;

    flex-shrink: 1;
    background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 10px;
    color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};
    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `
);
