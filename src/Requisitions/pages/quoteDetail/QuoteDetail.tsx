import React, { useEffect, useState } from "react";

import { Alert, AlertColor, Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Box, Button, TextField, Typography } from "@mui/material";
import typographyStyles, {
  boxDefaultStyles,
  quoteDetailPageStyles,
} from "../../utilStyles";
import { AlertInterface, FiscalCategoryType, Quote, QuoteItem, ShipmentType } from "../../types";
import QuoteItemsTable from "../../components/tables/QuoteItemsTable";
import { BaseButtonStyles } from "../../../utilStyles";
import { AnimatePresence, motion } from "framer-motion";
import { formatDate, Loader } from "../../../generalUtilities";
import { useParams } from "react-router-dom";
import { getQuoteById, getQuoteClassifications, getQuoteShipments, updateQuote } from "../../utils";


interface QuoteField{ 
  label: string;
  dataKey: string;
  type: string;
  autoComplete: boolean
}
const quoteFields: QuoteField[] = [
  {
    label: "Descrição",
    dataKey: "descricao",
    type: "string",
    autoComplete: false,
  },
  {
    label: "Fornecedor",
    dataKey: "fornecedor",
    type: "string",
    autoComplete: false,
  },
  {
    label: "Observação",
    dataKey: "observacao",
    type: "string",
    autoComplete: false,
  },
  {
    label: "Tipo de Frete",
    dataKey: "id_tipo_frete",
    type: "number",
    autoComplete: true,
  },
  {
    label: "Classificação Fiscal",
    dataKey: "id_classificacao_fiscal",
    type: "number",
    autoComplete: true,
  },
  {
    label: "Valor Frete",
    dataKey: "valor_frete",
    type: "number",
    autoComplete: false,
  },
  {
    label: "CNPJ do Faturamento",
    dataKey: "cnpj_faturamento",
    type: "string",
    autoComplete: false,
  },
  {
    label: "CNPJ do Fornecedor",
    dataKey: "cnpj_fornecedor",
    type: "string",
    autoComplete: false,
  },
];

interface Option{ 
  label: string;
  id: number;
}

