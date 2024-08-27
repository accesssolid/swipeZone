import React, { cloneElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, Text, StyleSheet, View, FlatList } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import Trimmer from 'react-native-trimmer';
import moment from 'moment';
import AppFonts from '../../constants/fonts';
import { useTheme } from '@react-navigation/native';
import AppUtils from '../../utils/appUtils';
import { createThumbnail } from "react-native-create-thumbnail";
import { hp, wp } from '../../utils/dimension';
import FastImage from 'react-native-fast-image';

const TrimmerModal = ({ visible, item,
    // path,
    totalduration,
    trimDuration, onPressCancel, finalpath, onTrimPress, thumbnail, isAudio }) => {
    const { colors, images } = useTheme();
    const playerRef = useRef();

    const [thumbnails, setthumbnails] = useState([]);
    const [video, setvideo] = useState(path);
    const [loading, setLoading] = useState(false);
    const path = item?.path

    const [trimmerLeftHandlePosition, settrimmerLeftHandlePosition] = useState(0);
    const [trimmerRightHandlePosition, settrimmerRightHandlePosition] = useState(trimDuration ?? 30000);
    const timestamp = moment().format('YYYYMMDD-HHmmss');
    const [scrubbPos, setScrubbPos] = useState(0)
    const [showThumbs, setShowThumbs] = useState(false)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        if (item) {
            setvideo(item?.path)
            settrimmerLeftHandlePosition(0);
            settrimmerRightHandlePosition((trimDuration > totalduration ? totalduration : trimDuration) || 30000);
            getfilepath()
        }
        return () => {
            setthumbnails([])
            setScrubbPos(0)
        }
    }, [item])

    const handleLoadStart = () => {
        setLoading(true);
    };
    const handleLoad = () => {
        setLoading(false);
    };
    const handleProgress = (progress) => {

        // if (loading) {
        //     if (progress.playableDuration >= progress.currentTime + 3) {
        //         setLoading(false);
        //     }
        // }
    };
    const onHandleChange = ({ leftPosition, rightPosition }) => {
        if (rightPosition - leftPosition < 10000) {
            return
        }
        settrimmerRightHandlePosition(rightPosition);
        settrimmerLeftHandlePosition(leftPosition);
    };
    const onScrubbingComplete = (newValue) => {
        setScrubbPos(newValue)
        setShowThumbs(false)
        playerRef.current.seek(newValue / 1000);
    }
    useEffect(() => {
        if (scrubbPos < trimmerLeftHandlePosition) {
            playerRef.current.seek(trimmerLeftHandlePosition / 1000);
        }
    }, [trimmerLeftHandlePosition, scrubbPos])

    const trimVideo = async (videoPath) => {
        // Request permission to write to the file system
        // const writePermission = await request(
        //   'android.permission.WRITE_EXTERNAL_STORAGE',
        // );
        let ext = '.mp4'
        const outputPath = `${RNFS.CachesDirectoryPath}/trimmed-video-${timestamp + ext}`;
        let total = trimmerRightHandlePosition / 1000 - trimmerLeftHandlePosition / 1000;
        if (total > 45) {
            AppUtils.showToast("Video can't be more than 45 sec.")
            return
        }
        const startTime = trimmerLeftHandlePosition / 1000 > 10 ? `00:00:${trimmerLeftHandlePosition / 1000}` : `00:00:0${trimmerLeftHandlePosition / 1000}`; // start time of the trim
        const duration = total > 10 ? `00:00:${total}` : `00:00:0${total}`; // duration of the trim
        const command = `-y -i "${videoPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;

        await FFmpegKit.execute(command);
        // Return the path to the trimmed video
        // console.log(outputPath, "this is the output path");
        // finalpath(outputPath);
        // thumbnail(thumbnails.length > 1 ? thumbnail[1] : thumbnails.length > 0 ? thumbnail[0] : '')
        // setvideo('');
        // setcropPath(outputPath);
        // setvideo(outputPath)
        onPressCancel()
        onTrimPress({ ...item, path: 'file://' + outputPath, duration: total, thumb: thumbnails[0] });
    }
    const getfilepath = () => {
        let du = totalduration;
        let output = [];
        console.log(totalduration);
        let increment = Math.floor((du - 1) / 10);
        for (let i = 1; i < du; i += increment) {
            if (output.length < 9) {
                output.push(i);
            } else {
                output.push(du - 1);
                break;
            }
        }
        let imagesArr = [];
        if (output.length > 0) {
            const promises = output.map(timeStamp => {
                return createThumbnail({
                    url: path,
                    timeStamp: timeStamp,
                    format: 'png',
                    dirSize: 1000,
                })
                    .then(response => {
                        imagesArr.push(response?.path);
                        return response?.path;
                    })
                    .catch(err => console.log({ err }));
            });
            Promise.all(promises)
                .then(() => {
                    setthumbnails([...imagesArr]);
                    console.log('output', output);
                    console.log('imagesArr', imagesArr);
                })
                .catch(err => console.log({ err }));
        }
    };
    const onScrubberPressIn = () => {
        setShowThumbs(true)
        setPaused(true)
    }

    return (
        <Modal visible={visible}>
            <View style={{ flex: 1 }}>
                <View style={{ width: '100%' }}>
                    {paused && <Pressable onPress={() => { setPaused(false) }} style={{ height: 40, width: 40, position: "absolute", zIndex: 10, top: hp(40), alignSelf: "center" }}>
                        <Image source={images.play} style={{ height: "100%", width: "100%", resizeMode: "contain" }} />
                    </Pressable>}
                    {video && (
                        <Video source={{ uri: video }} ref={playerRef} muted={false} useTextureView={true} hls={true}
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                            paused={paused}
                            resizeMode={'cover'}
                            onLoadStart={handleLoadStart}
                            onLoad={handleLoad}
                            onProgress={handleProgress}
                            onError={(err) => AppUtils.showLog('Error', err)}
                        />
                    )}
                </View>
                {video && (
                    <View style={{ alignSelf: 'center', position: 'absolute', bottom: 120, justifyContent: "center" }}>
                        {/* {showThumbs &&
                            (thumbnails ?
                                <View style={{ flexDirection: 'row', opacity: 1, zIndex: -10 }}>
                                    {thumbnails?.map((i, j) => {
                                        return <FastImage source={{ uri: 'file://' + i }} style={{ height: 80, minWidth: 1, flex: 1 }} />
                                    })}
                                </View>
                                :
                                <ActivityIndicator size={"large"} color={colors.primary} />)
                        } */}
                        <Trimmer
                            tintColor={colors.btncolor}
                            isMaxDuration={true}
                            onHandleChange={onHandleChange}
                            trackBorderColor="transparent"
                            trackBackgroundColor={colors.white}
                            totalDuration={totalduration}
                            minimumTrimDuration={3000}
                            maxTrimDuration={trimDuration ?? 45000}
                            zoomMultiplier={0}
                            maximumZoomLevel={1}
                            initialZoomValue={0.8}
                            scaleInOnInit={false}
                            trimmerLeftHandlePosition={trimmerLeftHandlePosition}
                            trimmerRightHandlePosition={trimmerRightHandlePosition}
                            scrubberPosition={scrubbPos}
                            onScrubbingComplete={onScrubbingComplete}
                            onScrubberPressIn={onScrubberPressIn}
                        // onLeftHandlePressIn={onScrubberPressIn}
                        />
                    </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 30, width: '100%' }}>
                    <Pressable
                        onPress={onPressCancel}
                        style={{ height: 50, width: 100, marginTop: 50, borderRadius: 10, marginLeft: 10, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', }}>
                        <Text style={{ fontSize: 18, fontFamily: AppFonts.Bold, color: 'white', }}>Cancel</Text>
                    </Pressable>
                    <Pressable style={{ height: 50, width: 100, marginTop: 50, borderRadius: 10, marginRight: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', }}
                        onPress={() => {
                            if (thumbnails?.length == 0) {
                                return
                            }
                            trimVideo(video);
                        }}
                    >
                        {
                            thumbnails?.length == 0 ?
                                <ActivityIndicator size={"large"} color={"white"} />
                                :
                                <Text style={{ fontSize: 18, fontFamily: AppFonts.Bold, color: 'white', }}>Trim</Text>
                        }
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default TrimmerModal

const styles = StyleSheet.create({})