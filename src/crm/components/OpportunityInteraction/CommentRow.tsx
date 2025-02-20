import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Alert,
  AlertColor,
} from "@mui/material";
import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { userContext } from "../../../Requisitions/context/userContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import { Comentario } from "../../types";
import {  formatDateWithNoTime } from "../../../generalUtilities";
import { alertAnimation, buttonStylesMobile } from "../../../utilStyles";
import { AlertInterface } from "../../../Requisitions/types";
import { AnimatePresence, motion } from "framer-motion";

interface props {
  index: number;
  comment: Comentario;
  style: CSSProperties;
  setCommentBeingEdit: Dispatch<SetStateAction<Comentario | undefined>>;
}
const CommentRow = ({ index, comment, style, setCommentBeingEdit }: props) => {
  const { user } = useContext(userContext);

  const [alert, setAlert] = useState<AlertInterface>();

  const commentBelongsToUser = (comment: Comentario) => {
    return (user?.NOME === comment.criadoPor);
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const handleStartEdition = () => {
    if (commentBelongsToUser(comment)) {
      setCommentBeingEdit(comment);
      return;
    }
    displayAlert('warning', 'Você não tem permissão para editar o comentário');
  };

  return (
    <ListItem
      key={index}
      alignItems="flex-start"
      style={{ ...style }}
      //   style={style}
    >
      <ListItemAvatar>
        <Avatar>
          <AccountCircleIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={comment.descricao || "Comentário vazio"}
        secondary={
          comment.criadoPor
            ? `Por: ${comment.criadoPor} | ${formatDateWithNoTime(
                comment.criadoEm || ""
              )}`
            : "Autor desconhecido"
        }
      />
      {user?.CODPESSOA === 2 && (
        <IconButton
          sx={{ ...buttonStylesMobile, marginX: 2}}
          onClick={() => handleStartEdition()}
        >
          <EditIcon />
        </IconButton>
      )}
      <AnimatePresence>
        {alert && (
          <motion.div {...alertAnimation}>
            <Alert severity={alert?.severity as AlertColor}>
              {alert?.message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </ListItem>
  );
};
export default CommentRow;
