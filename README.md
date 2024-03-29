# Very much unfinished
This project is in it's very early development phase and not recommended to be used on a wide scale level currently. But if you want, you can still check our it's code or just give it a compile and run.

# What is this project?
This project aims to provide a way for non-developers (or developers who just don't want to write a whole bunch of led-code, every time something changes) to auto-generate cpp-arduino or arduino-board like code for accessing WS2812B-Led stripes using an interactive UI.

Using pre-programmed modules in form of blockly-blocks the user can then select certain animations, customize their settings and then generate the code for his microcontroller.

When the pasting the generated code into an IDE ie. the [arduino-ide](https://www.arduino.cc/en/software) and when having the required libraries (eg. fastled) installed, it should just compile directly and be able to be uploaded into the chip.

You can view the web-version [here](https://artandtechspace.github.io/SLE/)

## Advantages and disadvantages

This way of doing it has a few advantages:

1. By not generating assembly code we can ensure that it's an easy and therefor fast process to create new animations and modules (Ensuring ongoing development)
2. By not writing assembly for the mc's ourselfs we can program for almost any microprocessor that the fastled-library support (Which are quite a lot) and this way the tool can be used for multiple applications (As long as it's still c++).

But obviously there are some disadvantages to this approach to:
1. A developer can always write more efficient code than the tool can as there are just a lot of edge cases.
2. The code from the tool is almost always quite unreadable because a lot of calulations that are maybe just required for some edge-cases are not resolved and are left to the compiler to calculate. Meaning the code is mostly unreadable.

# Other contributers

|Name|Contribution|
|-|-|
|Fabian von der Heiden|For making this great SLE-Icon / preview-image|

# Dependencies

In it's current state the project uses the following dependencies:

|Name|Description|
|-|-|
|[FastLED-Library](https://www.arduino.cc/reference/en/libraries/fastled/)|As descried above the tool relays on the fastled-library to be installed to function.|
|[Blockly](https://developers.google.cn/blockly/)|To provide a user-friendly and easy experiance this tool uses blockly as a configuration system for the animations|
|[Typescript](https://www.typescriptlang.org/)|Just the programming lang|
|[Electron](https://www.electronjs.org/)|For the desktop|
|[Sass/Scss](https://sass-lang.com/)|Just because|
|[Webpack](https://webpack.js.org/)|To package the typescript into a single file|
|[NodeJs (fs-extra)](https://www.npmjs.com/package/fs-extra)|Also for packaging and compiling the project|
|[Electron-Forge](https://www.electronforge.io/)|For exporting the software into installable apps|
|[Split.js](https://split.js.org/)|Used to create interactive split-panels like between the blockly workspace and the preview.|


## How to setup

Clone the repository and run
```bash
npm i
```
to install all dependencies. Then run
```bash
npm start
```
to "compile" and run the application in developer mode using electron.

# How the software runs
The point of entry for the electron app is `src/electron/index.js` which, using electron, creates a window that loads the webpage `src/index.html` and integration script `src/resources/script.js` for the main application.

Said main application is written in typescript and lives under `src/application/` with `Appentry.ts` and the function `onAppInitalize` being the main point of entry once run with electron. This will be compiled into a bundled javascript file `webapp.js` that will be loaded by the `src/index.html` file.

Styling and resources live inside the `src/styles` and `src/resources` folders and will also later be "compiled" into the build.

Using the `builddev` or just the `start` script with npm, a separate folder called `build` will be created that contains all those compiled files. When interested on the exact process, checkout the `webpack.config.js` file.

## The npm-scripts
There are a couple of npm-scripts defined here is what they do:

To build/compile to software into a state that can be executed, run one of the commands below (either for production or development)
```
npm run buildDev # For the development build
npm run buildProd # For the production build
```

After you have build/compiled your build run again one of the commands below to start that build using electron

```
npm run runDev # For the development build
npm run runProd # For the production build
```

The `npm start` script builds/compiles the development build and also directly runs it.

# Exporting the software

Before exporting the software into production mode, make sure to set the `IS_DEBUG` boolean to `false` inside the `src/application/Preset.ts`.

Note: There is currently no auto-updater as the software is in a very early alpha.

To package the software for your current operating system do the following:

1. Make sure you have compiled production-build
```
npm run buildProd
```

2. Make sure that that production-build is able to run
```
npm run runProd
```

3. Package that build for your operating system
```
npm run packageProd
```

A new folder `out/` should be generated. It contains all binary's that got generated.
On Linux this should generate a `.deb` and a `.rpm` file for debian and red-hat based distros.
On Windows it should spit out a `.exe` that is used to install the software.

An export for apple/ios has not been tested yet.
