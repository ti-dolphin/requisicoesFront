import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
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
