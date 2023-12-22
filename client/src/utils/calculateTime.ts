export const calculateTime = (date_str: string): string => {
  const given_date = new Date(date_str);

  const now = new Date();

  let num_now = Number(now);
  let num_given =
    Number(given_date) + 60 * 60 * 1000 > num_now
      ? Number(given_date)
      : Number(given_date) + 60 * 60 * 1000;

  //timezone operations
  const time = num_now - num_given;

  const msecs_in_year = 1000 * 60 * 60 * 24 * 365;
  const msecs_in_month = 1000 * 60 * 60 * 24 * 30;
  const msecs_in_day = 1000 * 60 * 60 * 24;
  const msecs_in_hour = 1000 * 60 * 60;
  const msecs_in_minute = 1000 * 60;
  const msecs_in_sec = 1000;

  const years = Math.floor(time / msecs_in_year);
  if (years > 0) return years + " year" + (years > 1 ? "s" : "");
  const months = Math.floor((time - years * msecs_in_year) / msecs_in_month);
  if (months > 0) return months + " mth" + (months > 1 ? "s" : "");
  const days = Math.floor(
    (time - years * msecs_in_year - months * msecs_in_month) / msecs_in_day
  );
  if (days > 0) return days + " day" + (days > 1 ? "s" : "");
  const hours = Math.floor(
    (time -
      years * msecs_in_year -
      months * msecs_in_month -
      days * msecs_in_day) /
      msecs_in_hour
  );
  if (hours > 0) return hours + " hr" + (hours > 1 ? "s" : "");
  const minutes = Math.floor(
    (time -
      years * msecs_in_year -
      months * msecs_in_month -
      days * msecs_in_day -
      hours * msecs_in_hour) /
      msecs_in_minute
  );
  if (minutes > 0) return minutes + " mn" + (minutes > 1 ? "s" : "");
  const seconds = Math.floor(
    (time -
      years * msecs_in_year -
      months * msecs_in_month -
      days * msecs_in_day -
      hours * msecs_in_hour -
      minutes * msecs_in_minute) /
      msecs_in_sec
  );
  if (seconds > 0) return seconds + " sec" + (seconds > 1 ? "s" : "");

  return "Just now";
};
