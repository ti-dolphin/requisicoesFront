import { Typography, TextField, Box, IconButton } from "@mui/material";
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
} from "@mui/material/Autocomplete";
import {
  Comentario,
  Opportunity,
  OpportunityColumn,
  OpportunityOptionField,
} from "../../types.ts";
import React, { Dispatch, SetStateAction, useContext } from "react";
import { ListItem, ListItemAvatar, ListItemText, Avatar } from "@mui/material";
import { FixedSizeList as ListWindow } from "react-window";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import { userContext } from "../../../Requisitions/context/userContext.tsx";
import { formatDate } from "../../../generalUtilities.tsx";

interface RenderFieldProps {
  field: OpportunityColumn;
  renderAutoCompleteValue: (field: OpportunityColumn) => OpportunityOptionField;
  handleChangeAutoComplete: (
    _event: React.SyntheticEvent<Element, Event>,
    value: OpportunityOptionField | null,
    _reason: AutocompleteChangeReason,
    _details?:
      | AutocompleteChangeDetails<{ label: string; id: number; object: string }>
      | undefined
  ) => void;
  renderOptions: (
    field: OpportunityColumn
  ) => OpportunityOptionField[] | undefined;
  adicional: boolean;
  currentOppIdSelected: number;
  opportunity: Opportunity;
  handleChangeTextField: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: OpportunityColumn
  ) => void;
  isDateField: (dataKey: string) => boolean;
  // const handleChangeComentarios = (e : React.ChangeEvent<HTMLInputElement>,codigoComentario? : number  ) =>
  handleChangeComentarios: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    codigoComentario?: number
  ) => void;
  currentCommentValue: string;
  editingComment?: Comentario;
  setEditingComment: Dispatch<SetStateAction<Comentario | undefined>>;
}

