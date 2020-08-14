import 'react-native-gesture-handler';
import {LogBox} from 'react-native';

/**
 * 去除警告⚠️
 */
const IGNORED_WARNINGS = [
  '`-[RCTRootView cancelTouches]`',
  'Please update the following components: AnimatedComponent',
  'react-native-update',
  'Require cycle',
];
const oldConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    IGNORED_WARNINGS.some((ignoredWarning) =>
      args[0].startsWith(ignoredWarning),
    )
  ) {
    return;
  }
  return oldConsoleWarn(...args);
};
LogBox.ignoreLogs(IGNORED_WARNINGS);
