export function generateRandomDigitInteger() {
    const min = 100000; // Minimum 6-digit integer
    const max = 999999; // Maximum 6-digit integer
    const ll = 6;

    // Generate a random number between min and max
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Convert the random number to a string
    const randomString = randomNumber.toString();

    // Pad the string with leading zeros if necessary 
    const paddedString = randomString.padStart(ll, "0");

    // Convert the padded string back to an integer
    const randomSixDigitInteger = parseInt(paddedString);

    return randomSixDigitInteger;
}

export function generateRandomString() {
    let ll = 6;
    let t =
        "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678!@#$%^&*(){}[],./<>?";
    let a = t.length;
    let n = "";
    for (let i = 0; i < ll; i++) {
        n += t.charAt(Math.floor(Math.random() * a));
    }
    console.log("generateRandomString,888?666?:", n);
    return n;
}
