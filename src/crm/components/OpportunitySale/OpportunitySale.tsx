import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Field, Guide } from "../../types";
import {
  Alert,
  AlertColor,
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  Box,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import style from "./Opportunity.styles";
import {
  fetchResponsableForFirstProjectOption,
  fetchSalers,
  sendSaleEmailByOppId,
} from "../../utils";
import { BaseButtonStyles } from "../../../utilStyles";
import { userContext } from "../../../Requisitions/context/userContext";
import { AlertInterface } from "../../../Requisitions/types";
import CurrencyInput from "../CurrencyInput/CurrencyInput";

interface props {
  guide: Guide;
  guidesReference: MutableRefObject<Guide[] | undefined>;
  setChangeWasMade: Dispatch<SetStateAction<boolean>>;
}
interface OpportunitySaleFields {
  responsavel: number;
  valorFatDolphin: number;
  valorFatDireto: number;
  valorComissao: number;
  valorTotal: number;
}

const OpportunitySale = ({
  guide,
  guidesReference,
  setChangeWasMade,
}: props) => {
  const [sale, setSale] = useState<OpportunitySaleFields>();
  const [responsableOptions, setResponsableOptions] = useState<any>();
  const [currentResponsable, setCurrentResponsable] = useState<any>();
  const [alert, setAlert] = useState<AlertInterface>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(userContext);
  const projectId = useRef<number>();
  const oppId = useRef<number>();

  const setDefaultResponsableWhenNotDefined = async () => {
    console.log("setDefaultResponsableWhen -- NotDefined");
    console.log("condition: ", oppId.current);

    if (
      guidesReference.current &&
      oppId.current &&
      sale &&
      responsableOptions &&
      projectId.current
    ) {
      const noResponsableDefined = sale.responsavel == 1;
      console.log({ noResponsableDefined });

      if (noResponsableDefined && projectId.current) {
        const responsableForFirstProject =
          await fetchResponsableForFirstProjectOption(projectId.current);
        console.log({ responsableForFirstProject });
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

  const setCurrentResponsableWhenDefined = () => {
    console.log("setCurrentResponsableWhen -- Defined");
    if (sale?.responsavel && responsableOptions) {
      const responsable = responsableOptions.find(
        (option: any) => option.id === sale.responsavel
      );
      console.log("defined responsable found: ", responsable);
      if (responsable) {
        setCurrentResponsable(
          responsableOptions.find(
            (option: any) => option.id === sale.responsavel
          )
        );
      }
    }
  };

  const displayAlert = async (severity: string, message: string) => {
    setTimeout(() => {
      setAlert(undefined);
    }, 3000);
    setAlert({ severity, message });
    return;
  };

  const fetchSalerOps = useCallback(async () => {
    const salers = await fetchSalers(0);
    const options = salers.map((saler: any) => ({
      label: saler.NOME,
      id: saler.CODPESSOA,
      object: "saler",
      key: saler.CODPESSOA,
    }));
    setResponsableOptions(options);
    setCurrentResponsable(options[0]);

    // setDefaultResponsableWhenNotDefined(firstsSaleState);
    // setCurrentResponsableWhenDefined(firstsSaleState, options);
  }, [setResponsableOptions]);

  const handleChangeTextField = (
    fieldReceived: Field,
     value: number | null
  ) => {
    if (guidesReference.current && sale) {
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
      setChangeWasMade(true);
    }
  };

  const handleChangeAutoComplete = (value: any) => {
    setCurrentResponsable(value);
    guide.fields[0].data = value.id;
  };

  useEffect(() => {
    if (guidesReference.current) {
      projectId.current = guidesReference.current[0].fields[0].data;
      oppId.current = guidesReference.current[0].fields[9].data;
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

  const shouldShowSendSaleEmailButton = () => {
    const statusGuide = guidesReference.current?.find(
      (guide) => guide.name === "Cadastro"
    );
    const codStatusField = statusGuide?.fields.find(
      (field) => field.dataKey === "codStatus"
    );
    if (codStatusField?.data === 11) {
      return true;
    }
    return false;
  };

  const handleSendSaleEmail = async () => {
    if (guidesReference.current && user) {
       setIsLoading(true);
         const codOsGuide = guidesReference.current.find(
           (guide) => (guide.name = "Cadastro")
         );
         const codOsField = codOsGuide?.fields.find(
           (field) => field.dataKey === "codOs"
         );
         const codOs = codOsField?.data;
         console.log({ codOs, user });
         try {
           const response = await sendSaleEmailByOppId(codOs, user);
           if(response.status === 200){ 
            displayAlert('success', 'Email Enviado com sucesso!');
           }
         } catch (e) {
            displayAlert("error", "Houve algum erro no envio do email");
         }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (responsableOptions) {
      setDefaultResponsableWhenNotDefined();
      setCurrentResponsableWhenDefined();
    }
  }, [responsableOptions]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
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
              <CurrencyInput
                value={sale[field.dataKey as keyof OpportunitySaleFields]}
                onChange={(newValue) => handleChangeTextField(field, newValue)}
                InputLabelProps={{ shrink: true }}
                key={field.dataKey}
                label={field.label}
              />
            );
          }
        })}
      </Box>
      {shouldShowSendSaleEmailButton() && (
        <Button
          onClick={handleSendSaleEmail}
          sx={{ ...BaseButtonStyles, width: 200 }}
        >
          Enviar email de venda
        </Button>
      )}
      {isLoading && <CircularProgress />}
      {alert && <Alert sx={{width: '100%'}} severity={alert.severity as AlertColor}>{alert.message}</Alert> }
    </Box>
  );
};

export default OpportunitySale;
