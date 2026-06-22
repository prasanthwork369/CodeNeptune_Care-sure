import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Cannot record touch end without a touch start',
  '`setPositionAsync` is not supported with edge-to-edge enabled.',
  '`setBackgroundColorAsync` is not supported with edge-to-edge enabled.',
  'Looks like you have configured linking in multiple places.',
]);
