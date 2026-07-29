import React from "react";
import { Box, Typography, Paper, Stack, Button, Card, CardContent, CardActions } from "@mui/material";

interface OpportunityCardProps {
  row: any;
  styles?: React.CSSProperties;
  onClick?: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  row,
  styles,
  onClick,
}) => {
  return (
    <Card
      elevation={3}
      sx={{
        ...styles,
        margin: "8px auto",
        boxShadow: 2,
        borderRadius: 2,
        overflow: "hidden",
        maxHeight: 300,
        minHeight: 300,
        fontSize: "0.8rem",
      }}
      style={styles}
      onClick={onClick}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "12px",
          fontSize: "0.8rem",
        }}
      >
        <Typography color="primary">
          {`${row?.projeto.ID}.${row?.adicional.NUMERO} - ${row?.cliente.NOMEFANTASIA}`}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
