import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
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
import { fetchResponsableForFirstProjectOption, fetchSalers } from "../../utils";

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
  const [responsableOptions, setResponsableOptions] = useState<any>();
  const [currentResponsable, setCurrentResponsable] = useState<any>();
  const projectId = useRef<number>();
  const oppId = useRef<number>();

  const setDefaultResponsableWhenNotDefined = async (
  ) => {
    if (
      guidesReference.current &&
      oppId.current &&
      sale &&
      responsableOptions &&
      projectId.current
    ) {

      const noResponsableDefined = !(sale.responsavel !== 1);
      if (noResponsableDefined && projectId.current) {

        const responsableForFirstProject = await fetchResponsableForFirstProjectOption(projectId.current);
        setCurrentResponsable(
          responsableOptions.find(
            (respOption: any) => respOption.id === responsableForFirstProject.id
          )
        );
        console.log({ responsableForFirstProject });
        guide.fields[0].data = responsableForFirstProject.id;
        guidesReference.current[3] = guide;
        return;
      }
    }
  };

  const setCurrentResponsableWhenDefined = () =>  { 
       if (sale?.responsavel && responsableOptions) {
         const responsable = responsableOptions.find(
           (option: any) => option.id === sale.responsavel
         );
         if (responsable) {
           setCurrentResponsable(
             responsableOptions.find(
               (option: any) => option.id === sale.responsavel
             )
           );
         }
       }
  };

  const fetchSalerOps = useCallback(
    async () => {
      const salers = await fetchSalers(0);
      const options = salers.map((saler: any) => ({
        label: saler.NOME,
        id: saler.CODPESSOA,
        object: "saler",
        key: saler.CODPESSOA,
      }));
      setResponsableOptions(options);
      setCurrentResponsable(options[0])

      // setDefaultResponsableWhenNotDefined(firstsSaleState);
      // setCurrentResponsableWhenDefined(firstsSaleState, options);
    },
    [setResponsableOptions]
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
      };
      const { valorFatDireto, valorFatDolphin } = updatedSale;
      const totalValue = Number(valorFatDireto) + Number(valorFatDolphin);
      setSale({ ...updatedSale, valorTotal: totalValue });
      const fieldIndex = guide.fields.indexOf(fieldReceived);
      fieldReceived.data = value;
      guide.fields[fieldIndex] = fieldReceived;
      guide.fields[4].data = totalValue;
      guidesReference.current[3] = guide;
    }
  };

  const handleChangeAutoComplete = (value: any) => {
    setCurrentResponsable(value);
    guide.fields[0].data = value.id;
  };

  useEffect(() => {
    if (guidesReference.current) {
      projectId.current = guidesReference.current[0].fields[0].data;
      oppId.current = guidesReference.current[0].fields[8].data;
    }
    const firstsSaleState = {
      responsavel: guide.fields[0].data,
      valorFatDolphin: guide.fields[1].data,
      valorFatDireto: guide.fields[2].data,
      valorComissao: guide.fields[3].data,
      valorTotal: guide.fields[4].data,
    };
    setSale(firstsSaleState);
    fetchSalerOps();
  }, [guide]);

  useEffect(( )=> {
   if (responsableOptions){ 
      setDefaultResponsableWhenNotDefined();
      setCurrentResponsableWhenDefined();
   } 
  }, [responsableOptions])



  return (
    <Box sx={style.formGrid}>
      {guide.fields.map((field, _index) => {
        if (field.dataKey === "responsavel" && responsableOptions) {
          return (
            <Autocomplete
              key={field.dataKey}
              getOptionKey={(option: any) => option.id}
              options={responsableOptions}
              value={currentResponsable} // Adicione esta linha
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
        if (sale) {
          return (
            <TextField
              key={field.dataKey}
              type={field.type}
              label={field.label}
              disabled={field.dataKey === "valorTotal"}
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
