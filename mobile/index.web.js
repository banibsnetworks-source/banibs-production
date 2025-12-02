/**
 * BANIBS Mobile Web Entry Point
 * React Native Web Configuration
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Register the app for web
AppRegistry.registerComponent(appName, () => App);

// Run the app in the root element
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
