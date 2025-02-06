import React, { useEffect, useState } from 'react'
import quoteFields, { defaultQuote, dummyQuotes } from '../../utils'
import { Box, Button, TextField, Typography } from '@mui/material';
import typographyStyles, { boxDefaultStyles, quoteDetailPageStyles } from '../../utilStyles';
import { Quote } from '../../types';
import QuoteItemsTable from '../../components/tables/QuoteItemsTable';
import { BaseButtonStyles } from '../../../utilStyles';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader } from '../../../generalUtilities';

const QuoteDetail = () => {

  const [isEditing, setIsEditing] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentQuoteData, setCurrentQuoteData] = useState<Quote>(defaultQuote);
  const [isSupplier, setIsSupplier] = useState<boolean>(false);
  
  console.log({currentQuoteData});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, dataKey : string) => {
    const { value } = e.target;
    console.log({
      ...quoteData,
      [dataKey]: value
    });

    setCurrentQuoteData({ 
      ...quoteData,
      [dataKey] : value
    })
  }

  const handleSave =  ( ) =>  { 
     console.log('saving')
  }

  const formatToBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const verifySupplier = ( ) => { 
    setIsLoading(true);
    const url = new URL(window.location.href);
    if (Number(url.searchParams.get('supplier')) === 1) {
      setIsSupplier(true);
    }
    setIsLoading(false);
  }

  const quoteData = dummyQuotes[0];
  const selectedFields = quoteFields.filter(
    (field) =>
      field.dataKey === "observacao" ||
      field.dataKey === "data_validade" ||
      field.dataKey === "condicoes_pagamento" ||
      field.dataKey === "data_cotacao" ||
      field.dataKey === 'fornecedor'
  );

  useEffect(( )=> { 
    verifySupplier();
  }, [])

  return (
    <Box sx={{ ...quoteDetailPageStyles }}>
      { 
       !isLoading &&  !isSupplier && ( 
          <Box sx={{ ...boxDefaultStyles, height: '50%', display: 'flex', gap: 2 }} className="shadow-lg">
            <Box sx={{ height: '100%', width: '40%', padding: 1 }}>
              <Typography sx={typographyStyles.heading1}>{quoteData.descricao}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: `1fr 1fr`, gap: 1, alignContent: 'start' }}>
                {selectedFields.map((field) => (
                  <TextField
                    key={field.dataKey}
                    label={field.label}
                    name={field.label}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setIsEditing(false)}
                    sx={{ display: 'flex', flexShrink: 1 }}
                    type={field.type === "number" ? "number" : "text"}
                    value={quoteData[field.dataKey as keyof Quote] || ""}
                    onChange={(e) => handleChange(e, field.dataKey)}
                    fullWidth
                    margin="normal"
                  />
                ))}
              </Box>
              <AnimatePresence>
                {
                  isEditing &&
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <Button sx={BaseButtonStyles} onClick={handleSave} className="shadow-lg">
                      Salvar alterações
                    </Button>
                  </motion.div>
                }
              </AnimatePresence>
            </Box>
            <Box sx={{ height: '100%', width: '30%', padding: 1 }}>
              <Typography sx={typographyStyles.heading1}>Total: <span className="text-green-700">{`${formatToBRL(1500)}`}</span></Typography>
            </Box>
          </Box>
        )
      }
      {
        !isLoading && ( 
          <Box sx={{ ...boxDefaultStyles, height: '50%' }}>
            <QuoteItemsTable items={quoteData.itens} isSupplier={isSupplier} />
          </Box>
        )
      }
      {
        isLoading && 
        <Loader />
      }
    </Box>
  )
}

export default QuoteDetail