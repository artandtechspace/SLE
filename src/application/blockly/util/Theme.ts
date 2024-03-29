const Blockly = require("blockly");

/**
 * Dark theme.
 */
 export default Blockly.Theme.defineTheme('sle_dark', {
    'base': Blockly.Themes.Classic,
    'componentStyles': {
      'workspaceBackgroundColour': '#1e1e1e',
      'toolboxBackgroundColour': 'blackBackground',
      'toolboxForegroundColour': '#fff',
      'flyoutBackgroundColour': '#252526',
      'flyoutForegroundColour': '#ccc',
      'flyoutOpacity': 1,
      'scrollbarColour': '#797979',
      'insertionMarkerColour': '#fff',
      'insertionMarkerOpacity': 0.3,
      'scrollbarOpacity': 0.4,
      'cursorColour': '#d0d0d0',
      'blackBackground': '#333'
    },
    'startHats': true  
  });