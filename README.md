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