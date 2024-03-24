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
