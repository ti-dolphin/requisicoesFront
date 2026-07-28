import { useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RequisitionHeaderEditDialog from "./RequisitionHeaderEditDialog";

const headerTextSx = {
  fontSize: {
    xs: "0.8rem",
    sm: "1.2rem",
  },
  fontWeight: 600,
  color: "primary.main",
} as const;

interface EditableSpanProps {
  value?: string | number | null;
  canEdit: boolean;
  onStartEditing: () => void;
}

const EditableSpan = ({ value, canEdit, onStartEditing }: EditableSpanProps) => {
  const content = (
    <Typography
      component="span"
      onDoubleClick={canEdit ? onStartEditing : undefined}
      sx={{
        ...headerTextSx,
        cursor: canEdit ? "pointer" : "default",
        userSelect: canEdit ? "none" : "auto",
        "&:hover": canEdit ? { textDecoration: "underline" } : undefined,
      }}
    >
      {value || "-"}
    </Typography>
  );

  if (!canEdit) {
    return content;
  }

  return (
    <Tooltip title="Duplo clique para editar" arrow>
      {content}
    </Tooltip>
  );
};

const RequisitionHeaderTitle = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const { requisition } = useSelector((state: RootState) => state.requisition);

  const isAdmin = Number(user?.PERM_ADMINISTRADOR) === 1;
  const canEdit = isAdmin && Boolean(requisition.ID_REQUISICAO);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [initialFocus, setInitialFocus] = useState<"description" | "project">(
    "description"
  );

  const openEditDialog = (focus: "description" | "project") => {
    setInitialFocus(focus);
    setEditDialogOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0.75,
      }}
    >
      <Typography component="span" sx={headerTextSx}>
        {requisition.ID_REQUISICAO}
      </Typography>
      <Typography component="span" sx={headerTextSx}>
        |
      </Typography>

      <EditableSpan
        value={requisition.DESCRIPTION}
        canEdit={canEdit}
        onStartEditing={() => openEditDialog("description")}
      />

      <Typography component="span" sx={headerTextSx}>
        |
      </Typography>

      <EditableSpan
        value={requisition.projeto?.DESCRICAO}
        canEdit={canEdit}
        onStartEditing={() => openEditDialog("project")}
      />

      {editDialogOpen && (
        <RequisitionHeaderEditDialog
          open
          requisition={requisition}
          initialFocus={initialFocus}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
    </Box>
  );
};

export default RequisitionHeaderTitle;
