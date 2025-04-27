import { ListChildComponentProps } from "react-window";
import { Quote } from "../../types";
import styles from "../modals/QuoteListModal/QuoteListModal.styles";
import { Box, Typography } from "@mui/material";
import { blue, green } from "@mui/material/colors";
import typographyStyles from "../../utilStyles";
import { useNavigate } from "react-router-dom";

const QuoteCard = ({ index, style, data }: ListChildComponentProps) => {

  const navigate = useNavigate();

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const quote: Quote = data[index];
  const handleNavigateToQuote = () => {
    navigate(`/requisitions/quote/${quote.id_cotacao}`);
  };
  return (
    <Box style={style} onClick={handleNavigateToQuote}>
      <Box sx={{ ...styles.rowStyle }}>
        <Typography
          sx={{ ...typographyStyles.heading2, color: "black" }}
          variant="subtitle1"
        >
          Cotação {quote.id_cotacao}
        </Typography>
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Fornecedor:</strong> {quote.fornecedor}
        </Typography>
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Tipo de frete:</strong> {quote.nome_frete ? quote.nome_frete : 'Não definido'}
        </Typography>
        {quote.total && (
          <Typography
            sx={{
              ...typographyStyles.heading2,
              strong: {
                color: blue[900],
              },
              color: green[600],
            }}
            variant="body2"
          >
            <strong>Total com impostos:</strong>{" "}
            {currencyFormatter.format(quote.total)}
          </Typography>
        )}
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Data:</strong>{" "}
          {new Date(quote.data_cotacao).toLocaleDateString()}
        </Typography>
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Condições de Pagamento:</strong> {quote.condicoes_pagamento}
        </Typography>
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Descrição:</strong> {quote.descricao}
        </Typography>
        <Typography
          sx={{
            ...typographyStyles.heading2,
            strong: {
              color: blue[900],
            },
          }}
          variant="body2"
        >
          <strong>Observação:</strong> {quote.observacao || "Nenhuma"}
        </Typography>
      </Box>
    </Box>
  );
};
export default QuoteCard;
