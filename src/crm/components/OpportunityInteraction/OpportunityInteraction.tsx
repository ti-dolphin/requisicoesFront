import { Box, Button, Stack, TextField } from "@mui/material";
import React, {
  MutableRefObject,
  useContext,
  useEffect,
  useState,
} from "react";
import { Comentario, Guide } from "../../types";
import style from "./OpportuntiyInteraction.styles";
import { FixedSizeList as ListWindow } from "react-window";
import CommentRow from "./CommentRow";
import { AnimatePresence, motion } from "framer-motion";
import { alertAnimation, BaseButtonStyles } from "../../../utilStyles";
import { userContext } from "../../../Requisitions/context/userContext";

interface props {
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
}
const OpportunityInteraction = ({ guide, guidesReference }: props) => {
  const { user } = useContext(userContext);
  const [interactionDate, setInteractionDate] = useState<string>();
  const [comments, setComments] = useState<Comentario[]>();
  const [commentBeingEdited, setCommentBeingEdited] = useState<Comentario>();
  const [commentBeingAdded, setCommentBeingAdded] = useState<Comentario>();


  const handleChangeComment = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    commentId: number
  ) => {
    const { value } = e.target;
    if (comments) {
      const updatedComments = comments.map((comment) =>
        comment.codigoComentario === commentId
          ? { ...comment, descricao: value } // Cria um novo objeto com a descrição atualizada
          : comment
      );
      setComments(updatedComments);
    }
    if (commentBeingEdited) {
      setCommentBeingEdited({
        ...commentBeingEdited,
        descricao: value,
      });
      return;
    }
    if (commentBeingAdded) {
      setCommentBeingEdited({
        ...commentBeingAdded,
        descricao: value,
      });
      return;
    }
  };
  const handleChangeInteractonDate = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    _dataKey: string
  ) => {
    if (guidesReference.current) {
      const { value } = e.target;
      setInteractionDate(value);
      guide.fields[0].data = value;
      guidesReference.current[1] = guide;
    }
  };

  const handleCancelAddorEditComment = () => {
    setComments(guide.fields[1].data);
    setCommentBeingEdited(undefined);
    setCommentBeingAdded(undefined);
  };

  const handleFocus = () => {
    if (guidesReference.current && !commentBeingEdited) {
      //don't do this when coment is being edited
      const newComment = {
        email: "",
        codOs: guidesReference.current[0].fields[0].data,
        criadoEm: new Date().toISOString(),
        criadoPor: user?.NOME || "",
        descricao: "",
        codigoComentario: Math.random(),
      };
      setCommentBeingAdded(newComment);
      setComments([...(comments || []), newComment]);
    }
  };

  const handleConclude = () => {
    if (guidesReference.current && comments) {
      guide.fields[1].data = [...comments];
      guidesReference.current[1] = guide;
      handleCancelAddorEditComment();
    }
  };

  useEffect(() => {
    setInteractionDate(guide.fields[0].data);
    setComments(guide.fields[1].data);
  }, [guide]);

  return (
    <Box
      sx={style.container}
    >
      {guide.fields.map((field, _index) => {
        if (field.dataKey === "dataInteracao") {
          return (
            <TextField
             key={field.dataKey}
              label={field.label}
              type={field.type}
              onChange={(e) => handleChangeInteractonDate(e, field.dataKey)}
              InputLabelProps={{ shrink: true }}
              value={interactionDate}
            />
          );
        }
        if (field.dataKey === "comentarios") {
          return (
            <Stack sx={{ width: "100%", gap: 2 }} key={field.dataKey}>
              <TextField
                key={field.dataKey}
                onChange={(e) =>
                  handleChangeComment(
                    e,
                    commentBeingEdited?.codigoComentario ||
                      commentBeingAdded?.codigoComentario ||
                      0
                  )
                }
                label="Comentário"
                InputLabelProps={{ shrink: commentBeingEdited && true }}
                placeholder="Digite seu comentário aqui..."
                type="text"
                multiline
                rows={3}
                onFocus={handleFocus}
                onKeyDown={(e) => {
                  e.key === "Enter" && handleConclude();
                }}
                value={
                  commentBeingEdited?.descricao ||
                  commentBeingAdded?.descricao ||
                  ""
                }
                onBlur={handleCancelAddorEditComment}
                variant="outlined"
                fullWidth
                sx={style.commentField}
              />
              <AnimatePresence>
                {(commentBeingEdited || commentBeingAdded) && (
                  <motion.div {...alertAnimation}>
                    <Stack direction="row" gap={1}>
                      <Button
                        sx={BaseButtonStyles}
                        onClick={handleCancelAddorEditComment}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleConclude} sx={BaseButtonStyles}>
                        Concluir
                      </Button>
                    </Stack>
                  </motion.div>
                )}
              </AnimatePresence>
            </Stack>
          );
        }
      })}
      {comments && (
        <ListWindow
          height={400}
          itemCount={comments?.length}
          itemSize={ 100}
          width="100%"
        >
          {({ index, style }) => (
            <CommentRow
              setCommentBeingEdit={setCommentBeingEdited}
              style={style}
              key={index}
              index={index}
              comment={comments[index]}
            />
          )}
        </ListWindow>
      )}
    </Box>
  );
};

export default OpportunityInteraction;
