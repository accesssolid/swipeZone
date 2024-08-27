import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@react-navigation/native';
import SignUpDetailFooter from './SignUpDetailFooter';

const AuthContainer = ({ children, signupfooter, progress, onPressBack, onPressNext, styleNextBtn, styleSkipBtn, t1 }) => {
    const { colors, images } = useTheme();
    return (
        <SafeAreaProvider>
            <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
                <ImageBackground source={images.orangegrad} style={{ flex: 1 }}>
                    <KeyboardAvoidingView behavior={Platform?.OS == "ios" ? "padding" : null} keyboardVerticalOffset={40} style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false} nestedScrollEnabled={true}>
                            {children}
                        </ScrollView>
                    </KeyboardAvoidingView>
                    {signupfooter && <SignUpDetailFooter t1={t1} progress={progress} onPressBack={onPressBack} onPressNext={onPressNext} styleNextBtn={styleNextBtn} styleSkipBtn={styleSkipBtn} />}
                </ImageBackground>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AuthContainer

const styles = StyleSheet.create({})