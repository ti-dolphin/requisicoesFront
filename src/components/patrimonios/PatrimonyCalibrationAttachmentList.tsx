import React, { ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { setFeedback } from '../../redux/slices/feedBackSlice';
import FirebaseService from '../../services/FireBaseService';
import PatrimonyCalibrationAttachmentService, {
  PatrimonyCalibrationAttachment,
} from '../../services/PatrimonyCalibrationAttachmentService';
import BaseDeleteDialog from '../shared/BaseDeleteDialog';
import BaseViewFileDialog from '../shared/BaseVIewFileDialog';
import StyledLink from '../shared/StyledLink';

interface PatrimonyCalibrationAttachmentListProps {
  open: boolean;
  onClose: () => void;
}

const PatrimonyCalibrationAttachmentList: React.FC<
  PatrimonyCalibrationAttachmentListProps
> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { id_patrimonio } = useParams();

  const [attachments, setAttachments] = React.useState<
    PatrimonyCalibrationAttachment[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [attachmentBeingDeleted, setAttachmentBeingDeleted] =
    React.useState<PatrimonyCalibrationAttachment | null>(null);
  const [selectedFile, setSelectedFile] =
    React.useState<PatrimonyCalibrationAttachment | null>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !id_patrimonio) {
      return;
    }

    const file = e.target.files[0];
    setLoading(true);

    try {
      const fileUrl = await FirebaseService.upload(file, file.name);

      const payload = {
        id_patrimonio: Number(id_patrimonio),
        nome_arquivo: file.name,
        arquivo: fileUrl,
      };

      const createdFile = await PatrimonyCalibrationAttachmentService.create(
        payload
      );

      setAttachments((prev) => [createdFile, ...prev]);
      dispatch(
        setFeedback({
          message: 'Laudo de calibração adicionado!',
          type: 'success',
        })
      );
    } catch (err: any) {
      dispatch(
        setFeedback({
          message: `Houve um erro ao adicionar o laudo: ${err.message}`,
          type: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchData = React.useCallback(async () => {
    if (!id_patrimonio) {
      return;
    }

    setLoading(true);
    try {
      const data = await PatrimonyCalibrationAttachmentService.getMany(
        Number(id_patrimonio)
      );
      setAttachments(data);
    } catch {
      dispatch(
        setFeedback({
          message: 'Erro ao buscar laudos de calibração',
          type: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, id_patrimonio]);

  const handleDelete = React.useCallback(async () => {
    if (!attachmentBeingDeleted) {
      return;
    }

    try {
      const { id } = attachmentBeingDeleted;
      await FirebaseService.delete(attachmentBeingDeleted.arquivo);
      await PatrimonyCalibrationAttachmentService.delete(id);
      setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
      dispatch(
        setFeedback({
          message: 'Laudo excluído com sucesso',
          type: 'success',
        })
      );
      setAttachmentBeingDeleted(null);
    } catch {
      dispatch(
        setFeedback({
          message: 'Erro ao excluir laudo',
          type: 'error',
        })
      );
    }
  }, [attachmentBeingDeleted, dispatch]);

  React.useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="primary.main">
              Anexo de Calibração
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 250,
            }}
          >
            {!loading && attachments.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                Nenhum laudo de calibração adicionado ainda.
              </Typography>
            )}

            {!loading && attachments.length > 0 && (
              <List sx={{ width: '100%' }}>
                {attachments.map((attachment, index) => (
                  <ListItem
                    divider
                    sx={{ maxHeight: 60 }}
                    key={attachment.id}
                  >
                    <Stack sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography variant="body2">{`${index + 1}..`}</Typography>
                        <StyledLink
                          link={attachment.nome_arquivo}
                          onClick={() => setSelectedFile(attachment)}
                        />
                      </Stack>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => setAttachmentBeingDeleted(attachment)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}

            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 4,
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ width: '100%', justifyContent: 'flex-end', px: 2, py: 1 }}
          >
            <Button
              variant="contained"
              component="label"
              size="small"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              Adicionar Laudo
              <input
                type="file"
                hidden
                onChange={handleUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <BaseDeleteDialog
        open={Boolean(attachmentBeingDeleted)}
        onConfirm={handleDelete}
        onCancel={() => setAttachmentBeingDeleted(null)}
      />

      <BaseViewFileDialog
        open={selectedFile !== null}
        onClose={() => setSelectedFile(null)}
        fileUrl={selectedFile?.arquivo || ''}
        title={selectedFile?.nome_arquivo || ''}
      />
    </>
  );
};

export default PatrimonyCalibrationAttachmentList;