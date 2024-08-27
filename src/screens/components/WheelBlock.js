import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const itemHeight = 50; // Height of each item
const visibleItems = 5; // Number of visible items in the picker
const centerIndex = Math.floor(visibleItems / 2);
const screenWidth = Dimensions.get('window').width;

const WheelBlock = ({ data, selectedValue, value, styleItemTxt }) => {
    const scrollViewRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(data[centerIndex - 1]);

    useEffect(() => {
        if (value) {
            setTimeout(() => {
                scrollToItem(value)
            }, 100);
            return
        }
        if (scrollViewRef.current) {
            const initialScrollOffset = Math.max(0, itemHeight * (centerIndex - 2) - itemHeight * -0.000001); // Adjusted offset
            scrollViewRef.current.scrollTo({ y: initialScrollOffset, animated: false });
        }
    }, [value]);

    const handleScroll = (event) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const selectedIndex = Math.round(yOffset / itemHeight);
        selectedValue(data[selectedIndex])
        // setSelectedItem(data[selectedIndex]);
    };
    const scrollToItem = (itemIndex) => {
        const scrollOffset = itemHeight * itemIndex - itemHeight * (centerIndex - 1);
        scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true });
        // setSelectedItem(data[itemIndex]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    onScroll={handleScroll}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={itemHeight}
                    decelerationRate="fast"
                    scrollEventThrottle={20}
                >
                    {data?.map((item) => (
                        <View key={item} style={styles.item}>
                            <Text style={[styles.itemText, styleItemTxt]}>{item}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.centerBox}>
                    {/* <Text style={styles.centerText}>Selected Item: {selectedItem}</Text> */}
                </View>
            </View>
        </View>
    )
}

export default WheelBlock

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "transparent"
    },
    pickerContainer: {
        height: 170,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        height: itemHeight * visibleItems,
        overflow: 'hidden',
    },
    contentContainer: {
        paddingTop: itemHeight * (centerIndex - 1) + itemHeight / 5,
        paddingBottom: itemHeight * (centerIndex - 1) + itemHeight / 5,
    },
    item: {
        width: (screenWidth - 20),
        height: itemHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 20,
        width: "100%",
        width: screenWidth,
        textAlign: "center"
    },
    centerBox: {
        width: '90%',
        height: itemHeight,
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -itemHeight / 2 }],
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -10,
    },
    centerText: {
        fontSize: 18,
        color: 'white',
    },
});