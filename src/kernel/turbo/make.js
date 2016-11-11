// combine kernel modules and compile
"use strict";
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
    "./src/turbo/shapes/plane.tts",

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
    options:{
        bundle:true,
        moduleName:"xray",
        outDir: __dirname,
        outFile: "xray-kernel-turbo.ts",
        target:turbo.CompilerTarget.TypeScript
    }
});

fs.unlinkSync(path.resolve(__dirname, "xray-kernel-turbo.tts"));


//Compile TypeScript
// const spawn = require('child_process').spawn;
// const ls = spawn('tsc', [
//     // __dirname + '/xray-kernel-turbo.ts',
//     '-p', __dirname,
//     '--target', 'es5',
//     '--module', 'commonjs',
//     '--sourceMap'
// ]);
//
// ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
// });
