// combine kernel modules and compile 
"use strict";
let shell = require("shelljs");
let fs = require("fs");
let path = require("path");
// let modules = [ //     "./src/turbo/common.tts", //     "./src/tracer/axis.tts", //     "./src/turbo/color.tts", //     "./src/turbo/vector.tts", //     "./src/utils/util.tts", //     "./src/turbo/box.tts", //     "./src/turbo/matrix.tts", //     "./src/turbo/image.tts", //     "./src/turbo/texture.tts", //     "./src/turbo/material.tts", //     "./src/tracer/ray.tts", // //     "./src/turbo/shapes/shape.tts", //     "./src/turbo/shapes/cube.tts", //     "./src/turbo/shapes/sphere.tts", //     "./src/turbo/shapes/triangle.tts", //     "./src/turbo/shapes/mesh.tts", // //     "./src/turbo/tree.tts", //     "./src/tracer/hit.tts", //     "./src/turbo/camera.tts", //     "./src/turbo/scene.tts", //     "./src/three/buffer_geometry.tts", //     "./src/tracer/sampler.tts", // //     "./src/tracer/vector3.tts", //     "./src/tracer/color3.tts", //     "./src/tracer/matrix4.tts", // // ];
let modules = ["./src/turbo/vector.tbs"];
let buildCommand = "";
modules.forEach((file) => {
    buildCommand += path.resolve(__dirname, file) + " ";
});
let outFile = path.resolve(__dirname, "xray-kernel-turbo.asm.js");
buildCommand += " --turbo-asm --out " + outFile;
let compilerShell = "../TurboScript/lib/tc.js";
let code = shell.exec(`node ${compilerShell} ${buildCommand}`).code;

console.log(`child process exited with code ${code}`);

function copyFile(source, target, cb) {
    let cbCalled = false;
    console.log('#########################');
    console.log(target);
    console.log('#########################');
    let rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        console.error(err);
        done(err);
    });
    let wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        console.error(err);
        done(err);
    });
    wr.on("close", function (ex) {
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
