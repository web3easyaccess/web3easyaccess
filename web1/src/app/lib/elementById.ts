export const getInputValueById = (id: string) => {
  let inputElement = document.getElementById(id) as HTMLInputElement;
  if (inputElement == null) {
    throw new Error("id is not exists:" + id);
  }
  return inputElement.value;
};

export const setInputValueById = (id: string, newValue: string) => {
  let inputElement = document.getElementById(id) as HTMLInputElement;
  if (inputElement == null) {
    throw new Error("id is not exists:" + id);
  }
  inputElement.value = newValue;
};
