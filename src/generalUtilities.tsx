import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { Box, CircularProgress } from "@mui/material";
dayjs.extend(utc);
dayjs.extend(timezone);

export const  formatDate = (value : Date | string) =>  {
   if (typeof value === "string") {
      const brazilianDateTime = dayjs.utc(value);
      const formattedDate = brazilianDateTime.format("DD/MM/YYYY");
      const formattedTime = brazilianDateTime.format("HH:mm:ss");
      if (formattedTime === '00:00:00'){ 
            return `${formattedDate}`
      }
      return `${formattedDate}, ${formattedTime}`;
    }
}
export const formatDateWithNoTime = (value: Date | string) => {
  if (typeof value === "string") {
    const brazilianDateTime = dayjs.utc(value);
    const formattedDate = brazilianDateTime.format("DD/MM/YYYY");
    return `${formattedDate}`;
  }
};

 export const isPDF = (url: string) => {
   console.log({ url });
   if (/\.pdf$/i.test(url)) {
     return true;
   }
   return false;
 };

export const Loader = ( ) =>  { 
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        height: '100%',
        width: '100%',
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Fundo semi-transparente
        zIndex: 1000, // Garante que o spinner fique acima de tudo
      }}
    >
      <CircularProgress />
    </Box>
  )
 }
