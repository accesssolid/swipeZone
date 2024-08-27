import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import SolidView from '../components/SolidView'
import Video from 'react-native-video';
import { mediaurl } from '../../utils/mediarender';
import { useTheme } from '@react-navigation/native';
import { hp, wp } from '../../utils/dimension';

const VideoPlayer = ({ navigation, route }) => {
    const { media } = route?.params

    const { colors } = useTheme();

    const [isLoading, setIsLoading] = useState(true)
    return (
        <SolidView
            back={true}
            title={"Video player"}
            onPressLeft={() => { navigation?.goBack() }}
            view={
                <View style={{ flex: 1 }}>
                    {isLoading && <ActivityIndicator size={"large"} color={colors.primary} style={{ position: "absolute", top: hp(40), alignSelf: "center" }} />}
                    <Video
                        source={{ uri: media?.includes("firebasestorage") && media?.includes("googleapis.com") ? media : media?.includes("file://") ? media : mediaurl(media) }}   // Can be a URL or a local file.
                        onLoad={() => { setIsLoading(false) }}
                        style={{ flex: 1 }}
                        resizeMode="contain"
                        controls={true}
                    />
                </View>
            }
        />
    )
}

export default VideoPlayer

const styles = StyleSheet.create({})