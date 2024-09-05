import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Typography,
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
  Box,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { PatrimonyAccessoryFile } from "../types"; // Importe o tipo correto
import { PatrimonyInfoContext } from "../context/patrimonyInfoContext";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createPatrimonyAccessoryFile,
  deletePatrimonyAccessoryFile,
  getPatrimonyAccessoryFiles,
} from "../utils";

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
> = ({
  selectedAccessory,

  handleCloseInnerModal,
  innerModalStyle,
}) => {
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
        console.log("data: ", data);
        setPatrimonyAccessoryFiles(data);
      }
    }
  };
  useEffect(() => {
    fetchPatrmonyAccessoryFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccessory, refreshPatrimonyAccessoryFiles]);

  function RenderRowAccessoryFile(
    props: ListChildComponentProps & { files: PatrimonyAccessoryFile[] }
  ) {
    const { index, style, files } = props;
    const { toggleDeletingPatrimonyAccessoryFile } =
      useContext(PatrimonyInfoContext);

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
              <ListItemText secondary={`${files[index].nome}`} />

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
    if (e.target.files && selectedAccessory?.id_acessorio_patrimonio) {
      setIsLoading(true);
      console.log(
        "selectedAccessory?.id_acessorio_patrimonio : ",
        selectedAccessory?.id_acessorio_patrimonio
      );
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
  return (
    <Modal open={!!selectedAccessory} onClose={handleCloseInnerModal}>
      <Box sx={innerModalStyle} display="flex" flexDirection="column" gap={3}>
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <Typography variant="h6">Anexos</Typography>
            <Typography>
              Acessório {selectedAccessory?.id_acessorio_patrimonio}
            </Typography>
          </Stack>
          <IconButton
            onClick={handleCloseInnerModal}
            // sx={{
            //   color: "red",
            //   width: "10px",
            //   right: "10px",
            // }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Anexar
          <VisuallyHiddenInput
            onChange={handleUploadFile} // Descomente ou implemente essa função
            type="file"
          />
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
            itemSize={46}
            itemCount={patrimonyAccessoryFiles.length}
            overscanCount={5}
          >
            {({ index, style }) => (
              <RenderRowAccessoryFile
                index={index}
                style={style}
                files={patrimonyAccessoryFiles}
                data={undefined} // Passe os dados adequados aqui se necessário
              />
            )}
          </FixedSizeList>
        )}

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
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              tem certeza de que deseja deletar este anexo do acessório?{" "}
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ borderColor: "blue", color: "blue" }}
                onClick={handleDeleteFile}
              >
                Sim
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ borderColor: "red", color: "red" }}
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
