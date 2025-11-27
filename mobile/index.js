/**
 * BANIBS Mobile App Entry Point
 * Phase M1 - Mobile Shell Foundation
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
