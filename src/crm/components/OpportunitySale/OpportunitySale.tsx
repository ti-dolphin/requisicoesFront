import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Field, Guide } from "../../types";
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  Box,
  TextField,
} from "@mui/material";
import style from "./Opportunity.styles";
import { fetchSalers } from "../../utils";

interface props {
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
}
interface OpportunitySaleFields {
  responsavel: number;
  valorFatDolphin: number;
  valorFatDireto: number;
  valorComissao: number;
  valorTotal: number;
}

const OpportunitySale = ({ guide, guidesReference }: props) => {
  const [sale, setSale] = useState<OpportunitySaleFields>();
  const [salerOptions, setSalerOptions] = useState<any>();
  const [currentSaller, setCurrentSaller] = useState<any>();
  const fetchSalerOps = useCallback(
    async (firstsSaleState: OpportunitySaleFields) => {
      const salers = await fetchSalers();
      const options = salers.map((saler: any) => ({
        label: saler.NOME,
        id: saler.CODPESSOA,
        object: "saler",
        key: saler.CODPESSOA,
      }));
      setSalerOptions(options);
      setCurrentSaller(
        options.find((option: any) => option.id === firstsSaleState.responsavel)
      );
    },
    [setSalerOptions]
  );

  const handleChangeTextField = (
    fieldReceived: Field,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (guidesReference.current && sale) {
      const { value } = e.target;
      const updatedSale = {
        ...sale,
        [fieldReceived.dataKey as keyof OpportunitySaleFields]: value,
      }
      const { valorFatDireto, valorFatDolphin } = updatedSale;
      const totalValue = Number(valorFatDireto) + Number(valorFatDolphin);
      setSale({...updatedSale, valorTotal: totalValue})
      const fieldIndex = guide.fields.indexOf(fieldReceived);
      fieldReceived.data = value;
      guide.fields[fieldIndex] = fieldReceived;
      guide.fields[4].data = totalValue;
      guidesReference.current[3] = guide;
    }
  };

  const handleChangeAutoComplete = (value: any) => {
    setCurrentSaller(value);
    guide.fields[0].data = value.id;
  };

  useEffect(() => {
    const firstsSaleState = {
      responsavel: guide.fields[0].data,
      valorFatDolphin: guide.fields[1].data,
      valorFatDireto: guide.fields[2].data,
      valorComissao: guide.fields[3].data,
      valorTotal: guide.fields[4].data,
    };
    setSale(firstsSaleState);
    fetchSalerOps(firstsSaleState);
  }, [guide]);

  return (
    <Box sx={style.formGrid}>
      {guide.fields.map((field, index) => {
        if (field.dataKey === "responsavel" && salerOptions) {
          return (
            <Autocomplete
              getOptionKey={(option: any) => option.id}
              options={salerOptions}
              value={currentSaller} // Adicione esta linha
              renderInput={(
                params: AutocompleteRenderInputParams
              ): React.ReactNode => (
                <TextField
                  {...params}
                  label={field.label}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              onChange={(
                _event: React.SyntheticEvent,
                value: any,
                _reason: AutocompleteChangeReason,
                _details?: AutocompleteChangeDetails<any> | undefined
              ) => handleChangeAutoComplete(value)}
            />
          );
        }
        if(sale){ 
           return (
             <TextField
               key={index}
               type={field.type}
               label={field.label}
               disabled={field.dataKey === 'valorTotal'}
               InputLabelProps={{ shrink: true }}
               onChange={(e) => handleChangeTextField(field, e)}
               value={sale[field.dataKey as keyof OpportunitySaleFields]}
             ></TextField>
           );
        }
      })}
    </Box>
  );
};

export default OpportunitySale;
