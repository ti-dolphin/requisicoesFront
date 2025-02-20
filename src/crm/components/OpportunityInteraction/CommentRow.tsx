import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Alert,
  AlertColor,
  Typography,
  Box,
  Modal,
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
import { formatDateWithNoTime } from "../../../generalUtilities";
import { alertAnimation, buttonStylesMobile } from "../../../utilStyles";
import { AlertInterface } from "../../../Requisitions/types";
import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import typographyStyles from "../../../Requisitions/utilStyles";

interface props {
  index: number;
  comment: Comentario;
  style: CSSProperties;
  setCommentBeingEdit: Dispatch<SetStateAction<Comentario | undefined>>;
}
const CommentRow = ({ index, comment, style, setCommentBeingEdit }: props) => {
  const { user } = useContext(userContext);

  const [alert, setAlert] = useState<AlertInterface>();
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  const commentBelongsToUser = (comment: Comentario) => {
    return user?.NOME === comment.criadoPor;
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
    displayAlert("warning", "Você não tem permissão para editar o comentário");
  };
  const renderCommentPreview = (commentValue: string) => {
    if (commentValue.length > 50) {
      return comment.descricao?.substring(0, 40) + "...";
    }
    return comment.descricao;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <ListItem key={index} alignItems="flex-start" style={{ ...style }}>
        <ListItemAvatar>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <div onClick={handleOpenModal} style={{ cursor: "pointer" }}>
              {renderCommentPreview(comment.descricao as string) ||
                "Comentário vazio"}
            </div>
          }
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
            sx={{ ...buttonStylesMobile, marginX: 2 }}
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

      {/* Modal para exibir o conteúdo completo do comentário */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 0, top: 0 }}
          >
            <CloseIcon sx={{ color: "red" }}></CloseIcon>
          </IconButton>
          <Typography sx={{ ...typographyStyles.bodyText, textAlign: 'left'}}>
            {comment.descricao}
          </Typography>
        </Box>
      </Modal>
    </>
    // <ListItem
    //   key={index}
    //   alignItems="flex-start"
    //   style={{ ...style }}
    //   //   style={style}
    // >
    //   <ListItemAvatar>
    //     <Avatar>
    //       <AccountCircleIcon />
    //     </Avatar>
    //   </ListItemAvatar>
    //   <ListItemText
    //     primary={renderCommentPreview(comment.descricao as string) || "Comentário vazio"}
    //     secondary={
    //       comment.criadoPor
    //         ? `Por: ${comment.criadoPor} | ${formatDateWithNoTime(
    //             comment.criadoEm || ""
    //           )}`
    //         : "Autor desconhecido"
    //     }
    //   />
    //   {user?.CODPESSOA === 2 && (
    //     <IconButton
    //       sx={{ ...buttonStylesMobile, marginX: 2}}
    //       onClick={() => handleStartEdition()}
    //     >
    //       <EditIcon />
    //     </IconButton>
    //   )}
    //   <AnimatePresence>
    //     {alert && (
    //       <motion.div {...alertAnimation}>
    //         <Alert severity={alert?.severity as AlertColor}>
    //           {alert?.message}
    //         </Alert>
    //       </motion.div>
    //     )}
    //   </AnimatePresence>

    // </ListItem>
  );
};
export default CommentRow;
