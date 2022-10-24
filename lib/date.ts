export let validDate = (date: string | null) => {
  if (date === null) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export let turnStringIntoDate = (date: string | null) => {
  if (validDate(date)) {
    return new Date(date as string);
  }
  return null;
};

export let formatDateTime = (date: string | null) => {
  if (!date) return null;
  if (!validDate(date)) return null;
  const d = new Date(date);
  const YYYY = d.getFullYear();
  const MM = ('0' + (d.getMonth() + 1)).slice(-2);
  const DD = ('0' + d.getDate()).slice(-2);
  const hh = ('0' + d.getHours()).slice(-2);
  const mm = ('0' + d.getMinutes()).slice(-2);
  const ss = ('0' + d.getSeconds()).slice(-2);
  return `${DD}/${MM}/${YYYY} ${hh}:${mm}`;
};
