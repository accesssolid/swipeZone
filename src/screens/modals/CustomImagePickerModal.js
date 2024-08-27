import React, { useContext } from 'react';
import { Modal, StyleSheet, Pressable, View, TouchableOpacity, Text, ImageBackground, Image, Linking, } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import AppUtils from '../../utils/appUtils';
import { LocalizationContext } from '../../localization/localization';
import { wp } from '../../utils/dimension';
import { useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';

const CustomImagePickerModal = props => {
  const { colors, images } = useTheme();
  const { localization } = useContext(LocalizationContext);
  const styles = usestyles(colors);

  const openGallery = async () => {
    let galleryAccess = await AppUtils.checkGalleryPermisssion()
    if (!galleryAccess) {
      Linking.openSettings()
      return
    }
    try {
      ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: false,
        mediaType: props?.mediaType || "photo",
      }).then(image => {
        console.log(image);
        props.attachments(image);
        props.pressHandler();
      }).catch((error) => {
        // if (error != "User cancelled image selection") {
        //   Linking.openSettings()
        // }
        AppUtils.showToast(error?.message ?? "Error")
      });
    } catch (error) {
      AppUtils.showToast(error?.message ?? "Error")
    }
  };

  const openCamera = async () => {
    let cameraAccess = await AppUtils.checkCameraPermisssion()
    if (!cameraAccess) {
      Linking.openSettings()
      return
    }
    ImagePicker.openCamera({
      // width: 400,
      // height: 400,
      cropping: false,
      mediaType: props?.mediaType || "photo",
    }).then(image => {
      props.attachments(image);
      props.pressHandler();
    }).catch((error) => {
      // if (error != "User cancelled image selection") {
      //   Linking.openSettings()
      // }
      AppUtils.showToast(error?.message ?? "Error")
    });;
  };

  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      transparent={true}
      {...props}>
      <Pressable onPress={props.pressHandler} style={styles.modalScreen}>
        <Pressable style={styles.modalContanier}>
          <Text style={styles.chooseMedia}>{localization?.appkeys?.UploadPicture}</Text>
          <Pressable
            style={styles.crossBtn}
            onPress={props.pressHandler}
          >
            <Image resizeMode='contain' source={images.cancel} style={{ height: 26, width: 26, tintColor: colors.primary, }} />
          </Pressable>
          <View style={styles.optionsContanier}>
            <TouchableOpacity onPress={() => openCamera()} style={[styles.btn, { marginRight: wp(20), }]}>
              <ImageBackground source={images?.backgroundcamera}
                style={styles.imgBg}>
                <Image source={images.camera} style={styles.icons} resizeMode='contain' />
              </ImageBackground>
              <Text style={styles.txt}>{localization?.appkeys?.Camera}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openGallery()} style={styles.btn}>
              <ImageBackground source={images?.backgroundcamera}
                style={styles.imgBg}>
                <Image source={images.gallery} style={styles.icons} resizeMode='contain' />
              </ImageBackground>
              <Text style={styles.txt}>{localization?.appkeys?.Gallery}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const usestyles = (colors) => StyleSheet.create({
  crossBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  modalScreen: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContanier: {
    backgroundColor: colors.background,
    minHeight: 140,
    paddingVertical: 20,
    width: "86%",
    borderRadius: 10
  },
  chooseMedia: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
    fontFamily: AppFonts.SemiBold
  },
  options: {
    fontSize: 16,
    color: '#2F6A98',
  },
  optionsContanier: {
    flexDirection: 'row',
    justifyContent: "center",
    marginTop: 24,
    alignSelf: "center"
  },
  pickerContanier: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icons: {
    height: "40%", width: "60%",
  },
  imgBg: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    fontFamily: AppFonts.SemiBold,
    fontSize: 12,
    color: colors.text,
    marginTop: 6
  }
});

export default CustomImagePickerModal;
