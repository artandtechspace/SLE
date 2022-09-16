const path = require("path");
const fs = require("fs-extra");
const cp = require("child_process");

module.exports = env => {
    // Checks if compiling in production or development mode
    var isProd = env.production === true;
    var resolveDir = isProd ? "build-prod" : "build-dev";

    // Build-path
    const outPath = path.resolve(__dirname, `build/${resolveDir}/`);
    // Source-path
    const inPath = path.resolve(__dirname, "src/");

    console.log("Compiling in mode "+(isProd ? "production" : "development"));
    
    console.log("...Removing previous build");
    // Removes the previous build (If it existed)
    if(fs.existsSync(outPath))
        fs.rmSync(outPath, { recursive: true, force: true });

    // Creates the directory
    fs.mkdirSync(outPath,{
        recursive: true
    });

    console.log("...Transpiling scss to css");
    // Compiles the scss
    cp.spawnSync("node-sass", ["--include-path", "scss", `${inPath}/styles/Main.scss`, `${outPath}/resources/main.css`]);
    
    console.log("...Copying resources");
    // Copys resources
    fs.copySync(`${inPath}/resources/`, `${outPath}/resources/`);

    // Copys the electron-dependencys
    fs.copySync(`${inPath}/electron/index.js`, `${outPath}/setup/index.js`);

    // Copys the index.html file
    fs.copySync(`${inPath}/index.html`, `${outPath}/index.html`);
    
    console.log("...Compiling typescript into a single js file");
    // Packages the typescript-app
    return {
        mode: isProd ? "production" : "development",
        entry: `${inPath}/application/Appentry.ts`,
        output: {
            path: outPath,   
            filename: "webapp.js"
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        }
    }
}