const OpportunityFields: React.FC<RenderFieldProps> = ({
  field,
  renderAutoCompleteValue,
  handleChangeAutoComplete,
  renderOptions,
  adicional,
  opportunity,
  handleChangeTextField,
  isDateField,
  handleChangeComentarios,
  currentCommentValue,
  setEditingComment,
  editingComment,
}) => {
  const isFullWidthField =
    field.dataKey === "observacao" || field.dataKey === "comentarios";

  const isFieldDisabled = (field: OpportunityColumn) => {
    if (field.dataKey === "numeroAdicional") {
      return true;
    }
    if (
      field.dataKey === "dataEntrega" &&
      ![11, 12, 13, 5].find((statusId) => statusId === opportunity.codStatus)
    ) {
      return true;
    }
    return false;
  };
  const renderFieldValue = (field: OpportunityColumn) => {
    return opportunity[field.dataKey as keyof typeof opportunity]
      ? opportunity[field.dataKey as keyof typeof opportunity]
      : "";
  };
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const comentario = opportunity.comentarios[index];
    const { user } = useContext(userContext);

    return (
      <ListItem
        key={comentario.codigoComentario}
        alignItems="flex-start"
        style={style}
      >
        <ListItemAvatar>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={comentario.descricao || "Comentário vazio"}
          secondary={
            comentario.criadoPor
              ? `Por: ${comentario.criadoPor} | ${formatDate(
                comentario.criadoEm || ""
              )}`
              : "Autor desconhecido"
          }
        />
        {user?.CODPESSOA === 2 && (
          //Icon button de editar comentario
          <IconButton onClick={() => setEditingComment(comentario)}>
            <EditIcon />
          </IconButton>
        )}
      </ListItem>
    );
  };

  if (field.autoComplete) {
    return (
      <Box
        sx={{ maxWidth: isFullWidthField ? "100%" : "300px", width: "100%" }}
      >
        <Typography fontFamily="Roboto" fontSize="small">
          {field.label}
        </Typography>
        <Autocomplete
          value={renderAutoCompleteValue(field)}
          key={field.dataKey}
          disablePortal
          getOptionKey={(option: OpportunityOptionField) => option.key}
          disabled={field.dataKey === "idProjeto"}
          onChange={handleChangeAutoComplete}
          options={renderOptions(field) || []}
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>
    );
  }

  if (field.dataKey === "descricao" && adicional) {
    return null; // Não renderizar nada para a coluna descrição quando adicional for true
  }

  if (field.dataKey === "valorTotal") {
    return (
      <Box
        sx={{ maxWidth: isFullWidthField ? "100%" : "300px", width: "100%" }}
      >
        <Typography fontFamily="Roboto" fontSize="small">
          {field.label}
        </Typography>
        <TextField
          key={field.dataKey}
          label={`Valor Total: ${opportunity[field.dataKey as keyof typeof opportunity]
            }`}
          disabled
          placeholder={`Valor Total: ${opportunity[field.dataKey as keyof typeof opportunity]
            }`}
          type={field.type}
          onChange={(e) => handleChangeTextField(e, field)}
          InputLabelProps={
            isDateField(field.dataKey) ? { shrink: true } : undefined
          }
          variant="outlined"
          fullWidth
        />
      </Box>
    );
  }

  if (field.dataKey === "comentarios") {
    return (
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Typography variant="h5" gutterBottom>
          Comentários
        </Typography>
        <TextField
          key={field.dataKey}
          onChange={(e) =>
            handleChangeComentarios(
              e,
              editingComment?.codigoComentario || undefined
            )
          }
          label="Adicionar Comentário"
          placeholder="Digite seu comentário aqui..."
          value={
            editingComment ? editingComment.descricao : currentCommentValue
          }
          type="text"
          multiline // Permite múltiplas linhas
          rows={3} // Define a altura inicial
          variant="outlined" // Exibe uma borda destacada
          fullWidth // Garante que o campo preencha o espaço disponível
          sx={{
            borderRadius: 2, // Bordas arredondadas
            backgroundColor: "#f9f9f9", // Fundo claro para destacar
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Efeito de profundidade
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#1976d2", // Cor da borda inicial
              },
              "&:hover fieldset": {
                borderColor: "#1565c0", // Cor da borda ao passar o mouse
              },
              "&.Mui-focused fieldset": {
                borderColor: "#0d47a1", // Cor da borda ao focar
                borderWidth: "2px", // Aumenta a espessura ao focar
              },
            },
            "& .MuiInputLabel-root": {
              color: "#757575", // Cor do label
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#0d47a1", // Cor do label ao focar
            },
          }}
        />
        <ListWindow
          height={300} // Define a altura da área visível
          itemCount={opportunity.comentarios?.length || 0} // Número total de itens
          itemSize={80} // Tamanho de cada item
          width="100%" // Largura da lista
        >
          {Row}
        </ListWindow>
      </Box>
    );
  }
  if (field.dataKey === "observacoes") {
    return (
      <TextField
        key={field.dataKey}
        onChange={(e) => handleChangeTextField(e, field)}
        placeholder="Digite qualquer observação que ajute a detalhar a proposta..."
        value={opportunity.observacoes}
        type="text"
        multiline // Permite múltiplas linhas
        rows={3} // Define a altura inicial
        variant="outlined" // Exibe uma borda destacada
        fullWidth // Garante que o campo preencha o espaço disponível
        sx={{
          borderRadius: 2, // Bordas arredondadas
          backgroundColor: "#f9f9f9", // Fundo claro para destacar
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Efeito de profundidade
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#1976d2", // Cor da borda inicial
            },
            "&:hover fieldset": {
              borderColor: "#1565c0", // Cor da borda ao passar o mouse
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0d47a1", // Cor da borda ao focar
              borderWidth: "2px", // Aumenta a espessura ao focar
            },
          },
          "& .MuiInputLabel-root": {
            color: "#757575", // Cor do label
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#0d47a1", // Cor do label ao focar
          },
        }}
      />
    );
  }
  return (
    <Box sx={{ maxWidth: isFullWidthField ? "100%" : "300px", width: "100%" }}>
      <Typography fontFamily="Roboto" fontSize="small">
        {field.label}
      </Typography>
      <TextField
        key={field.dataKey}
        value={renderFieldValue(field)}
        type={field.type}
        disabled={isFieldDisabled(field)}
        onChange={(e) => handleChangeTextField(e, field)}
        InputLabelProps={
          isDateField(field.dataKey) ? { shrink: true } : undefined
        }
        variant="outlined"
        fullWidth
      />
    </Box>
  );
};

OpportunityFields.displayName = "OpportunityFields";

export default OpportunityFields;
