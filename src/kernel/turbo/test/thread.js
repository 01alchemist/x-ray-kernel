exports = {};
importScripts('../turbo-runtime.js');

onmessage = (msg) => {
    console.log(msg);
    let RAW_MEMORY = msg.data;
    turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);
    importScripts('../xray-kernel-turbo.js');
    unsafe.RAW_MEMORY = RAW_MEMORY;
};

postMessage("INITED");