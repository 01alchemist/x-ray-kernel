/*global turbo, unsafe, xray, THREE*/
exports = {};
importScripts('../turbo-runtime.js', '../../../../node_modules/three/build/three.js');
importScripts('../../../../node_modules/three/examples/js/loaders/MTLLoader.js');
importScripts('../../../../node_modules/three/examples/js/loaders/OBJLoader.js');

var WORKER_ID = parseInt(location.search.split("=")[1]);
var xTracer = null;

var flagBuffer = null;
var pixelBuffer = null;
var sampleBuffer = null;

var renderData = null;

onmessage = (msg) => {

    switch (msg.data.command) {
        default:
        case "INIT_MEMORY":
            let RAW_MEMORY = msg.data.buffer;
            flagBuffer = msg.data.flagBuffer;
            pixelBuffer = msg.data.pixelBuffer;
            sampleBuffer = msg.data.sampleBuffer;

            turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);
            importScripts('../xray-kernel-turbo.js');
            importScripts('../src/worker/xray-tracer.js');
            unsafe.RAW_MEMORY = RAW_MEMORY;
            postMessage({event: "MEMORY_INITIALIZED", id: WORKER_ID});
            break;
        case "INIT":
            renderData = {
                traceData:msg.data.traceData,
                flagBuffer:flagBuffer,
                pixelBuffer:pixelBuffer,
                sampleBuffer:sampleBuffer
            };
            xTracer = new xRayTracer(renderData);

            postMessage({event: "INITIALIZED", id: WORKER_ID});

            break;

        case "TRACE":

            xTracer.trace(msg.data.jobData);

            break;
    }

};

postMessage({event: "BOOTED", id: WORKER_ID});
