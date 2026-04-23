export const formatToken = (token: number) => {
  if (token < 1000) {
    return token;
  }
  if (token < 1000000) {
    return (token / 1000).toFixed(2).replace(/\.0$/, '') + 'k';
  }
  return (token / 1000000).toFixed(2).replace(/\.0$/, '') + 'm';
};
