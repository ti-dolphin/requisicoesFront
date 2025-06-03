/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { styled } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import Fade from "@mui/material/Fade";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AttachFile from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams } from "react-router-dom";
import { PatrimonyFile } from "../../../types.ts";
import { useContext, useEffect, useState } from "react";
import {
  createPatrimonyfile,
  getPatrimonyFiles,
  getResponsableForPatrimony,
} from "../../../utils.tsx";
import { PatrimonyFileContext } from "../../../context/patrimonyFileContext.tsx";
import DeletePatrimonyFileModal from "../DeletePatrimonyFileModal/DeletePatrimonyFileModal.tsx";
import { userContext } from "../../../../Requisitions/context/userContext.tsx";
import { BaseButtonStyles } from "../../../../utilStyles.ts";
import { styles } from "./PatirmonyFileModal.styles.ts";
import typographyStyles from "../../../../Requisitions/utilStyles.ts";
import PatrimonyFileCard from "../../PatrimonyFileCard/PatrionyFileCard.tsx";

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

//MAIN COMPONENT
export default function PatrimonyFileModal() {
  const { id_patrimonio } = useParams();
  const { user } = useContext(userContext);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [fileData, setFileData] = useState<PatrimonyFile[]>();
  const { refreshPatrimonyFile, toggleRefreshPatrimonyFile } =
    useContext(PatrimonyFileContext);
  useContext(PatrimonyFileContext);
  const [responsable, setResponsable] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modaleHeaderRef = React.useRef<HTMLDivElement>(null)

  const fetchPatrimonyFiles = async () => {
    const data = await getPatrimonyFiles(Number(id_patrimonio));
    const responsableData = await getResponsableForPatrimony(
      Number(id_patrimonio)
    );

    if (responsableData) {
      setResponsable(responsableData[0].id_responsavel);
    }
    if (data) {
      setFileData(data);
    }
  };
 
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && id_patrimonio) {
      setIsLoading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const response = await createPatrimonyfile(
        Number(id_patrimonio),
        formData
      );

      if (response && response.status === 200) {
        setIsLoading(false);
        toggleRefreshPatrimonyFile();
        return;
      }
      window.alert("Erro ao fazer upload!");
      setIsLoading(false);
    }
  };
  const allowedToAttachFile = () => {
    return user?.CODPESSOA === responsable || user?.PERM_ADMINISTRADOR;
  };

  useEffect(() => {

    fetchPatrimonyFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPatrimonyFile]);

 

  return (
    <div>
      <Badge badgeContent={fileData?.length || 0} color="primary" sx={styles.badge}>
        <Tooltip title="Anexos do patrimônio">
          <IconButton onClick={handleOpen} sx={styles.iconButton}>
            <AttachFile />
          </IconButton>
        </Tooltip>
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
          <Box sx={styles.modalContent}>
         
            <DeletePatrimonyFileModal />
            
            <Stack sx={styles.modalHeader} ref={modaleHeaderRef}>
              <IconButton onClick={handleClose} sx={styles.closeIconButton}>
                <CloseIcon />
              </IconButton>
              <Typography sx={typographyStyles.heading2}>
                Anexos do patrimônio
              </Typography>
              {allowedToAttachFile() && (
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  sx={{ ...BaseButtonStyles, width: 100 }}
                >
                  Anexar
                  <VisuallyHiddenInput
                    accept="image/*, application/pdf"
                    capture="environment"
                    onChange={handleUploadFile}
                    type="file"
                    sx={BaseButtonStyles}
                  />
                </Button>
              )}
            </Stack>

            {isLoading && (
              <Stack sx={styles.loadingStack}>
                <CircularProgress />
              </Stack>
            )}
            {
              modaleHeaderRef && 
              <Stack sx={{ ...styles.fileListStack }}>
                {fileData?.map((file) => (
                    <PatrimonyFileCard 
                      key={file.id_anexo_patrimonio}
                      file={file}
                    />
                ))}
              </Stack>
            }
          </Box>
        </Fade>
      </Modal>

     
    </div>
  );
}

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

