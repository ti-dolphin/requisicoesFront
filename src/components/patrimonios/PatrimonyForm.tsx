import { Autocomplete, Box, Button, TextField } from "@mui/material";
import React from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useUserOptions } from "../../hooks/useUserOptions";
import { useProjectOptions } from "../../hooks/projectOptionsHook";
import { setFeedback } from "../../redux/slices/feedBackSlice";
import { PatrimonyService } from "../../services/patrimonios/PatrimonyService";
import MovementationService from "../../services/patrimonios/MovementationService";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { usePatrimonyTypeOptions } from "../../hooks/patrimonios/usePatrimonyTypeOptions";
import { Patrimony } from "../../models/patrimonios/Patrimony";
import { usePatrimonyFormPermissions } from "../../hooks/patrimonios/usePatrimonyFormPermissions";
import ElegantInput from "../shared/ui/Input";
import OptionsField from "../shared/ui/OptionsField";
import PatrimonyCalibrationAttachmentList from "./PatrimonyCalibrationAttachmentList";

interface FormData {
  nome: string;
  descricao: string;
  nserie: string;
  tipo: number;
  valor_compra: number;
  calibracao: number;
  data_proxima_calibracao: string;
  responsavel?: number;
  projeto?: number;
}

const formatDateForInput = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

const PatrimonyForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id_patrimonio } = useParams();
  const [patrimony, setPatrimony] = React.useState<Partial<Patrimony>>();
  const [formData, setFormData] = React.useState<FormData>({
    nome: "",
    descricao: "",
    nserie: "",
    tipo: 0,
    valor_compra: 0,
    calibracao: 0,
    data_proxima_calibracao: "",
  });
  const [calibrationAttachmentDialogOpen, setCalibrationAttachmentDialogOpen] =
    React.useState(false);

  //mode
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const { userOptions } = useUserOptions();
  const { projectOptions } = useProjectOptions();
  const { patirmonyTypeOptions } = usePatrimonyTypeOptions();
  const { permissionToEdit } = usePatrimonyFormPermissions(mode, patrimony);

  const fetchData = async () => {
    try {
      if (!id_patrimonio) {
        setMode("create");
        return;
      }
      setMode("edit");
      const data = await PatrimonyService.getById(Number(id_patrimonio));

      setPatrimony(data);
      setFormData({
        nome: data.nome,
        descricao: data.descricao,
        nserie: data.nserie,
        tipo: data.tipo,
        valor_compra: data.valor_compra,
        calibracao: data.calibracao ?? 0,
        data_proxima_calibracao: formatDateForInput(
          data.data_proxima_calibracao
        ),
      });
    } catch (e) {
      dispatch(
        setFeedback({
          message: "Houve um erro ao buscar os dados",
          type: "error",
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.calibracao === 1 && !formData.data_proxima_calibracao) {
        dispatch(
          setFeedback({
            message: "Preencha a data da próxima calibração.",
            type: "error",
          })
        );
        return;
      }

      //criar novo patrimônio
      if (!id_patrimonio) {
        if (
          !formData.nome ||
          !formData.descricao ||
          !formData.tipo ||
          !formData.responsavel ||
          !formData.projeto
        ){ 
          dispatch(
            setFeedback({
              message: "Preencha nome, descrição, tipo, projeto e responsável para criar o patrimônio.",
              type: "error",
            })
          );
          return;
        }
        const newPatrymony = await PatrimonyService.create({
          nome: formData.nome,
          descricao: formData.descricao,
          nserie: formData.nserie,
          valor_compra: formData.valor_compra,
          tipo: formData.tipo,
          calibracao: formData.calibracao,
          data_proxima_calibracao:
            formData.calibracao === 1
              ? formData.data_proxima_calibracao
              : null,
        });
        if (newPatrymony) {
          const firstMovementation = await MovementationService.create({
            id_patrimonio: newPatrymony.id_patrimonio,
            id_responsavel: formData.responsavel,
            id_projeto: formData.projeto,
          });
          if (firstMovementation) {
            dispatch(
              setFeedback({
                message: "Patrimônio criado com sucesso",
                type: "success",
              })
            );
          }
          navigate(`/patrimonios/${newPatrymony.id_patrimonio}`);
          return;
        }
      }
      //atualizar patrimônio
      const updatedPatrimony = await PatrimonyService.update(
        Number(id_patrimonio),
        {
          ...formData,
          data_proxima_calibracao:
            formData.calibracao === 1
              ? formData.data_proxima_calibracao
              : null,
        }
      );
      if (updatedPatrimony) {
        setPatrimony(updatedPatrimony);
        dispatch(
          setFeedback({
            message: "Patrimônio atualizado com sucesso",
            type: "success",
          })
        );
      }
    } catch (error) {
      dispatch(
        setFeedback({
          message: "Erro ao criar patrimônio",
          type: "error",
        })
      );
    }
  };

  const handleFocus = (e : React.FocusEvent<HTMLInputElement> ) =>  {
    if (!permissionToEdit)  { 
      e.target.blur();
      dispatch(setFeedback({type: "error", message: "Você nao tem permissão para editar o campo."}));
    }
  }

  React.useEffect(() => {
    fetchData();
  }, [dispatch, id_patrimonio]);

  return (
    <>
      <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        padding: 1,
        alignItems: "center",
      }}
    >
      <ElegantInput
        label="Nome"
        fullWidth
        required
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        onFocus={handleFocus}
        disabled={!permissionToEdit}
      />
      <ElegantInput
        label="Descrição"
        fullWidth
        required
        value={formData.descricao}
        onChange={(e) =>
          setFormData({ ...formData, descricao: e.target.value })
        }
        onFocus={handleFocus}
        disabled={!permissionToEdit}
      />
      <ElegantInput
        label="Nº de série"
        fullWidth
        value={formData.nserie}
        onChange={(e) => setFormData({ ...formData, nserie: e.target.value })}
        onFocus={handleFocus}
        disabled={!permissionToEdit}
      />
      <ElegantInput
        label={"Valor de compra"}
        type="number"
        fullWidth
        value={formData.valor_compra}
        onChange={(e) =>
          setFormData({ ...formData, valor_compra: Number(e.target.value) })
        }
        onFocus={handleFocus}
        disabled={!permissionToEdit}
      />

      {/* autoComplete */}

      <OptionsField
        label={"Tipo"}
        options={patirmonyTypeOptions}
        value={formData.tipo}
        onChange={(optionIdSelected) =>
          setFormData({ ...formData, tipo: Number(optionIdSelected) })
        }
      />
      {mode === "create" && (
        <>
        <OptionsField 
        label="Projeto"
        options={projectOptions}
        value={formData.projeto}
        optionHeight={60}
        onChange={(optionIdSelected) =>
          setFormData({ ...formData, projeto: Number(optionIdSelected) })
        }
        />
        <OptionsField 
        label="Responsável"
        options={userOptions}
        value={formData.responsavel}
        onChange={(optionIdSelected) =>
          setFormData({ ...formData, responsavel: Number(optionIdSelected) }) }
        />
        </>
      )}

      <div className="mt-2 flex w-full items-center gap-2">
        <input
          id="calibracao"
          type="checkbox"
          className="h-5 w-5 cursor-pointer accent-blue-700"
          checked={formData.calibracao === 1}
          onChange={(e) =>
            setFormData({
              ...formData,
              calibracao: e.target.checked ? 1 : 0,
              data_proxima_calibracao: e.target.checked
                ? formData.data_proxima_calibracao
                : "",
            })
          }
          onFocus={handleFocus}
          disabled={!permissionToEdit}
        />
        <label htmlFor="calibracao" className="text-xs font-medium text-gray-700">
          Calibração
        </label>
      </div>

      {formData.calibracao === 1 && (
        <>
          <ElegantInput
            label="Data da próxima calibração"
            type="date"
            fullWidth
            required
            value={formData.data_proxima_calibracao}
            onChange={(e) =>
              setFormData({
                ...formData,
                data_proxima_calibracao: e.target.value,
              })
            }
            onFocus={handleFocus}
            disabled={!permissionToEdit}
          />

          <Button
            variant="outlined"
            size="small"
            startIcon={<AttachFileIcon />}
            onClick={() => setCalibrationAttachmentDialogOpen(true)}
            disabled={!id_patrimonio}
            sx={{ alignSelf: "flex-start", px: 1.5 }}
          >
            Anexo de calibração
          </Button>
        </>
      )}

      <Button type="submit" variant="contained">
        {mode === "create" ? "Criar" : "Salvar"}
      </Button>
      </Box>

      <PatrimonyCalibrationAttachmentList
        open={calibrationAttachmentDialogOpen}
        onClose={() => setCalibrationAttachmentDialogOpen(false)}
      />
    </>
  );
};

export default PatrimonyForm;
