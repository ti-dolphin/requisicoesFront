import { Movementation } from '../../types';
import { ListChildComponentProps } from 'react-window';
import { Box, Card, Stack, Typography } from '@mui/material';
import MovimentationFileModal from '../modals/MovimentationFileModal/MovimentationFileModal';
import { basicCardStyles, basicCardContentStyles } from '../../../utilStyles';
interface MovementationCardProps {
  cardData: Movementation;
  props: ListChildComponentProps;
  key: number
}
const cardColumns = [
  { label: "Projeto",  dataKey: "projeto" },
  { label: "Observação", dataKey: "observacao" },
  { label: "Data", dataKey: "data" },
  { label: "Responsável",  dataKey: "responsavel" },
  { label: "Nº Movimentação",  dataKey: "id_movimentacao" },
];
const MovementationCard = ({
  cardData,
  props,
  key,
}: MovementationCardProps) => {
  const { index, style, data } = props;
  console.log({ index, style, data });
  console.log(cardData);
   return (
     <Card key={key} sx={{ ...style, ...basicCardStyles }}>
       <Box sx={basicCardContentStyles} className="shadow-sm shadow-gray-600">
         {cardColumns.map((column) => (
           <Box key={column.dataKey} sx={{ marginBottom: 1 }}>
             <Stack direction="row" gap={1} alignItems="center">
               <Typography fontSize="small" fontWeight="bold" color="black">
                 {column.label}:
               </Typography>{" "}
               <Typography fontSize="small" color="textSecondary">
                 {cardData[column.dataKey as keyof Movementation]}
               </Typography>
             </Stack>
           </Box>
         ))}
         <MovimentationFileModal movementationId={cardData.id_movimentacao} />
       </Box>
     </Card>
   );
};

export default MovementationCard