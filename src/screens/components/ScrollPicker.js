import { StyleSheet, Button, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import ScrollPicker from "react-native-wheel-scrollview-picker";
import { hp } from '../../utils/dimension';

const ScrollWheelPicker = ({ data, selectedValue, value }) => {
    // const dataSource = ["1", "2", "3", "4", "5", "6"];

    // const dataSource = ["Apple", "Banana", "Orange"];

    // const renderItem = (data, index) => {
    //   console.log(`Render Item - Index: ${index}, Data: ${data}`);
    //   return <Text>{data}</Text>; // Replace with your rendering logic
    // };

    // const onValueChange = (data, selectedIndex) => {
    //   console.log(`Selected Index: ${selectedIndex}, Selected Data: ${data}`);
    //   // Replace with your value change logic
    // };
    const ref = React.useRef();
    const [index, setIndex] = React.useState(0);

    useEffect(() => {
        // setTimeout(() => {
        //     setIndex(Number(value));
        // }, 1000);
    }, [value])

    // Function to handle the value change in the ScrollPicker
    const onValueChange = (data, selectedIndex) => {
        selectedValue(data)
    };

    // Function to handle the "Next" button press
    // const onNext = () => {
    //     if (index === data.length - 1) return;
    //     setIndex(index + 1);
    //     ref.current && ref.current.scrollToTargetIndex(index + 1);
    // };
    // const scrollToInitialIndex = (initialIndex) => {
    //     console.log(initialIndex);

    // ref.current.setSelectedIndex(initialIndex, true);
    // if (ref?.current) {
    //     setTimeout(() => {
    //     }, 400);
    // }
    // };

    return (
        <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
            <ScrollPicker
                ref={ref}
                dataSource={data}
                selectedIndex={value}
                onValueChange={onValueChange}
            />
        </View>
    );
}
export default ScrollWheelPicker
