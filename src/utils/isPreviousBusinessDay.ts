export function isPreviousBusinessDay(
  date: string,
  referenceDate: Date = new Date()
): boolean {
  const getPreviousBusinessDay = (date: Date): Date => {
    const previousDate = new Date(date);
    const dayOfWeek = previousDate.getDay();

    previousDate.setDate(
      previousDate.getDate() - (dayOfWeek === 1 ? 3 : 1)
    );

    return previousDate;
  };

  const previousBusinessDay = getPreviousBusinessDay(referenceDate);

  const targetDate = date.split("T")[0];

  const previousBusinessDayFormatted = [
    previousBusinessDay.getFullYear(),
    String(previousBusinessDay.getMonth() + 1).padStart(2, "0"),
    String(previousBusinessDay.getDate()).padStart(2, "0"),
  ].join("-");

  return targetDate === previousBusinessDayFormatted;
}