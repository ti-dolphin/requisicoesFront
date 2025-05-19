import { StatusChange } from '../../types';
import { Box, Typography } from '@mui/material';
import { formatDate } from '../../../generalUtilities';
import typographyStyles from '../../utilStyles';

interface props {
    row: StatusChange;
}
// id_status_requisicao, nome, acao_posterior, etapa, acao_anterior;
// "1", "Em edição", "Requisitar", "0", "-";
// "2", "Requisitado", "Cotar", "1", "Editar";
// "3", "Em cotação", "Aprovar (Gerente)", "2", "Requisitar";
// "6", "Aprovação Gerente", "Aprovar", "3", "Cotar";
// "7", "Aprovação Diretoria", "Aprovar", "4", "Aprovar (Gerente)";
// "8", "Gerar OC", "OC Gerada", "5", "Aprovar (Diretoria)";
// "9", "OC Gerada", "-", "6", "Gerar OC";
const StatusChangeRow = ({ row }: props)  => {

    const getChangeText = (row: StatusChange) => {
      if(row.status && row.status_anterior){ 
          switch (row.status?.nome) {
            case "Requisitado":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para requisitado.`
                : `${row.alterado_por_pessoa.NOME} validou a requisição.`;
            case "Em cotação":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para cotação.`
                : `${row.alterado_por_pessoa.NOME} iniciou a cotação.`;
            case "Aprovação Gerente":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} (Diretor) retornou para aprovação do gerente.`
                : `${row.alterado_por_pessoa.NOME} finalizou a cotação e enviou para aprovação do gerente.`;
            case "Aprovação Diretoria":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para aprovação da diretoria.`
                : `${row.alterado_por_pessoa.NOME} (Gerente) aprovou e enviou para aprovação da diretoria.`;
            case "Gerar OC":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para geração da Ordem de Compra.`
                : `${row.alterado_por_pessoa.NOME} (Diretor) aprovou e liberou para geração da Ordem de Compra.`;
            case "OC Gerada":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para Ordem de Compra gerada.`
                : `${row.alterado_por_pessoa.NOME} gerou a Ordem de Compra.`;
            case "Em edição":
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para edição.`
                : `${row.alterado_por_pessoa.NOME} colocou a requisição em edição.`;
            case "Validação": 
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} enviou para validação`
                : `${row.alterado_por_pessoa.NOME} enviou para validação`;
            default:
              return row.status_anterior.etapa > row.status.etapa
                ? `${row.alterado_por_pessoa.NOME} retornou para "${row.status?.nome}".`
                : `Status alterado para "${row.status?.nome}" por ${row.alterado_por_pessoa.NOME}.`; // Fallback message
          }
      }
    };

  return (
    <Box
      key={row.id_alteracao}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 0.5,
        marginBottom: 1,
        border: "1px solid #ccc",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography sx={{ ...typographyStyles.bodyText, fontSize: "small" }}>
        {getChangeText(row)}
      </Typography>
      {row.justificativa && (
        <Typography sx={{ ...typographyStyles.smallText, fontSize: "small" }}>
          justificativa: {row.justificativa}
        </Typography>
      )}
      <Typography sx={{ ...typographyStyles.smallText, fontSize: "small" }}>
        {formatDate(row.data_alteracao.toString())}
      </Typography>
    </Box>
  );
}

export default StatusChangeRow