import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";

import StyledLink from "../shared/StyledLink";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import FirebaseService from "../../services/FireBaseService";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";
import { QuoteFile } from "../../models/requisicoes/QuoteFile";
import { QuoteFileService } from "../../services/requisicoes/QuoteFileService";
import BaseViewFileDialog from "../shared/BaseVIewFileDialog";
import BaseInputDialog from "../shared/BaseInputDialog";

interface QuoteAttachmentListProps {
  id_cotacao: number;
  allowAddLink?: boolean; // permite ativar/desativar o botão de link
}

const QuoteAttachmentList: React.FC<QuoteAttachmentListProps> = ({
  id_cotacao,
  allowAddLink = true,
}) => {
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.user);
  const [attachments, setAttachments] = useState<QuoteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState<QuoteFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<QuoteFile | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInput, setLinkInput] = useState<string>("");

  const sortAttachments = (files: QuoteFile[]) => {
    return [...files].sort((a, b) => {
      return Number(a.id_anexo_cotacao) - Number(b.id_anexo_cotacao);
    });
  };

  const openViewFile = (file: QuoteFile) => {
    setSelectedFile(file);
  };

  const closeViewFile = () => {
    setSelectedFile(null);
  };

  const openDeleteDialog = (file: QuoteFile) => {
    const admin = Number(user?.PERM_ADMINISTRADOR) === 1;
    const purchaser = Number(user?.PERM_COMPRADOR) === 1;
    const deleteFilePermittedForUser = admin || purchaser;

    if (!deleteFilePermittedForUser) {
      dispatch(
        setFeedback({
          message: "Você não tem permissão para excluir este anexo.",
          type: "error",
        })
      );
      return;
    }
    setDeletingFile(file);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeletingFile(null);
    setDeleteDialogOpen(false);
  };

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const files = await QuoteFileService.getMany({ id_cotacao });
      setAttachments(sortAttachments(files));
    } catch (err: any) {
      setError("Erro ao buscar anexos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line
  }, [id_cotacao]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const newFile: Partial<QuoteFile> = {
      id_cotacao,
      nome_arquivo: file.name,
      url: "",
    };
    setLoading(true);
    try {
      const fileUrl = await FirebaseService.upload(
        file,
        newFile.nome_arquivo || ""
      );
      newFile.url = fileUrl;
      const createdFile = await QuoteFileService.create(newFile);
      setAttachments((prev) => [...prev, createdFile]);
      fetchAttachments();
      dispatch(
        setFeedback({
          message: "Anexo adicionado!",
          type: "success",
        })
      );
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: `Houve um erro ao adicionar o anexo: ${err.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFile) return;
    const { id_anexo_cotacao } = deletingFile;
    setLoading(true);
    try {
      // Só deleta do Firebase se for arquivo do Firebase Storage
      const isFirebaseFile =
        typeof deletingFile.url === "string" &&
        deletingFile.url.startsWith("https://firebasestorage.googleapis.com/");
      if (isFirebaseFile) {
        await FirebaseService.delete(deletingFile.url);
      }
      await QuoteFileService.delete(id_anexo_cotacao);
      setAttachments((prev) =>
        prev.filter((a) => a.id_anexo_cotacao !== id_anexo_cotacao)
      );
      dispatch(
        setFeedback({
          message: "Anexo excluído!",
          type: "success",
        })
      );
      closeDeleteDialog();
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: `Erro ao excluir anexo: ${err.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const openLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkInput("");
  };

  const handleAddLink = async () => {
    if (!linkInput) return;
    setLoading(true);
    try {
      const newFile: Partial<QuoteFile> = {
        id_cotacao,
        nome_arquivo: linkInput.substring(0, 255),
        url: linkInput,
      };
      const createdFile = await QuoteFileService.create(newFile);
      setAttachments((prev) => [...prev, createdFile]);
      fetchAttachments();
      dispatch(
        setFeedback({
          message: "Link adicionado como anexo!",
          type: "success",
        })
      );
      closeLinkDialog();
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: `Houve um erro ao adicionar o link: ${err.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Typography color="error" mb={1}>
          {error}
        </Typography>
      )}
      {loading ? (
        <CircularProgress />
      ) : (
        <List sx={{ maxHeight: 220, overflow: "auto" }}>
          {attachments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum anexo encontrado.
            </Typography>
          )}
          {attachments.map((file, index) => (
            <ListItem
              key={file.id_anexo_cotacao}
              divider
              sx={{ pr: 6 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ width: "100%", minWidth: 0 }}
              >
                <Typography
                  fontSize="12px"
                  color="text.secondary"
                  sx={{ flexShrink: 0 }}
                >
                  {`${index + 1}-`}
                </Typography>
                <StyledLink
                  link={file.url}
                  maxWidth="100%"
                  onClick={() => {
                    const fileExtensions = [
                      ".pdf",
                      ".jpg",
                      ".jpeg",
                      ".png",
                      ".doc",
                      ".docx",
                      ".xls",
                      ".xlsx",
                    ];
                    const isFile = fileExtensions.some((ext) =>
                      file.url?.toLowerCase().includes(ext)
                    );
                    if (isFile) {
                      openViewFile(file);
                    } else if (
                      file.url?.startsWith("http://") ||
                      file.url?.startsWith("https://")
                    ) {
                      window.open(file.url, "_blank");
                    }
                  }}
                />
              </Stack>

              <ListItemSecondaryAction>
                <Tooltip title="Excluir">
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => openDeleteDialog(file)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "start", sm: "center" }}
        sx={{ gap: 0.5 }}
      >
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={loading}
        >
          Adicionar Anexo
          <input type="file" hidden onChange={handleFileChange} accept="*" />
        </Button>
        {allowAddLink && (
          <Button
            variant="contained"
            startIcon={<LinkIcon sx={{ height: "20px", width: "20px" }} />}
            sx={{ fontSize: "small" }}
            disabled={loading}
            onClick={openLinkDialog}
          >
            Adicionar Link
          </Button>
        )}
      </Stack>
      <BaseDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
      <BaseViewFileDialog
        open={selectedFile !== null}
        onClose={closeViewFile}
        fileUrl={selectedFile?.url || ""}
        title={selectedFile?.nome_arquivo}
      />
      <BaseInputDialog
        open={linkDialogOpen}
        onClose={closeLinkDialog}
        onConfirm={handleAddLink}
        title="Adicionar Link"
        inputLabel="URL do Link"
        inputValue={linkInput}
        onInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLinkInput(e.target.value)
        }
      />
    </Box>
  );
};

export default QuoteAttachmentList;
