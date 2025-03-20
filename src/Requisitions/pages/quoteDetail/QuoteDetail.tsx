import React, { useEffect, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";
import typographyStyles, {
  boxDefaultStyles,
  quoteDetailPageStyles,
} from "../../utilStyles";
import { Quote, QuoteItem } from "../../types";
import QuoteItemsTable from "../../components/tables/QuoteItemsTable";
import { BaseButtonStyles } from "../../../utilStyles";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "../../../generalUtilities";
import { useParams } from "react-router-dom";
import { getQuoteById, updateQuote } from "../../utils";

const quoteFields = [
  {
    label: "Descrição",
    dataKey: "descricao",
    type: "string",
  },
  // {
  //   label: "ID da Cotação",
  //   dataKey: "id_cotacao",
  //   type: "number",
  // },
  // {
  //   label: "ID da Requisição",
  //   dataKey: "id_requisicao",
  //   type: "number",
  // },
  // {
  //   label: "Condições de Pagamento",
  //   dataKey: "condicoes_pagamento",
  //   type: "string",
  // },
  {
    label: "Fornecedor",
    dataKey: "fornecedor",
    type: "string",
  },
  // {
  //   label: "Data da Cotação",
  //   dataKey: "data_cotacao",
  //   type: "string",
  // },
  {
    label: "Observação",
    dataKey: "observacao",
    type: "string",
  },
];

const QuoteDetail = () => {
  const [isEditing, setIsEditing] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentQuoteData, setCurrentQuoteData] = useState<Quote>();
  const [items, setItems] = useState<QuoteItem[]>();
  const [isSupplier, setIsSupplier] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    dataKey: string
  ) => {
    const { value } = e.target;
    if(currentQuoteData){ 
      setCurrentQuoteData({
        ...currentQuoteData,
        [dataKey]: value,
      });
    }
  };

  const { quoteId } = useParams();

  const fetchQuoteData = async () => {
    console.log("fetchQuoteData");
    try {
      const response = await getQuoteById(Number(quoteId));
      if (response.status === 200) {
        const  quote  = response.data;
        console.log(response.data)
        console.log({quote});
        setCurrentQuoteData(quote);
        setItems(quote.items);
        return;
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
   if(currentQuoteData){ 
      try {
        const response = await updateQuote(currentQuoteData);
        if (response.status === 200) {
          const newQuote = response.data;
          setCurrentQuoteData(newQuote);
        }
      } catch (e) {
        alert("erro ao atualizar");
      }
   }

    console.log("saving");
  };

  const formatToBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const verifySupplier = () => {
    setIsLoading(true);
    const url = new URL(window.location.href);
    if (Number(url.searchParams.get("supplier")) === 1) {
      setIsSupplier(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    verifySupplier();
  }, []);

  useEffect(() => {
    fetchQuoteData();
  }, []);

  return (
    <Box sx={{ ...quoteDetailPageStyles }}>
      {!isLoading && !isSupplier && currentQuoteData && (
        <Box
          sx={{ ...boxDefaultStyles, height: "fit-content", display: "flex", gap: 2 }}
          className="shadow-lg"
        >
          <Box sx={{ height: "100%", width: "40%", padding: 1 }}>
            <Typography sx={typographyStyles.heading1}>
              {currentQuoteData.descricao} | Fornecedor - {currentQuoteData.fornecedor}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `1fr 1fr`,
                gap: 1,
                alignContent: "start",
              }}
            >
              {quoteFields.map((field) => (
                <TextField
                  key={field.dataKey}
                  label={field.label}
                  name={field.label}
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  sx={{ display: "flex", flexShrink: 1 }}
                  type={field.type === "number" ? "number" : "text"}
                  value={currentQuoteData[field.dataKey as keyof Quote] || ""}
                  onChange={(e) => handleChange(e, field.dataKey)}
                  fullWidth
                  margin="normal"
                />
              ))}
            </Box>
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button
                    sx={BaseButtonStyles}
                    onClick={handleSave}
                    className="shadow-lg"
                  >
                    Salvar alterações
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
          <Box sx={{ height: "100%", width: "30%", padding: 1 }}>
            <Typography sx={typographyStyles.heading1}>
              Total:{" "}
              <span className="text-green-700">{`${formatToBRL(1500)}`}</span>
            </Typography>
          </Box>
        </Box>
      )}
      {!isLoading && currentQuoteData && items && (
        <Box sx={{ ...boxDefaultStyles, flexGrow: 1 }}>
          <QuoteItemsTable
            items={items}
            isSupplier={isSupplier}
          />
        </Box>
      )}
      {isLoading && <Loader />}
    </Box>
  );
};

export default QuoteDetail;
