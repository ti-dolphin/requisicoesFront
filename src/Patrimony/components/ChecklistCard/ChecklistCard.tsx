import React, { useContext } from "react";
import { Box, Typography, Card, Stack, Button } from "@mui/material";
import { BaseButtonStyles, basicCardContentStyles, basicCardStyles } from "../../../utilStyles";
import { ListChildComponentProps } from "react-window";
import { MovementationChecklist } from "../../types";
import { ChecklistColumnData } from "../../../crm/types";
import { User, userContext } from "../../../Requisitions/context/userContext";

interface ChecklistCard {
  key: number;
  handleOpenChecklist: (row: MovementationChecklist) => void
  renderValue?: (
    column: ChecklistColumnData,
    row: MovementationChecklist,
    user: User
  ) => string | number | JSX.Element | null | undefined;
  props: ListChildComponentProps;
  cardData: MovementationChecklist; // Os dados da tarefa (uma linha da lista)
  columns: {
    label: string; // Nome da coluna
    dataKey: keyof MovementationChecklist; // Chave para acessar o valor nos dados
  }[];
}

const ChecklistCard: React.FC<ChecklistCard> = ({
  cardData,
  columns,
  key,
  props,
  handleOpenChecklist,
  renderValue,
}) => {
  const { style } = props;
  const {user} = useContext(userContext);

  return (
    <Card key={key} sx={{ ...style, ...basicCardStyles}}>
      <Box sx={basicCardContentStyles} className="shadow-sm shadow-gray-600">
     
        {columns.map((column) => (
          <Box key={column.dataKey} sx={{ marginBottom: 1 }}>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography fontSize="small" fontWeight="bold" color="black">
                {column.label}:
              </Typography>{" "}
              <Typography fontSize="small" color="textSecondary">
                {renderValue && user && renderValue(column, cardData, user)}
              </Typography>
            </Stack>
          </Box>
        ))}
        <Button
          onClick={() => handleOpenChecklist(cardData)}
          sx={{ ...BaseButtonStyles }}
        >
          Detalhes
        </Button>
      </Box>
    </Card>
  );
};

export default ChecklistCard;