const QuoteDetail = () => {
  const [isEditing, setIsEditing] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentQuoteData, setCurrentQuoteData] = useState<Quote>();
  const [items, setItems] = useState<QuoteItem[]>();
  const [isSupplier, setIsSupplier] = useState<boolean>(false);
  const [fiscalClassificationOps, setFiscalClassificationOps] = useState<Option[]>();
  const [shipmentOps, setShipmentOps] = useState<Option[]>();
  const [selectedShipment, setSelectedShipment] = useState<Option>();
  const [selectedClassification, setSelectedClassification] = useState<Option>();
  const [alert, setAlert] = useState<AlertInterface>();
   
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
    try {
      const response = await getQuoteById(Number(quoteId));
      if (response.status === 200) {
        const  quote  = response.data;
        setCurrentQuoteData(quote);
        setItems(quote.items);
        fetchOptions(quote);
        return;
      }
    } catch (e: any) {
      displayAlert('error', e.message);
}
  };

  const fetchOptions = async (quote : Quote) => {
    try {
      const shipmentTypes = await getQuoteShipments();
      const classifications = await getQuoteClassifications();

      if (classifications && shipmentTypes) {
        const classificationOptions = classifications.map(
          (classification: FiscalCategoryType) => ({
            label: classification.nome,
            id: classification.id_classificao_fiscal,
          })
        );
        setFiscalClassificationOps(classificationOptions);
        const shipmentOptions = shipmentTypes.map(
          (shipmentType: ShipmentType) => ({
            label: shipmentType.nome,
            id: shipmentType.id_tipo_frete,
          })
        );
        setShipmentOps(shipmentOptions);
        setSelectedOptions(classificationOptions, shipmentOptions, quote);
      }
      
    } catch (e: any) {
      window.alert(e.message);
    }
  };

  const setSelectedOptions = (
    fiscalClassificationOps: Option[],
    shipmentOps: Option[],
    quote: Quote
  ) => {
    if (fiscalClassificationOps && shipmentOps) {
      const selectedClassification = fiscalClassificationOps.find(
        (option) => option.id === quote.id_classificacao_fiscal
      );
      const selectedShipment = shipmentOps.find(
        (option) => option.id === quote.id_tipo_frete
      );
      setSelectedClassification(selectedClassification);
      setSelectedShipment(selectedShipment);
    }
  };

  const renderOptions = ( field: QuoteField) => { 
      if(field.dataKey == 'id_tipo_frete'){ 
        return shipmentOps;
      }
      if(field.dataKey === 'id_classificacao_fiscal'){ 
       return fiscalClassificationOps;
      }
  };

 const getValue = (field : QuoteField ) => { 
   if (field.dataKey == "id_tipo_frete") {

     return selectedShipment;
   }
   if (field.dataKey === "id_classificacao_fiscal") {
     return selectedClassification;
   }
 };

   const displayAlert = async (severity: string, message: string) => {
     setTimeout(() => {
       setAlert(undefined);
     }, 3000);
     setAlert({ severity, message });
     return;
   };

  const handleSave = async () => {
   if(currentQuoteData){ 
      try {
        console.log({currentQuoteData})
        // const response = await updateQuote(currentQuoteData);
        // if (response.status === 200) {
        //   const newQuote = response.data;
        //   setCurrentQuoteData(newQuote);
        //   displayAlert('success', 'Cotação atualizada!')
        // }
      } catch (e : any) {
        displayAlert("error", `Erro ao atualizar: ${e.message}`);
      }
   }
  };

  const handleChangeAutoComplete = (field: QuoteField, value: Option | null ) => { 
    if(value){
      if (currentQuoteData) {
        if (field.dataKey === "id_classificacao_fiscal") {
          setSelectedClassification(value);
        }
        if (field.dataKey === "id_tipo_frete") {
          setSelectedShipment(value);
        }
        setCurrentQuoteData({
          ...currentQuoteData,
          [field.dataKey as keyof Quote]: value.id,
        });
      }
    }
  }

  const verifySupplier = () => {
    setIsLoading(true);
    const url = new URL(window.location.href);
    if (Number(url.searchParams.get("supplier")) === 1) {
      setIsSupplier(true);
    }
    setIsLoading(false);
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: QuoteField
  ) => {
    if (!isSupplier) {
      if(!isEditing) setIsEditing(true)
      return;
    }
    if(field.dataKey === 'observacao' || field.dataKey === 'descricao'){ 
        displayAlert("warning", `Não é permitido editar ${field.label}`);
        e.currentTarget.blur();
        return;
    }
     if (!isEditing) setIsEditing(true);
  };

  useEffect(() => {
    verifySupplier();
  }, []);

  useEffect(() => {
    fetchQuoteData();
    
  }, []);

  return (
    <Box sx={{ ...quoteDetailPageStyles }}>
      {!isLoading && currentQuoteData && (
        <Box
          sx={{
            ...boxDefaultStyles,
            height: "fit-content",
            border: "1px solid",
            display: "flex",
            gap: 2,
          }}
          className="shadow-lg"
        >
          <Box
            sx={{
              height: "100%",
              width: "100%",
              padding: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography sx={{ ...typographyStyles.heading2, color: "black" }}>
              {`Cotação ${currentQuoteData.id_cotacao} | Requisição ${
                currentQuoteData.id_requisicao
              } | ${formatDate(currentQuoteData.data_cotacao)} ${
                currentQuoteData.descricao
                  ? `| ${currentQuoteData.descricao}`
                  : ""
              }`}
            </Typography>
            {alert && (
              <Alert severity={alert.severity as AlertColor}>
                {alert.message}
              </Alert>
            )}
            <Box
              sx={{
                display: "grid",
                width: "50%",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 1,
                rowGap: 1.5,
                marginTop: 1,
                alignContent: "start",
              }}
            >
              {fiscalClassificationOps &&
                shipmentOps &&
                quoteFields.map((field) => {
                  if (!field.autoComplete) {
                    return (
                      <TextField
                        key={field.dataKey}
                        label={field.label}
                        name={field.label}
                        onFocus={(e) => handleFocus(e, field)}
                        onBlur={() => setIsEditing(false)}
                        sx={{ display: "flex", flexShrink: 1, margin: 0 }}
                        type={field.type === "number" ? "number" : "text"}
                        value={
                          currentQuoteData[field.dataKey as keyof Quote] || ""
                        }
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: "black" },
                        }}
                        onChange={(e) => handleChange(e, field.dataKey)}
                        fullWidth
                        margin="normal"
                      />
                    );
                  }
                  return (
                    <Autocomplete
                      key={field.dataKey}
                      getOptionKey={(option: Option) => option.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                      onBlur={() => setIsEditing(false)}
                      onFocus={() => setIsEditing(true)}
                      onChange={(
                        _event: React.SyntheticEvent,
                        value: Option | null,
                        _reason: AutocompleteChangeReason,
                        _details?: AutocompleteChangeDetails<Option> | undefined
                      ) => handleChangeAutoComplete(field, value)}
                      value={getValue(field)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={field.label}
                          InputLabelProps={{
                            shrink: true,
                            sx: { color: "black" },
                          }}
                        />
                      )}
                      options={renderOptions(field) || []}
                    ></Autocomplete>
                  );
                })}
              {isSupplier && (
                <Box>
                  <Typography
                    sx={{ fontStyle: "italic", ...typographyStyles.heading2 }}
                  >
                    * Preencha a classificação fiscal, valor do frete, tipo
                    de frete e  o seu CNPJ
                  </Typography>
                </Box>
              )}
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
