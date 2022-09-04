# Very much unfinished
This project is in it's very early development phase and not recommended to use on a wide scale level currently. But if you want, you can still check our it's code or just give it a compile and run.

# What is this project?
This project aims to provide a way for non-developers (or developers who just don't want to write a whole bunch of led-code, every time something changes) to auto-generate cpp-arduino or arduino-board like code for accessing WS2812B-Led stripes using an interactive UI.

Using pre-programmed modules in form of blockly-blocks the user can then select certain animations, customize their settings and then generate the code for his microcontroller.

When the pasting the generated code into an IDE ie. the [arduino-ide](https://www.arduino.cc/en/software) and when having the required libraries (eg. fastled) installed, it should just compile directly and be able to be uploaded into the chip.

## Advantages and disadvantages

This way of doing it has a few advantages:

1. By not generating assembly code we can ensure that it's an easy and therefor fast process to create new animations and modules (Ensuring ongoing development)
2. By not writing assembly for the mc's ourselfs we can program for almost any microprocessor that the fastled-library support (Which are quite a lot) and this way the tool can be used for multiple applications (As long as it's still c++).

But obviously there are some disadvantages to this approach to:
1. A developer can always write more efficient code than the tool can as there are just a lot of edge cases.
2. The code from the tool is almost always quite unreadable because a lot of calulations that are maybe just required for some edge-cases are not resolved and are left to the compiler to calculate. Meaning the code is mostly unreadable.

# Dependencies

In it's current state the project uses the following dependencies:

|Name|Description|
|-|-|
|[FastLED-Library](https://www.arduino.cc/reference/en/libraries/fastled/)|As descried above the tool relays on the fastled-library to be installed to function.|
|[Blockly](https://developers.google.cn/blockly/)|To provide a user-friendly and easy experiance this tool uses blockly as a configuration system for the animations|
|[Typescript](https://www.typescriptlang.org/)|Just the programming lang|
|[Electron](https://www.electronjs.org/)|For the desktop|
|[Sass/Scss](https://sass-lang.com/)|Just because|

## How to setup

Clone the repository and run
```bash
npm i
```
to install all dependencies. Then run
```bash
npm start
```
to "compile" and run the application using electron.

### Node to windows users
The tool is mainly developed on linux.
So if you want to set it up on windows, go into the `package.json` file and change the lines with the `runElectron`- and `compileElectron`-scripts to not call `<file>.sh` but instead `<file>.cmd`.

This must be done before starting the setup.

Until we eventually add webpack or some other management system for this, consider it a temporary fix.

# How the software runs
The point of entry for the electron app is `src/electron/index.js` which, using electron, creates a window that loads the webpage `src/index.html` and integration script `src/resources/script.js` for the main application.

Said main application is written in typescript and lives under `src/application/` with `Appentry.ts` and the function `onAppInitalize` being the main point of entry once run with electron.

Styling and resources live inside the `src/styles` and `src/resources` folders and will also later be "compiled" into the build.

Using the `compileElectron` or just the `start` script with npm, a separate folder called `build` will be created that contains all those compiled files. When interested on the exact process, checkout the `scripts/` files with similar names to it's npm-script counterparts.

# Note on Exporting the software
This section will be rewritten once an export-routine has been properly setup, howevery.
Make sure to turn the `IS_DEBUG` boolean to false inside the `src/application/Preset.tx`.