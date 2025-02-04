/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Typography,
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  styled,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { PatrimonyAccessoryFile } from "../../../types"; // Importe o tipo correto
import { PatrimonyInfoContext } from "../../../context/patrimonyInfoContext";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createPatrimonyAccessoryFile,
  deletePatrimonyAccessoryFile,
  getPatrimonyAccessoryFiles,
} from "../../../utils";
import { style } from "../../../../Requisitions/components/tables/ProductsTable";

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

interface PatrimonyAccessoryFileModalProps {
  open: boolean;
  selectedAccessory: {
    id_acessorio_patrimonio: number;
  } | null;
  handleCloseInnerModal: () => void;
  innerModalStyle: object;
}

const PatrimonyAccessoryFileModal: React.FC<
  PatrimonyAccessoryFileModalProps
> = ({ selectedAccessory, handleCloseInnerModal, innerModalStyle }) => {
  const [patrimonyAccessoryFiles, setPatrimonyAccessoryFiles] =
    useState<PatrimonyAccessoryFile[]>();
  const {
    deletingPatrimonyAccessoryFile,
    toggleDeletingPatrimonyAccessoryFile,
    toggleRefreshPatrimonyAccessoryFiles,
    refreshPatrimonyAccessoryFiles,
  } = useContext(PatrimonyInfoContext);

  const fetchPatrmonyAccessoryFiles = async () => {
    if (selectedAccessory) {
      const data = await getPatrimonyAccessoryFiles(
        selectedAccessory?.id_acessorio_patrimonio
      );
      if (data) {
        setPatrimonyAccessoryFiles(data);
      }
    }
  };

  useEffect(() => {
    fetchPatrmonyAccessoryFiles();
  }, [selectedAccessory, refreshPatrimonyAccessoryFiles]);

  function RenderRowAccessoryFile(
    props: ListChildComponentProps & { files: PatrimonyAccessoryFile[] }
  ) {
    const { index, style, files } = props;
    const { toggleDeletingPatrimonyAccessoryFile, deletingPatrimonyAccessoryFile } =
      useContext(PatrimonyInfoContext);

    const handleOpenfile = (fileLink: string) => {
      if (!deletingPatrimonyAccessoryFile[0]) {
        window.open(fileLink);
      }
    };
    return (
      <ListItem style={style} key={index} component="div">
        {files.length && (
          <ListItemButton>
            <Stack
              direction="row"
              alignItems="center"
              width="100%"
              justifyContent="space-between"
            >
              <Typography
                fontSize="small"
                sx={{ textDecoration: "underline", color: 'blue' }}
                onClick={() => handleOpenfile(files[index].arquivo)}
              >
                {files[index].nome}
              </Typography>
              <Stack direction={"row"}>
                <IconButton
                  onClick={() =>
                    toggleDeletingPatrimonyAccessoryFile(files[index])
                  }
                >
                  <DeleteIcon sx={{ color: "#F7941E" }} />
                </IconButton>
              </Stack>
            </Stack>
          </ListItemButton>
        )}
      </ListItem>
    );
  }

  const handleCloseDeleteFileModal = () => {
    toggleDeletingPatrimonyAccessoryFile();
  };

  const handleDeleteFile = async () => {
    if (deletingPatrimonyAccessoryFile[1]) {
      const response = await deletePatrimonyAccessoryFile(
        deletingPatrimonyAccessoryFile[1]?.id_anexo_acessorio_patrimonio,
        deletingPatrimonyAccessoryFile[1].nome
      );
      if (response && response.status === 200) {
        toggleRefreshPatrimonyAccessoryFiles();
        toggleDeletingPatrimonyAccessoryFile();
      }
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleUploadFile");
    console.log("e.target.files: ", e.target.files);
    console.log(
      "selectedAccessory?.id_acessorio_patrimonio: ",
      selectedAccessory?.id_acessorio_patrimonio
    );
    if (e.target.files && selectedAccessory?.id_acessorio_patrimonio) {
      setIsLoading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const response = await createPatrimonyAccessoryFile(
        Number(selectedAccessory?.id_acessorio_patrimonio),
        formData
      );
      if (response && response.status === 200) {
        setIsLoading(false);
        toggleRefreshPatrimonyAccessoryFiles();
        return;
      }
      window.alert("Erro ao fazer upload!");
      setIsLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal open={!!selectedAccessory} onClose={handleCloseInnerModal}>
      <Box
        sx={{
          ...innerModalStyle,
          width: isMobile ? "90%" : "50%", // Responsividade
          maxHeight: "90vh", // Garantir que o modal não ultrapasse a altura da tela
          overflowY: "auto", // Scroll se necessário
          p: 3,
          display: 'flex',
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography variant="h6">Anexos</Typography>
            <Typography>
              Acessório {selectedAccessory?.id_acessorio_patrimonio}
            </Typography>
          </Stack>
          <IconButton onClick={handleCloseInnerModal} sx={{ color: "red" }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack direction={"column"} spacing={4}>
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
              onChange={handleUploadFile} type="file" />
          </Button>

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

          {patrimonyAccessoryFiles && (
            <FixedSizeList
              height={400}
              width="100%"
              itemSize={isMobile ? 120 : 60}
              itemCount={patrimonyAccessoryFiles.length}
              overscanCount={5}
            >
              {({ index, style }) => (
                <RenderRowAccessoryFile
                  index={index}
                  style={style}
                  files={patrimonyAccessoryFiles}
                  data={undefined}
                />
              )}
            </FixedSizeList>
          )}
        </Stack>

        <Modal
          open={deletingPatrimonyAccessoryFile[0]}
          onClose={handleCloseDeleteFileModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              ...style,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxWidth: isMobile ? "90%" : "400px", // Responsividade para o modal de deletar
              p: 2,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Tem certeza de que deseja deletar este anexo do acessório?
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDeleteFile}
              >
                Sim
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCloseDeleteFileModal}
              >
                Não
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Modal>
  );
};

export default PatrimonyAccessoryFileModal;
