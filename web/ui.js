export const getKeyRead = () => window.location.hash.replace(/^#/, 'xyz');
export const onClickWrite = (writeTa, event) => {
  console.log('onClickWrite', writeTa.value);
};
