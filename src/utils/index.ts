export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24; // Принимаем только 24-часовой формат времени
  const remainingMinutes = minutes % 60;
  return `${hours < 10 ? '0' : ''}${hours}:${
    remainingMinutes < 10 ? '0' : ''
  }${remainingMinutes}`;
};
