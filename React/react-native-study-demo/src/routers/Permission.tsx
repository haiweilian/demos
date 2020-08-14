import React from 'react';
import {PermissionsAndroid, Platform, Button, Text} from 'react-native';

const Permission = () => {
  const [permissionsGranted, setPermissionsGranted] = React.useState(false);
  const checkPermissions = function () {
    const PERMISSIONS = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ];
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple(PERMISSIONS).then((results) => {
        const allPermissionsGranted = Object.values(results).every(
          (result) => result === 'granted',
        );
        if (allPermissionsGranted) {
          setPermissionsGranted(true);
        } else {
          checkPermissions();
        }
      });
    } else {
      setPermissionsGranted(true);
    }
  };
  return (
    <>
      <Text>{permissionsGranted ? '已授权' : '未授权'}</Text>
      <Button
        onPress={checkPermissions}
        title="点击授权"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
    </>
  );
};

export default Permission;
