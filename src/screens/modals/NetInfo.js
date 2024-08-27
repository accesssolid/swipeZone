import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

function NetInfo({ isVisible}) {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      style={{ borderWidth: 1, flex: 1 }}
    >
      <View style={style.parent}>
      <Text style={style.txtStyle}>{'No Internet Connection'}</Text>
    </View>
    </Modal>
  );
}

export default NetInfo;

const style = StyleSheet.create({
  parent: {padding:12,borderRadius:8,backgroundColor:'red',position:'absolute',bottom:40,justifyContent:'center',zIndex:60,alignSelf:'center'},
  txtStyle: {fontSize:16,alignSelf:'center',color:'white',fontWeight:'600'},
});
