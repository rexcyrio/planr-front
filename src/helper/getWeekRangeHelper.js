function getWeekRange(mondayKey) {
  const [dateNumber, monthNumber, yearNumber] = mondayKey;

  const monday = new Date(yearNumber, monthNumber, dateNumber);
  const sunday = new Date(yearNumber, monthNumber, dateNumber + 6);
  return `${convertToDateString(monday)} - ${convertToDateString(sunday)}`;
}

function convertToDateString(dateObject) {
  // "Wed Jul 28 1993"
  const str = dateObject.toDateString();

  // ["Jul", "28", "1993"]
  const [shortMonthName, date, year] = str.split(" ").slice(1);

  return `${date} ${shortMonthName} ${year}`;
}

export default getWeekRange;
