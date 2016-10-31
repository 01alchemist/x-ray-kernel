/*global turbo, unsafe, xray, THREE*/
exports = {};
importScripts('../turbo-runtime.js', '../../../../node_modules/three/build/three.js');
importScripts('../../../../node_modules/three/examples/js/loaders/MTLLoader.js');
importScripts('../../../../node_modules/three/examples/js/loaders/OBJLoader.js');
importScripts('../src/worker/xray-tracer.js');

var Vector;

var LEADER = false;
var NUM_CPU = 8;
var CPU_available = 6;
var workerPool = [];
var WORKER_ID = null;
var numReady = 0;
var xTracer = null;

var flags = null;
var pixelMemory = null;
var sampleMemory = null;

var jobData = null;
var renderOptions = null;
var masterScene = null;

onmessage = (msg) => {

    switch (msg.data.command) {
        case "INIT":
            LEADER = msg.data.isLeader || false;
            let RAW_MEMORY = msg.data.buffer;
            turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);
            importScripts('../xray-kernel-turbo.js');

            Vector = xray.Vector;
            unsafe.RAW_MEMORY = RAW_MEMORY;

            if (LEADER) {
                WORKER_ID = 0;

                renderOptions = {
                    width: msg.data.width,
                    height: msg.data.height,
                    iterations: msg.data.iterations,
                    hitSamples: msg.data.hitSamples,
                    cameraSamples: msg.data.cameraSamples,
                    blockIterations: msg.data.blockIterations,
                    bounces: msg.data.bounces
                };

                flags = new Uint8Array(new SharedArrayBuffer(NUM_CPU));
                pixelMemory = new Uint8Array(new SharedArrayBuffer(this.width * this.height * 3));
                sampleMemory = new Float32Array(new SharedArrayBuffer(4 * this.width * this.height * 3));

                masterScene = new xray.MasterScene();
                camera = xray.Camera.LookAt(Vector.NewVector(0, 0, 0), Vector.NewVector(0, 0, 0), Vector.NewVector(0, 1, 0), 45);
                jobData = {
                    flagsBuffer:flags.buffer,
                    pixelBuffer:pixelMemory.buffer,
                    sampleBuffer:sampleMemory.buffer,
                    renderOptions:renderOptions,
                    scene:masterScene.scenePtr,
                    camera:camera
                };

                initTracer();

                /* spawn trace workers */
                console.time("Tracers initialized");
                for (let i = 0; i < CPU_available; i++) {
                    let id = i + 1;
                    let tracer = new Worker('thread.js?id=' + id);
                    tracer.onmessage = onTracerMessage.bind(this);
                    workerPool.push(tracer);
                    tracer.postMessage({
                            command: "INIT",
                            id: id,
                            isLeader: false,
                            jobData: jobData,
                            buffer: unsafe.RAW_MEMORY
                        },
                        [flags.buffer, pixelMemory.buffer, sampleMemory.buffer, unsafe.RAW_MEMORY]
                    );
                }
                console.log(`${workerPool.length} trace workers are ready`);
            } else {
                WORKER_ID = msg.data.id;
                initTracer(msg.data.jobData);
            }

            postMessage({event: "INITIALIZED", id: WORKER_ID});

            break;
        case "LOAD_MODEL":
            if (LEADER) {
                loadModel(msg.data.file);
            }
            break;
        case "TRACE":

            if(LEADER) {
                workerPool.forEach(function (tracer) {
                    tracer.postMessage({command: "TRACE", data:{width:64, height:64, xoffset:0, yoffset:0}});
                });
            }

            xTracer.trace();

            break;
    }

};

let id = location.search.split("=")[1];

postMessage({event: "BOOTED", id: id});

/* Internal */
function onTracerMessage(msg) {
    switch (msg.data.event) {
        case "BOOTED":
            //console.info(`Tracer ${msg.data.id} booted`);
            break;
        case "INITIALIZED":
            //console.info(`Tracer ${msg.data.id} initialized`);
            workerPool[msg.data.id - 1].ready = true;
            numReady++;
            if (numReady == 6) {
                console.timeEnd("Tracers initialized");
            }
            break;
        case "TRACE_COMPLETED":
            break;
        case "IDLE":
            break;
    }
}

function initTracer(data) {
    jobData = data;
    xTracer = new xRayTracer(data);
}

function loadModel(file) {
    var name = file;
    var folder = file + "/";

    // texture
    var manager = new THREE.LoadingManager();
    /*manager.onProgress = function (item, loaded, total) {
     console.log(item, loaded, total);
     };*/
    manager.onLoad = function () {
        //console.log(arguments);
    };

    var onProgress = function (xhr) {
        // if (xhr.lengthComputable) {
        //     var percentComplete = xhr.loaded / xhr.total * 100;
        //     console.log(Math.round(percentComplete) + '% downloaded of ' + Math.round(xhr.total / (1024 * 1024)));
        // }
    };

    var onError = function (xhr) {
    };

    //THREE.Loader.Handlers.add( /\.dds$/i, new THREE["DDSLoader"]() );
    var mtlLoader = new THREE["MTLLoader"](manager);
    mtlLoader.setPath('./models/' + folder);
    mtlLoader.load(name + '.mtl', function (materials) {
        var objLoader = new THREE["OBJLoader"]();
        objLoader.setMaterials(materials);
        objLoader.setPath('./models/' + folder);
        materials.preload();
        objLoader.load(name + '.obj', function (object) {
            // object.position.y = -95;
            object.scale.set(0.3, 0.3, 0.3);
            object.smooth = true;

            console.time("BufferGeometry::Create");
            xray.BufferGeometry.NewBufferGeometry(object, masterScene);
            masterScene.Commit();
            console.timeEnd("BufferGeometry::Create");
            postMessage({event: "MODEL_LOADED"});
        }, onProgress, onError);
    });
}
