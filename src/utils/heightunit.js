function convertHeightToFeet(height) {
    if (typeof height !== 'string') {
        throw new Error('Invalid input. Height must be a string.');
    }

    const regex = /(\d+)\s*ft\s*(\d+)\s*in/;
    const match = height.match(regex);

    if (!match) {
        throw new Error('Invalid input format. Height must be in the format "Xft Yin".');
    }

    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);

    if (isNaN(feet) || isNaN(inches)) {
        throw new Error('Invalid input values. Feet and inches must be numeric values.');
    }

    return feet + inches / 12;
}

export default convertHeightToFeet;

export function convertDecimalHeightToFeetAndInches(decimalHeight) {
    if (typeof decimalHeight !== 'number') {
        throw new Error('Invalid input. Height must be a number.');
    }

    let feet = Math.floor(decimalHeight);
    let inches = Math.round((decimalHeight - feet) * 12);
    let newinch = inches < 10 ? `0${inches}` : inches.toString();
    let final = `${feet}ft ${newinch}in`
    return final;
}
export const generateHeightsArray = (startFeet, endFeet) => {
    const heights = [];

    for (let feet = startFeet; feet <= endFeet; feet++) {
        for (let inches = 0; inches <= (feet === endFeet ? 0 : 11); inches++) {
            heights.push(`${feet}'${inches}"`);
        }
    }

    return heights;
}
export function generateDecimalNumbersArray(start, end, step) {
    const numbers = [];
    for (let num = start; num <= end; num += step) {
        numbers.push(num.toFixed(1));
    }
    numbers.push(`${end.toFixed(1)} +`)
    return numbers;
}
export const generateWeightNumbers = () => {
    return Array.from({ length: 301 }, (_, index) => index + 0)
}
