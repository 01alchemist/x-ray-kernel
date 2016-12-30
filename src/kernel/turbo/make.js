// combine kernel modules and compile
"use strict";
var shell = require("shelljs");
let fs = require("fs");
let path = require("path");
let turbo = require("../../../../turbo.js/lib/compiler.js");
let compiler = new turbo.Compiler();
let modules = [
    "./src/turbo/common.tts",
    "./src/tracer/axis.tts",
    "./src/turbo/color.tts",
    "./src/turbo/vector.tts",
    "./src/utils/util.tts",
    "./src/turbo/box.tts",
    "./src/turbo/matrix.tts",
    "./src/turbo/texture.tts",
    "./src/turbo/material.tts",
    "./src/tracer/ray.tts",

    "./src/turbo/shapes/shape.tts",
    "./src/turbo/shapes/cube.tts",
    "./src/turbo/shapes/sphere.tts",
    "./src/turbo/shapes/triangle.tts",
    "./src/turbo/shapes/mesh.tts",

    "./src/turbo/tree.tts",
    "./src/tracer/hit.tts",
    "./src/turbo/camera.tts",
    "./src/turbo/scene.tts",
    "./src/three/buffer_geometry.tts",
    "./src/tracer/sampler.tts",

    "./src/tracer/vector3.tts",
    "./src/tracer/color3.tts",

];
var source = "//Turbo module\n";
modules.forEach((file) => {
    let content = fs.readFileSync(path.resolve(__dirname, file));
    source += content + "\n\n";
});
source += "\n";

fs.writeFileSync(path.resolve(__dirname, "xray-kernel-turbo.tts"), source);

compiler.compile({
    sources: [path.resolve(__dirname, "xray-kernel-turbo.tts")],
    options: {
        bundle: true,
        moduleName: "XRAY",
        outDir: __dirname,
        outFile: "xray-kernel-turbo.ts",
        target: turbo.CompilerTarget.TypeScript
    }
});

fs.unlinkSync(path.resolve(__dirname, "xray-kernel-turbo.tts"));


//Compile TypeScript
// let code = shell.exec('build-ts').code;
let typings = [
  './src/manual_types/simd.d.ts'
].join(' ');
let code = shell.exec(`tsc -p ./src/kernel/turbo/ -t ES5 -d -m commonjs --sourceMap`).code;
console.log(`child process exited with code ${code}`);
// if(code == 0){
    // let compiledCode = fs.readFileSync(__dirname + '/xray-kernel-turbo.js');
    // fs.writeFileSync(__dirname + '/../../../bin/xray-kernel-turbo.js', compiledCode);
    copyFile(__dirname + '/turbo-runtime.js', __dirname + '/../../../../x-ray.js/libs/xray-kernel/turbo-runtime.js');
    copyFile(__dirname + '/xray-kernel-turbo.ts', __dirname + '/../../../../x-ray.js/libs/xray-kernel/xray-kernel-turbo.ts');
    copyFile(__dirname + '/xray-kernel-turbo.js', __dirname + '/../../../../x-ray.js/libs/xray-kernel/xray-kernel-turbo.js');
// }


function copyFile(source, target, cb) {
    var cbCalled = false;

    console.log('#########################');
    console.log(target);
    console.log('#########################');

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        console.error(err);
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        console.error(err);
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled && cb) {
            cb(err);
            cbCalled = true;
        }
    }
}