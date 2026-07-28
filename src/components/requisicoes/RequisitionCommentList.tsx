import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../redux/store";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { getDateStringFromISOstring } from "../../utils";
import RequisitionCommentService from "../../services/requisicoes/RequisitionCommentService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BaseDeleteDialog from "../shared/BaseDeleteDialog";
import { Requisition } from "../../models/requisicoes/Requisition";
import { ReducedUser } from "../../models/User";
import { addComment, removeComment, replaceComment, setComments } from "../../redux/slices/requisicoes/requisitionCommentSlice";
import { RequisitionComment } from "../../models/requisicoes/RequisitionComment";

interface RequisitionCommentListProps {
  fullScreen?: boolean;
}

const RequisitionCommentList = ({ fullScreen = false }: RequisitionCommentListProps) => {
  const dispatch = useDispatch();
  const { id_requisicao } = useParams<{ id_requisicao: string }>();
  const  refreshRequisition  = useSelector((state: RootState) => state.requisition.refreshRequisition);
  const refreshReqComments = useSelector((state: RootState) => state.requisitionComment.refreshReqComments);
  const user = useSelector((state: RootState) => state.user.user);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<RequisitionComment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const {comments} = useSelector((state: RootState) => state.requisitionComment);

  const fetchData = useCallback(async () => {
    try {
      const data = await RequisitionCommentService.getMany({ id_requisicao });
      //log data
      dispatch(setComments(data));
    } catch {
      dispatch(
        setFeedback({ type: "error", message: "Falha ao carregar comentários" })
      );
    }
  }, [dispatch, id_requisicao, refreshRequisition, refreshReqComments]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const permToEditOrDelete = (comment: RequisitionComment) => { 
    return  user?.CODPESSOA === comment.pessoa_criado_por?.CODPESSOA || !!user?.PERM_ADMINISTRADOR;
  }
  

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const createdComment = await RequisitionCommentService.create({
        id_requisicao: Number(id_requisicao),
        descricao: newComment,
        criado_por: user?.CODPESSOA || 0,
      });
      dispatch(addComment(createdComment));
      setNewComment("");
    } catch {
      dispatch(
        setFeedback({ type: "error", message: "Erro ao adicionar comentário" })
      );
    }
  };

  const handleEditComment = async () => {
    if (!editingComment || !editingComment.descricao.trim()) return;
    try {
      const updated = await RequisitionCommentService.update(
        editingComment.id_comentario_requisicao,
        { descricao: editingComment.descricao }
      );
      dispatch(replaceComment(updated));
      setEditDialogOpen(false);
      setEditingComment(null);
    } catch {
      dispatch(
        setFeedback({ type: "error", message: "Erro ao atualizar comentário" })
      );
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await RequisitionCommentService.delete(commentToDelete);
      dispatch(removeComment(commentToDelete));
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch {
      dispatch(
        setFeedback({ type: "error", message: "Erro ao excluir comentário" })
      );
    }
  };

  return (
    <Box
      sx={{
        maxWidth: fullScreen ? 'none' : 600,
        maxHeight: fullScreen ? 'none' : 250,
        overflow: "auto",
        mx: "auto",
        my: 2,
      }}
    >
      <TextField
        fullWidth
        placeholder="Adicionar comentário..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        variant="outlined"
        size="small"
        multiline
        maxRows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
          }
        }}
        sx={{
          mb: 1,
          "& .MuiInputBase-root": { fontSize: 13, py: 0.5 },
        }}
      />
      <List dense sx={{ py: 0 }}>
        {comments.map((comment) => (
          <ListItem
            key={comment.id_comentario_requisicao}
            disableGutters
            sx={{ py: 0.5 }}
            secondaryAction={
              permToEditOrDelete(comment) && (
                <>
                  {/* <IconButton
                    size="small"
                    onClick={() => {
                      setEditingComment(comment);
                      setEditDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton> */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setCommentToDelete(comment.id_comentario_requisicao);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                {comment.pessoa_criado_por?.NOME?.[0] || "?"}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
              secondaryTypographyProps={{ fontSize: 12, lineHeight: 1.2 }}
              primary={`${
                comment.pessoa_criado_por?.NOME
              } • ${getDateStringFromISOstring(comment.data_criacao)}`}
              secondary={comment.descricao}
            />
          </ListItem>
        ))}
      </List>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 16, py: 1 }}>
          Editar comentário
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            fullWidth
            value={editingComment?.descricao || ""}
            onChange={(e) =>
              setEditingComment((prev) =>
                prev ? { ...prev, descricao: e.target.value } : null
              )
            }
            variant="outlined"
            size="small"
            multiline
            maxRows={3}
          />
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button
            size="small"
            color="error"
            onClick={() => setEditDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button size="small" color="success" onClick={handleEditComment}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <BaseDeleteDialog
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteComment}
      />
    </Box>
  );
};

export default RequisitionCommentList;
