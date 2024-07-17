export const getInputValueById = (id: string) => {
    try {
        let inputElement = document.getElementById(id);
        if (inputElement == null) {
            console.log("WARN,id is not exists:" + id);
            return null;
        }
        return (inputElement as HTMLInputElement).value;
    } catch (e) {
        console.log("getInputValueById error:", e);
        return null;
    }
};

export const setInputValueById = (id: string, newValue: string) => {
    try {
        let inputElement = document.getElementById(id);
        if (inputElement == null) {
            console.log("WARN,id is not exists:" + id);
            return;
        }
        (inputElement as HTMLInputElement).value = newValue;
    } catch (e) {
        console.log("setInputValueById error:", e);
    }
};
