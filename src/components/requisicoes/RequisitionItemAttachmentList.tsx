import { Box, Typography, CircularProgress, List, ListItem, Stack, ListItemSecondaryAction, Tooltip, IconButton, Button } from '@mui/material';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RequisitionItemAttachment } from '../../models/requisicoes/RequisitionItemAttachment';
import { RootState } from '../../redux/store';
import FirebaseService from '../../services/FireBaseService';
import BaseDeleteDialog from '../shared/BaseDeleteDialog';
import BaseInputDialog from '../shared/BaseInputDialog';
import BaseViewFileDialog from '../shared/BaseVIewFileDialog';
import StyledLink from '../shared/StyledLink';
import { RequisitionItemAttachmentService } from '../../services/requisicoes/RequisitionItemAttachmentService';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import { setRefresh } from '../../redux/slices/requisicoes/requisitionItemSlice';
import useReqItemAttachmentPermissions from '../../hooks/requisicoes/useReqItemAttachmentPermissions';


const RequisitionItemAttachmentList = () => {
 

  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState<RequisitionItemAttachment[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFile, setDeletingFile] =
    useState<RequisitionItemAttachment | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<RequisitionItemAttachment | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInput, setLinkInput] = useState<string>("");
  const { viewingItemAttachment, viewingItemAttachmentType, refresh } = useSelector(
    (state: RootState) => state.requisitionItem
  );
  const { permissionToAdd } = useReqItemAttachmentPermissions();




  const openViewFile = (file: RequisitionItemAttachment) => {
    setSelectedFile(file);
  };

  const closeViewFile = () => {
    setSelectedFile(null);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!viewingItemAttachment) return;
    const file = e.target.files[0];
    const newFile: Partial<RequisitionItemAttachment> = {
      arquivo: "",
      id_item_requisicao: viewingItemAttachment,
      nome_arquivo: file.name,
      tipo: viewingItemAttachmentType,
    };
    setLoading(true);
    try {
      const fileUrl = await FirebaseService.upload(file, file.name || "");
      newFile.arquivo = fileUrl;
      const createdFile = await RequisitionItemAttachmentService.create(
        newFile
      );
      setAttachments((prev) => [...prev, createdFile]);
      newFile.arquivo = fileUrl;
      fetchAttachments();
      dispatch(setRefresh(!refresh));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (file: RequisitionItemAttachment) => {
    setDeletingFile(file);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeletingFile(null);
    setDeleteDialogOpen(false);
  };

  const openLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const fetchAttachments = async () => {
    if (!viewingItemAttachment) return;
    setLoading(true);
    try {
      const attachments =
        await RequisitionItemAttachmentService.getByRequisitionItem(
          viewingItemAttachment,
          viewingItemAttachmentType
        );

      setAttachments(attachments);
    } catch (error: any) {
      setError("Erro ao buscar anexos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deletingFile) {
      try {
        // Só deleta do Firebase se for arquivo do Firebase Storage
        const isFirebaseFile =
          typeof deletingFile.arquivo === "string" &&
          deletingFile.arquivo.startsWith("https://firebasestorage.googleapis.com/");
        if (isFirebaseFile) {
          await FirebaseService.delete(deletingFile.arquivo);
        }
      } catch (e: any) {}
      try {
        await RequisitionItemAttachmentService.delete(
          deletingFile.id_anexo_item_requisicao
        );
        setAttachments(
          attachments.filter(
            (file) =>
              file.id_anexo_item_requisicao !==
              deletingFile.id_anexo_item_requisicao
          )
        );
        setDeletingFile(null);
        setDeleteDialogOpen(false);
      } catch (error: any) {
        setError("Erro ao deletar anexo.");
      }
    }
  };

  const handleAddLink = async () => {
    if (!viewingItemAttachment) return;
    if (linkInput) {
      const newAttachment = await RequisitionItemAttachmentService.create({
        id_item_requisicao: viewingItemAttachment,
        nome_arquivo: '',
        arquivo: linkInput.substring(0, 255),
        tipo: viewingItemAttachmentType,
      });
      setAttachments([...attachments, newAttachment]);
      setLinkDialogOpen(false);
      setLinkInput('');
    }
  };

  useEffect(() => {
    if (viewingItemAttachment !== null) {
      fetchAttachments();
    }
  }, [viewingItemAttachment, viewingItemAttachmentType]);

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
        <List sx={{ maxHeight: 300, overflow: "auto" }}>
          {attachments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum anexo encontrado.
            </Typography>
          )}
          {attachments.map((file) => (
            <ListItem
              key={file.id_anexo_item_requisicao}
              divider
              sx={{ height: 100 }}
            >
              <Stack direction="column" alignItems="start" gap={0.2}>
                <Box
                  component={"img"}
                  sx={{ height: 50, width: 50, borderRadius: 2, boxShadow: 1 }}
                  src={file.arquivo}
                />
                <StyledLink
                  link={file.arquivo}
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
                      file.arquivo.toLowerCase().includes(ext)
                    );
                    if (isFile) {
                      openViewFile(file);
                    } else if (
                      file.arquivo.startsWith("http://") ||
                      file.arquivo.startsWith("https://")
                    ) {
                      window.open(file.arquivo, "_blank");
                    }
                  }}
                />
                {/* <Typography fontSize="12px" color="text.secondary">
                  Por: {file.pessoa_criado_por?.NOME || ""}
                </Typography> */}
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
      {permissionToAdd && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "start", sm: "center" }}
          sx={{ gap: 0.5 }}
        >
          <Button
            startIcon={<CloudUploadIcon sx={{ height: "20px" }} />}
            sx={{ fontSize: "small" }}
            disabled={loading}
            component="label"
          >
            Adicionar Anexo
            <input type="file" hidden onChange={handleFileChange} accept="*" />
          </Button>
          <Button
            variant="contained"
            startIcon={<LinkIcon sx={{ height: "20px", width: "20px" }} />}
            sx={{ fontSize: "small" }}
            disabled={loading}
            onClick={openLinkDialog}
          >
            Adicionar Link
          </Button>
        </Stack>
      )}
      <BaseDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
      <BaseViewFileDialog
        open={selectedFile !== null}
        onClose={closeViewFile}
        fileUrl={selectedFile?.arquivo || ""}
        title={"Visualizar anexo"}
      />
      <BaseInputDialog
        open={   linkDialogOpen}
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
}

export default RequisitionItemAttachmentList
