import React, { useEffect, useState } from "react";

import { Alert, AlertColor, Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Box,  IconButton, TextField, Typography } from "@mui/material";
import typographyStyles, {
  boxDefaultStyles,
  quoteDetailPageStyles,
} from "../../utilStyles";
import { AlertInterface, FiscalCategoryType, Quote, QuoteItem, ShipmentType } from "../../types";
import QuoteItemsTable from "../../components/tables/QuoteItemsTable";
import { formatDate, Loader } from "../../../generalUtilities";
import { useNavigate, useParams } from "react-router-dom";
import { getQuoteById, getQuoteClassifications, getQuoteShipments, updateQuote } from "../../utils";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import QuoteFileList from "../../components/QuoteFileList/QuoteFileList";


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
  const [originalQuoteData, setOriginalQuoteData] = useState<Quote>();
  const [currentQuoteData, setCurrentQuoteData] = useState<Quote>();
  const [items, setItems] = useState<QuoteItem[]>();
  const [isSupplier, setIsSupplier] = useState<boolean>(false);
  const [fiscalClassificationOps, setFiscalClassificationOps] = useState<Option[]>();
  const [shipmentOps, setShipmentOps] = useState<Option[]>();
  const [selectedShipment, setSelectedShipment] = useState<Option>();
  const [selectedClassification, setSelectedClassification] = useState<Option>();
  const [alert, setAlert] = useState<AlertInterface>();
  const navigate = useNavigate();
   
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: QuoteField
  ) => {
    const { value } = e.target;
    if(currentQuoteData){ 
      setCurrentQuoteData({
        ...currentQuoteData,
        [field.dataKey as keyof Quote]: field.type === "number" ? Number(value) : value
      });
    }
  };

  const handleChangeAutoComplete = (field: QuoteField, value: Option | null) => {
  if (!value || !currentQuoteData) return;
  
   setCurrentQuoteData({ 
    ...currentQuoteData,
    [field.dataKey as keyof Quote] : value.id
   })
  // Atualiza o estado do option selecionado
  if (field.dataKey === "id_classificacao_fiscal") {
    setSelectedClassification(value);
  } else if (field.dataKey === "id_tipo_frete") {
    setSelectedShipment(value);
  }
};

  const { quoteId } = useParams();

  const fetchQuoteData = async () => {
    
    try {
      const response = await getQuoteById(Number(quoteId), verifySupplier());
      if (response.status === 200) {
        const  quote  = response.data;
        setOriginalQuoteData(quote);
        setCurrentQuoteData(quote);
        setItems(quote.items);
        fetchOptions(quote);
        return;
      }
    } catch (e: any) {
      displayAlert('error', e.message);
    }finally{ 
      setIsLoading(false)
    }
  };

  const fetchOptions = async (quote : Quote) => {
    try {
      const shipmentTypes = await getQuoteShipments(verifySupplier());
      const classifications = await getQuoteClassifications(verifySupplier());

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
     }, 8000);
     setAlert({ severity, message });
     return;
   };

   const validateRequiredFields = (quoteData: Quote) => {
     const {
       cnpj_faturamento,
       cnpj_fornecedor,
       id_tipo_frete,
       id_classificacao_fiscal,
     } = quoteData;
     if (!id_tipo_frete) {
       throw new Error("O tipo de frete é obrigatório");
     }
     if (!id_classificacao_fiscal) {
       throw new Error("A classificação fiscal é obrigatória");
     }
     if (!cnpj_faturamento) {
       throw new Error("CNPJ do faturamento é obrigatório");
     }
     if (isSupplier && !cnpj_fornecedor) {
       throw new Error("CNPJ do fornecedor é obrigatório");
     }
   };

  const saveQuoteData = async () => {
    console.log('SAVE QUOTE DATA')
    if (currentQuoteData) {
          try{ 
            validateRequiredFields(currentQuoteData);
            const response = await updateQuote(currentQuoteData, verifySupplier());
            if (response.status === 200) {
              const newQuote = response.data;
              setCurrentQuoteData(newQuote);
              setOriginalQuoteData(newQuote);
              displayAlert('success', 'Cotação atualizada!')
              return;
          }
        }catch(e: any){ 
            displayAlert('error', e.message);
          }
      }
    }

  const verifySupplier = () => {
    const url = new URL(window.location.href);
    if (Number(url.searchParams.get("supplier")) === 1) {
      setIsSupplier(true);
      return true
    }
    return false;
  };

 const handleFocus = (field: QuoteField) => {
   if (
     isSupplier &&
     (field.dataKey === "observacao" || field.dataKey === "descricao")
   ) {
     displayAlert("warning", `Não é permitido editar ${field.label}`);
     return false;
   }
   if(!isEditing) {
    setIsEditing(true);
    return;
   }
 };

  useEffect(( ) =>  { 
    const pairOptions = ( ) => {
        if(currentQuoteData){ 
            const { id_tipo_frete, id_classificacao_fiscal } = currentQuoteData;
            if (id_tipo_frete !== selectedShipment?.id) {
              const option = shipmentOps?.find(
                (opt) => opt.id === id_tipo_frete
              );
              setSelectedShipment(option);
            }
            if (id_classificacao_fiscal !== selectedClassification?.id) {
              const option = fiscalClassificationOps?.find(
                (opt) => opt.id === id_classificacao_fiscal
              );
              setSelectedClassification(option);
            }
            return;
        }
    }
    pairOptions();
 }, [currentQuoteData])

 useEffect(( ) =>  {
   verifySupplier();
 }, [])

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
            display: "flex",
            flexDirection: {
              md: "row",
              xs: "column",
            },
            gap: 2,
          }}
          className="shadow-lg"
        >
          {!isSupplier && (
            <IconButton
              onClick={() =>
                navigate(
                  `/requisitions/requisitionDetail/${originalQuoteData?.id_requisicao}`
                )
              }
              sx={{ position: "absolute" }}
            >
              <ArrowCircleLeftIcon />
            </IconButton>
          )}
          <Box
            sx={{
              height: "100%",
              width: "100%",
              padding: 1,
              display: "flex",
              flexDirection: "column",
              marginTop: 4,
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

                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                  xl: "1fr 1fr 1fr",
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
                        onFocus={(_e) => handleFocus(field)}
                        sx={{ display: "flex", flexShrink: 1, margin: 0 }}
                        type={field.type === "number" ? "number" : "text"}
                        value={
                          currentQuoteData[field.dataKey as keyof Quote] || ""
                        }
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: "black" },
                        }}
                        onChange={(e) => handleChange(e, field)}
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
                      onFocus={(_e) => handleFocus(field)}
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
                    * Preencha a classificação fiscal, valor do frete, tipo de
                    frete e o seu CNPJ
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <QuoteFileList
            isSupplier={isSupplier}
            quoteId={currentQuoteData.id_cotacao}
            itemSize={30}
            height={300}
          />
        </Box>
      )}

      {!isLoading && currentQuoteData && items && (
        <Box sx={{ ...boxDefaultStyles, flexGrow: 1 }}>
          <QuoteItemsTable
            items={items}
            isSupplier={isSupplier}
            setIsEditing={setIsEditing}
            isEditing={isEditing}
            saveQuoteData={saveQuoteData}
            shippingPrice={currentQuoteData.valor_frete}
            setCurrentQuoteData={setCurrentQuoteData}
            originalQuoteData={originalQuoteData}
          />
        </Box>
      )}
      {isLoading && <Loader />}
    </Box>
  );
};

export default QuoteDetail;
