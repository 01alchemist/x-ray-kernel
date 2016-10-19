// combine kernel modules and compile
"use strict";
let fs = require("fs");
let path = require("path");
let turbo = require("../../../../turbo.js/lib/compiler.js");
let compiler = new turbo.Compiler();
let modules = [
    "./src/common.tts",
    "./src/color.tts"
];
var source = "//Turbo module\n";
modules.forEach((file) => {
    var content = fs.readFileSync(path.resolve(__dirname, file));
    source += content + "\n\n";
});
source += "\n";

fs.writeFileSync(path.resolve(__dirname, "xray-kernel-turbo.tts"), source);

compiler.compile({
    sources: [path.resolve(__dirname, "xray-kernel-turbo.tts")],
    options:{
        bundle:true,
        outDir: __dirname,
        outFile: "xray-kernel-turbo.ts",
        target:turbo.CompilerTarget.TypeScript
    }
});

fs.unlinkSync(path.resolve(__dirname, "xray-kernel-turbo.tts"));


//Compile TypeScript
/*const spawn = require('child_process').spawn;
const ls = spawn('tsc', [
    __dirname + '/xray-kernel-turbo.ts',
    '--target', 'es5',
    '--module', 'commonjs',
    '--sourceMap'
]);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});*/
