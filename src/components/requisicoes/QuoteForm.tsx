import React, { ChangeEvent } from "react";
import { TextField, Box, Button, Grid, Autocomplete } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { isNumeric } from "../../utils";
import { useQuoteFieldOptions } from "../../hooks/requisicoes/QuoteFieldOptionsHook";
import {
  setQuote,
} from "../../redux/slices/requisicoes/quoteSlice";
import { Quote } from "../../models/requisicoes/Quote";
import { Option } from "../../types";
import { useQuoteFields } from "../../hooks/requisicoes/useQuoteFields";
import { useQuoteFieldPermissions } from "../../hooks/requisicoes/useQuoteFieldPermissions";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import OptionsField from "../shared/ui/OptionsField";
import ElegantInput from "../shared/ui/Input";
interface QuoteFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, data: any) => void;
}

const QuoteForm = ({ onSubmit }: QuoteFormProps) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { quote, accessType } = useSelector((state: RootState) => state.quote);
  const isSupplierRoute = accessType === "supplier";

  const {
    taxClassificationOptions,
    paymentConditionOptions,
    shipmentTypeOptions,
  } = useQuoteFieldOptions();

  const { permissionToEditFields } = useQuoteFieldPermissions(
    user,
    isSupplierRoute
  );

  const { fields, disabledFields } = useQuoteFields(
    isSupplierRoute,
    taxClassificationOptions,
    paymentConditionOptions,
    shipmentTypeOptions
  );

  const handleChangeOptionField = (field: keyof Quote, optionId: number) => {
    if (quote) {
      dispatch(setQuote({ ...quote, [field]: optionId }));
    }
  };

  //verifica a permissão para alterar
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!permissionToEditFields) {
      e.target.blur();
      dispatch(
        setFeedback({
          type: "error",
          message: " Vocé nao tem permissão para editar o campo.",
        })
      );
    }
  };

  const handleChangeTextField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Quote
  ) => {
    const { value } = e.target;

    if (quote) {
      const codeFields = ["cnpj_fornecedor", "cnpj_faturamento", "descricao", "observacao", "fornecedor"];
      const normalizedValue = value.replace(",", ".");
      
      const isIncompleteDecimal = normalizedValue.endsWith(".") || /\.\d*$/.test(normalizedValue);
      
      dispatch(
        setQuote({
          ...quote,
          [field]:
            isNumeric(normalizedValue) && !codeFields.includes(field) && !isIncompleteDecimal
              ? Number(normalizedValue)
              : normalizedValue,
        })
      );
    }
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={(e) => onSubmit(e, quote)}
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Grid container spacing={1}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            {field.autoComplete && field.options.length > 0 ? (
              <OptionsField
                label={field.label}
                options={field.options}
                value={quote ? String(quote[field.name as keyof Quote] ) : ""}
                required={field.required}
                onChange={(optionId) => {
                  handleChangeOptionField(
                    field.name as keyof Quote,
                    Number(optionId)
                  );
                }}
                disabled={field.disabled}
              />
            ) : (
              <ElegantInput
                label={field.label}
                value={quote ? String(quote[field.name as keyof Quote] ?quote[field.name as keyof Quote] : ""  ) : ""}
                  required={field.required}
                onChange={(e) =>
                  handleChangeTextField(e, field.name as keyof Quote)
                }
                disabled={field.disabled}
                onFocus={handleFocus}
              />
            )}
          </Grid>
        ))}
      </Grid>
      <Button type="submit" size="small" variant="contained" color="primary" fullWidth>
        Salvar
      </Button>
    </Box>
  );
};

export default QuoteForm;
