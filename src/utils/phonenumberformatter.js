const parsePhoneNumber = (phoneNumber) => {
    const numbersOnly = phoneNumber?.replace(/\D/g, '');
    return numbersOnly
}
const formatPhoneNumber = (input) => {
    // Remove any non-digit characters from the input
    const cleanedInput = input?.replace(/\D/g, '');
    // Check if the input is not empty and is a valid number
    if (cleanedInput && !isNaN(cleanedInput)) {
        // Format the phone number as "111-111-1111"
        const formattedNumber = cleanedInput.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedNumber
    } else {
        // If the input is empty or not a valid number, clear the state
        return ''
    }
}
const formatPhoneNumber2 = (input) => {
    // Remove any non-digit characters from the input
    const cleanedInput = input?.replace(/\D/g, '');

    // Check if the input is not empty and is a valid number
    if (cleanedInput && !isNaN(cleanedInput)) {
        // Format the phone number as "(111)111-1111"
        const formattedNumber = cleanedInput.replace(/(\d{3})(\d{3})(\d{4})/, '($1)$2-$3');
        // writeSignupdata("hsCPhone", formattedNumber)
        return formattedNumber;
    } else {
        // If the input is empty or not a valid number, clear the state
        // writeSignupdata("hsCPhone", input)
        return '';
    }
}
const isValidPhoneNumber = (phoneNumber) => {
    // Define a regular expression pattern for the format "111-111-1111"
    const pattern = /^\d{3}-\d{3}-\d{4}$/;

    // Use the test method to check if the phoneNumber matches the pattern
    return pattern.test(phoneNumber);
}
export { parsePhoneNumber, formatPhoneNumber, formatPhoneNumber2, isValidPhoneNumber }