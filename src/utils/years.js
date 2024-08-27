const yearList = (() => {
    let temp = [];
    for (let i = 2020; i <= 2050; i++) {
        let val = i?.toString()
        temp.push({ value: val, name: val });
    }
    return temp;
})();

const getYearList = () => {
    return yearList;
};

export default getYearList;