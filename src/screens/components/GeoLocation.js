import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
        let permission = await Geolocation.requestAuthorization('whenInUse')
        return permission == "granted";
    } else {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
}

function useGeolocation() {
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function getCurrentLocation() {
            const hasPermission = await requestLocationPermission();

            if (hasPermission) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        if (isMounted) {
                            setCoordinates({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            });
                            setError(null);
                        }
                    },
                    (error) => {
                        if (isMounted) {
                            setCoordinates(null);
                            setError(error);
                        }
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                if (isMounted) {
                    setCoordinates(null);
                    setError('Location permission denied');
                }
            }
        }

        getCurrentLocation();

        return () => {
            isMounted = false;
        };
    }, []);

    return { coordinates, error };
}
export default useGeolocation;