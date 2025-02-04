/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { styled, css } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import Fade from "@mui/material/Fade";
import {
  Badge,
  BadgeProps,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { MovementationFileContext } from "../../../context/movementationFileContext";
import DeleteMovimentationFileModal from "../DeleteMovimentationFileModal/DeleteMovimentationFileModal";
import {
  createMovementationfile,
  getMovementationFiles,
  getResponsableForPatrimony,
} from "../../../utils";
import { MovementationFile } from "../../../types";
import { memo, useCallback, useEffect, useState } from "react";
import { userContext } from "../../../../Requisitions/context/userContext";
import { useParams } from "react-router-dom";

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

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

interface MovimentationFileModalProps {
  movementationId?: number;
}
//MAIN COMPONENT
const MovimentationFileModal = memo(
  ({ movementationId }: MovimentationFileModalProps) => {
    console.log("renderizou MovimentationFileModal");
    const {
      toggleMovementationFileOpen,
      movementationFileOpen,
      refreshMovementationFile,
      toggleRefreshMovementationFile,
      toggleDeletingMovimentationFile,
    } = React.useContext(MovementationFileContext);
    const { user } = React.useContext(userContext);
    const { id_patrimonio } = useParams();
    const handleOpen = () => toggleMovementationFileOpen(movementationId);
    const handleClose = () => toggleMovementationFileOpen();
    const [fileData, setFileData] = useState<MovementationFile[]>();
    const [responsable, setResponsable] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchFileData = useCallback(async () => {
      if (movementationId) {
        const fileData = await getMovementationFiles(movementationId);
        const responsable = await getResponsableForPatrimony(
          Number(id_patrimonio)
        );
        if (responsable) {
          setResponsable(responsable[0].id_responsavel);
        }
        if (fileData) {
          setFileData(fileData);
        }
      }
    }, [id_patrimonio, movementationId]);

    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("handleUploadFile");
      setIsLoading(true);
      if (movementationId && e.target.files) {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        try {
          await createMovementationfile(movementationId, formData);
          toggleRefreshMovementationFile();
        } catch (error) {
          alert("Error uploading file: \n" + error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const allowedToAttachFile = () => {
      return user?.CODPESSOA === responsable || user?.PERM_ADMINISTRADOR;
    };
    const isPDF = (file: MovementationFile) => {
      return /\.pdf$/i.test(file.arquivo);
    };

    const isImage = (file: MovementationFile) => {
      return /\.(jpg|jpeg|png|gif)$/i.test(file.arquivo);
    };

    const handleOpenLink = (url: string) => {
      window.open(url, "_blank");
    };

    useEffect(() => {
      fetchFileData();
    }, [fetchFileData, refreshMovementationFile]);

    return (
      <div>
        <Tooltip title="Anexos da movimentação">
          <IconButton aria-label="cart" onClick={handleOpen}>
            <StyledBadge badgeContent={fileData?.length} color="secondary">
              <AttachFile sx={{ color: "#F7941E" }} />
            </StyledBadge>
          </IconButton>
        </Tooltip>
        {/*  */}
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={
            movementationFileOpen[0] &&
            movementationFileOpen[1] === Number(movementationId)
          }
          onClose={handleClose}
          closeAfterTransition
          slots={{ backdrop: StyledBackdrop }}
        >
          <Fade in={movementationFileOpen[0]}>
            <ModalContent
              sx={{
                ...style,
                minWidth: "260px",
                width: {
                  xs: "260px",
                  sm: "400px",
                  md: "500px",
                  lg: "600px",
                },
              }}
            >
              <DeleteMovimentationFileModal />

              <Stack direction="row" justifyContent="center" padding={0.6}>
                <Stack>
                  <Typography variant="h6" textAlign="center">
                    Anexos
                  </Typography>
                  <Typography>
                    Movimentação: {movementationFileOpen[1]}
                  </Typography>
                </Stack>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    color: "red",
                    position: "absolute",
                    right: "1rem",
                    top: "1rem",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>

              {allowedToAttachFile() ? (
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                >
                  Anexar
                  <VisuallyHiddenInput
                    onChange={handleUploadFile}
                    type="file"
                  />
                </Button>
              ) : (
                ""
              )}

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

              {fileData?.map((file) => (
                <Box
                  sx={{ borderRadius: "10px" }}
                  className="border border-gray-300"
                >
                  <Stack
                    direction="row"
                    gap={1}
                    flexWrap="wrap"
                    padding={1}
                    height="fit-content"
                    sx={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                    }}
                  >
                    <Box
                      sx={{
                        height: {
                          xs: "100px",
                          sm: "150px",
                          md: "200px",
                          lg: "300px",
                        },
                        borderRadius: "10px",
                        width: {
                          xs: "100%",
                          sm: "100%",
                          lg: "100%",
                        },
                        background: isImage(file)
                          ? `url('${file.arquivo}')`
                          : "none",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {isPDF(file) && (
                        <object
                          data={file.arquivo}
                          type="application/pdf"
                          width="100%"
                          height="100%"
                        ></object>
                      )}
                    </Box>
                    <Box
                      sx={{
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        width: {
                          xs: "100%",
                          lg: "50%",
                        },
                      }}
                    >
                      <Typography
                        onClick={() => handleOpenLink(file.arquivo)}
                        fontSize="small"
                        overflow={"hidden"}
                      >
                        {file.nome_arquivo}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          toggleDeletingMovimentationFile(true, file)
                        }
                        sx={{
                          color: "blue",
                          textTransform: "underline",
                          marginLeft: 1,
                        }}
                      >
                        <DeleteIcon sx={{ color: "#F7941E" }} />
                      </IconButton>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </ModalContent>
          </Fade>
        </Modal>
      </div>
    );
  }
);

export default MovimentationFileModal;

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
