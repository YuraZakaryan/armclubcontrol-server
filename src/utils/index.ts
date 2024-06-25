import moment from 'moment';

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
export const minutesToTime = (minutes: number): string => {
  const hours: number = Math.floor(minutes / 60) % 24;
  const remainingMinutes: number = minutes % 60;
  return `${hours < 10 ? '0' : ''}${hours}:${
    remainingMinutes < 10 ? '0' : ''
  }${remainingMinutes}`;
};
export const getFormattedDate = (
  originalDate: Date,
  timeZoneString?: string,
): string => {
  const timeZone: string =
    timeZoneString || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone,
  };
  console.log(new Intl.DateTimeFormat('hy-AM', options).format(originalDate));
  return new Intl.DateTimeFormat('hy-AM', options).format(originalDate);
};
export const getDateAndTime = () => {
  const currentTime = moment();
  return { currentTime };
};
