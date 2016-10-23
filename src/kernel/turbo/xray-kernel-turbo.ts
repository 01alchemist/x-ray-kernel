//turbo.js bundle
/**
 * Created by Nidin Vinayakan on 6/13/2016.
 */
var Atomics:any = window["Atomics"];
var SharedArrayBuffer:any = window["SharedArrayBuffer"];
if (typeof "Atomics" == "undefined") {
    window["Atomics"] = {
        load: function () {
            throw "No Atomics";
        },
        store: function () {
            throw "No Atomics";
        },
        add: function () {
            throw "No Atomics";
        },
        sub: function () {
            throw "No Atomics";
        },
        and: function () {
            throw "No Atomics";
        },
        or: function () {
            throw "No Atomics";
        },
        xor: function () {
            throw "No Atomics";
        },
        compareExchange: function () {
            throw "No Atomics";
        }
    };
}

function MemoryError(msg) {
    this.message = msg;
}

MemoryError.prototype = new Error("Memory Error");

export class RuntimeConstructor {

    NULL = 0;
    int8 = {SIZE: 1, ALIGN: 1, NAME: "int8"};
    uint8 = {SIZE: 1, ALIGN: 1, NAME: "uint8"};
    int16 = {SIZE: 2, ALIGN: 2, NAME: "int16"};
    uint16 = {SIZE: 2, ALIGN: 2, NAME: "uint16"};
    int32 = {SIZE: 4, ALIGN: 4, NAME: "int32"};
    uint32 = {SIZE: 4, ALIGN: 4, NAME: "uint32"};
    float32 = {SIZE: 4, ALIGN: 4, NAME: "float32"};
    float64 = {SIZE: 8, ALIGN: 8, NAME: "float64"};
    int32x4 = {SIZE: 16, ALIGN: 16, NAME: "int32x4"};
    float32x4 = {SIZE: 16, ALIGN: 16, NAME: "float32x4"};
    float64x2 = {SIZE: 16, ALIGN: 16, NAME: "float64x2"};

    _mem_int8 = null;
    _mem_uint8 = null;
    _mem_int16 = null;
    _mem_uint16 = null;
    _mem_int32 = null;
    _mem_uint32 = null;
    _mem_float32 = null;
    _mem_float64 = null;


    _now = (typeof 'performance' != 'undefined' && typeof performance.now == 'function' ?
        performance.now.bind(performance) :
        Date.now.bind(Date));

    // Map of class type IDs to type objects.

    _idToType:any = {};
    /*
     * Initialize the local Turbo instance.
     *
     * "buffer" can be an ArrayBuffer or SharedArrayBuffer.  In the
     * latter case, all workers must pass the same buffer during
     * initialization.
     *
     * The buffer must be zero-initialized before being passed to
     * init().  Turbo assumes ownership of the buffer, client code
     * should not access it directly after using it to initialize
     * the heap.
     *
     * "start" must be a valid offset within the buffer, it is the
     * first byte that may be used.
     *
     * "limit" must be a valid offset within the buffer, limit-1 is
     * the last byte that may be used.
     *
     * "initialize" must be true in exactly one agent and that call
     * must return before any agent can call any other methods on
     * their local Turbo objects.  Normally, you would allocate your
     * memory in the main thread, call Turbo.init(buffer, true) in
     * the main thread, and then distribute the buffer to workers.
     */
    init(buffer, start, limit, initialize) {
        if (arguments.length < 3) {
            throw new Error("Required arguments: buffer, start, limit");
        }

        if ((start | 0) != start || (limit | 0) != limit) {
            throw new Error("Invalid bounds: " + start + " " + limit);
        }

        start = (start + 7) & ~7;
        limit = (limit & ~7);

        if (start < 0 || limit <= start || limit > buffer.byteLength) {
            throw new Error("Invalid bounds: " + start + " " + limit);
        }

        var len = (limit - start);

        if (len < 16) {
            throw new Error("The memory is too small even for metadata");
        }

        if (buffer instanceof ArrayBuffer) {
            this.alloc = alloc_ab;
        } else if (buffer instanceof SharedArrayBuffer) {
            this.alloc = alloc_sab;
        } else {
            throw new Error("Turbo can be initialized only on SharedArrayBuffer or ArrayBuffer");
        }

        this._mem_int8 = new Int8Array(buffer, start, len);
        this._mem_uint8 = new Uint8Array(buffer, start, len);
        this._mem_int16 = new Int16Array(buffer, start, len / 2);
        this._mem_uint16 = new Uint16Array(buffer, start, len / 2);
        this._mem_int32 = new Int32Array(buffer, start, len / 4);
        this._mem_uint32 = new Uint32Array(buffer, start, len / 4);
        this._mem_float32 = new Float32Array(buffer, start, len / 4);
        this._mem_float64 = new Float64Array(buffer, start, len / 8);

        if (initialize) {
            this._mem_int32[2] = len;
            if (buffer instanceof ArrayBuffer) {
                this._mem_int32[1] = 16;
            } else if (buffer instanceof SharedArrayBuffer) {
                Atomics.store(this._mem_int32, 1, 16);
            }
        }
    }

    /*
     * Given a nonnegative size in bytes and a nonnegative
     * power-of-two alignment, allocate and zero-initialize an object
     * of the necessary size (or larger) and required alignment, and
     * return its address.
     *
     * Return NULL if no memory is available.
     */
    alloc(nbytes, alignment):number {
        // Overridden during initialization.
        throw new Error("Not initialized");
    }

    /*
     * Ditto, but throw if no memory is available.
     *
     * Interesting possibility is to avoid this function
     * and instead move the test into each initInstance().
     */
    allocOrThrow(nbytes, alignment) {
        var p = this.alloc(nbytes, alignment);
        if (p == 0)
            throw new MemoryError("Out of memory");
        return p;
    }

    /*
     * Given a pointer returned from alloc or calloc, free the memory.
     * p may be NULL in which case the call does nothing.
     */
    free(p) {
        // Drop it on the floor, for now
        // In the future: figure out the size from the header or other info,
        // add to free list, etc etc.
    }

    /*
     * Given an pointer to a class instance, return its type object.
     * Return null if no type object is found.
     */
    identify(p) {
        if (p == 0)
            return null;
        if (this._idToType.hasOwnProperty(this._mem_int32[p >> 2]))
            return this._idToType[this._mem_int32[p >> 2]];
        return null;
    }

    _badType(self) {
        var t = this.identify(self);
        return new Error("Observed type: " + (t ? t.NAME : "*invalid*") + ", address=" + self);
    }

    // Synchronic layout is 8 bytes (2 x int32) of metadata followed by
    // the type-specific payload.  The two int32 words are the number
    // of waiters and the wait word (generation count).
    //
    // In the following:
    //
    // self is the base address for the Synchronic.
    // mem is the array to use for the value
    // idx is the index in mem of the value: (p+8)>>log2(mem.BYTES_PER_ELEMENT)
    //
    // _synchronicLoad is just Atomics.load, expand it in-line.

    _synchronicStore(self, mem, idx, value) {
        Atomics.store(mem, idx, value);
        this._notify(self);
        return value;
    }

    _synchronicCompareExchange(self, mem, idx, oldval, newval) {
        var v = Atomics.compareExchange(mem, idx, oldval, newval);
        if (v == oldval)
            this._notify(self);
        return v;
    }

    _synchronicAdd(self, mem, idx, value) {
        var v = Atomics.add(mem, idx, value);
        this._notify(self);
        return v;
    }

    _synchronicSub(self, mem, idx, value) {
        var v = Atomics.sub(mem, idx, value);
        this._notify(self);
        return v;
    }

    _synchronicAnd(self, mem, idx, value) {
        var v = Atomics.and(mem, idx, value);
        this._notify(self);
        return v;
    }

    _synchronicOr(self, mem, idx, value) {
        var v = Atomics.or(mem, idx, value);
        this._notify(self);
        return v;
    }

    _synchronicXor(self, mem, idx, value) {
        var v = Atomics.xor(mem, idx, value);
        this._notify(self);
        return v;
    }

    _synchronicLoadWhenNotEqual(self, mem, idx, value) {
        for (; ;) {
            var tag = Atomics.load(this._mem_int32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v !== value)
                break;
            this._waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
        }
        return v;
    }

    _synchronicLoadWhenEqual(self, mem, idx, value) {
        for (; ;) {
            var tag = Atomics.load(this._mem_int32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v === value)
                break;
            this._waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
        }
        return v;
    }

    _synchronicExpectUpdate(self, mem, idx, value, timeout) {
        var now = this._now();
        var limit = now + timeout;
        for (; ;) {
            var tag = Atomics.load(this._mem_int32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v !== value || now >= limit)
                break;
            this._waitForUpdate(self, tag, limit - now);
            now = this._now();
        }
    }

    _waitForUpdate(self, tag, timeout) {
        // Spin for a short time before going into the futexWait.
        //
        // Hard to know what a good count should be - it is machine
        // dependent, for sure, and "typical" applications should
        // influence the choice.  If the count is high without
        // hindering an eventual drop into futexWait then it will just
        // decrease performance.  If the count is low it is pointless.
        // (This is why Synchronic really wants a native implementation.)
        //
        // Data points from a 2.6GHz i7 MacBook Pro:
        //
        // - the simple send-integer benchmark (test-sendint.html),
        //   which is the very simplest case we can really imagine,
        //   gets noisy timings with an iteration count below 4000
        //
        // - the simple send-object benchmark (test-sendmsg.html)
        //   gets a boost when the count is at least 10000
        //
        // 10000 is perhaps 5us (CPI=1, naive) and seems like a
        // reasonable cutoff, for now - but note, it is reasonable FOR
        // THIS SYSTEM ONLY, which is a big flaw.
        //
        // The better fix might well be to add some kind of spin/nanosleep
        // functionality to futexWait, see https://bugzil.la/1134973.
        // That functionality can be platform-dependent and even
        // adaptive, with JIT support.
        var i = 10000;
        do {
            // May want this to be a relaxed load, though on x86 it won't matter.
            if (Atomics.load(this._mem_int32, (self + 4) >> 2) != tag)
                return;
        } while (--i > 0);
        Atomics.add(this._mem_int32, self >> 2, 1);
        Atomics.futexWait(this._mem_int32, (self + 4) >> 2, tag, timeout);
        Atomics.sub(this._mem_int32, self >> 2, 1);
    }

    _notify(self) {
        Atomics.add(this._mem_int32, (self + 4) >> 2, 1);
        // Would it be appropriate & better to wake n waiters, where n
        // is the number loaded in the load()?  I almost think so,
        // since our futexes are fair.
        if (Atomics.load(this._mem_int32, self >> 2) > 0)
            Atomics.futexWake(this._mem_int32, (self + 4) >> 2, Number.POSITIVE_INFINITY);
    }
}

export var turbo = {
    Runtime: new RuntimeConstructor()
};

window["turbo"] = turbo;

// For allocators: Do not round up nbytes, for now.  References to
// fields within structures can be to odd addresses and there's no
// particular reason that an object can't be allocated on an odd
// address.  (Later, with a header or similar info, it will be
// different.)

// Note, actual zero-initialization is not currently necessary
// since the buffer must be zero-initialized by the client code
// and this is a simple bump allocator.

function alloc_sab(nbytes, alignment) {
    do {
        var p = Atomics.load(this._mem_int32, 1);
        var q = (p + (alignment - 1)) & ~(alignment - 1);
        var top = q + nbytes;
        if (top >= this._mem_int32[2])
            return 0;
    } while (Atomics.compareExchange(this._mem_int32, 1, p, top) != p);
    return q;
}

function alloc_ab(nbytes, alignment) {
    var p = this._mem_int32[1];
    p = (p + (alignment - 1)) & ~(alignment - 1);
    var top = p + nbytes;
    if (top >= this._mem_int32[2])
        return 0;
    this._mem_int32[1] = top;
    return p;
}



class MemoryObject {

   private _pointer:number;

   get pointer():number { return this._pointer; };

   constructor(p:number){
       this._pointer = (p | 0);
   }
}

// Generated from /Users/d437814/workspace/x-ray-kernel/src/kernel/turbo/xray-kernel-turbo.tts by turbo.js 1.0.0; github.com/01alchemist/turbo.js

//Turbo module
type float32 = number;
type float64 = number;


const height:number = 600;
const width:number = 800;
const RAW_MEMORY:ArrayBuffer = new SharedArrayBuffer(height * width * 4 + 65536);
turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);

const shadows:boolean = true;		// Compute object shadows
const reflection:boolean = true;	// Compute object reflections
const reflection_depth:number = 2;
const antialias:boolean = false; // true;		// Antialias the image (expensive but pretty)

const debug:boolean = false;		// Progress printout, may confuse the consumer

const INF:number = 1e9;
const EPS:number = 1e-9;
const SENTINEL:number = 1e32;

function xy(x:number, y:number) {
    return {X: x, Y: y};
}
function xyz(x:number, y:number, z:number) {
    return {X: x, Y: y, Z: z};
}
function xyzw(x:number, y:number, z:number, w:number) {
    return {X: x, Y: y, Z: z, W: w};
}
function F3(a:number, b:number, c:number) {
    return {A: a, B: b, C: c};
}
function rgb(r:number, g:number, b:number) {
    return {R: r, G: g, B: b};
}
function ray(origin:number, direction:number) {
    return {Origin: origin, Direction: direction};
}

// const black = DL3(0,0,0);

// function add(a, b) { return DL3(a.x+b.x, a.y+b.y, a.z+b.z); }
// function addi(a, c) { return DL3(a.x+c, a.y+c, a.z+c); }
// function sub(a, b) { return DL3(a.x-b.x, a.y-b.y, a.z-b.z); }
// function subi(a, c) { return DL3(a.x-c, a.y-c, a.z-c); }
// function muli(a, c) { return DL3(a.x*c, a.y*c, a.z*c); }
// function divi(a, c) { return DL3(a.x/c, a.y/c, a.z/c); }
// function neg(a) { return DL3(-a.x, -a.y, -a.z); }
// function length(a) { return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z); }
// function normalize(a) { var d = length(a); return DL3(a.x/d, a.y/d, a.z/d); }
// function cross(a, b) { return DL3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x); }
// function dot(a, b) { return a.x*b.x + a.y*b.y + a.z*b.z; }

function fract(f) {
    return f - Math.floor(f);
}
function fract_add1(f) {
    let f1 = f - Math.floor(f);
    return f1 - Math.floor(f1 + 1);
}
function clampInt(x, lo, hi) {
    if (x < lo) {
        return lo;
    }
    if (x > hi) {
        return hi;
    }
    return x;
}
function len(ptr, T) {

}

type RGBA  = {
    R:number,
    G:number,
    B:number,
    A:number
};
type RGB = {
    R:number,
    G:number,
    B:number
};

export class Color extends MemoryObject{
   static NAME:string = "Color";
   static SIZE:number = 32;
   static ALIGN:number = 8;
   static CLSID:number = 194603;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, color = {R:0,G:0,B:0}):number {
		 turbo.Runtime._mem_float64[(SELF + 8) >> 3] = (color.R); 
		 turbo.Runtime._mem_float64[(SELF + 16) >> 3] = (color.G); 
		 turbo.Runtime._mem_float64[(SELF + 24) >> 3] = (color.B); 
		return SELF;
	}

    static Init_mem(SELF:number, R:number = 0,G:number = 0,B:number = 0):number {
		 turbo.Runtime._mem_float64[(SELF + 8) >> 3] = R; 
		 turbo.Runtime._mem_float64[(SELF + 16) >> 3] = G; 
		 turbo.Runtime._mem_float64[(SELF + 24) >> 3] = B; 
		return SELF;
	}

    static NewColor(color?):number {
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Color.init(ptr, color);
    }
    
	static HexColor(hex:number):number {
		let R = ((hex >> 16) & 255 ) / 255;
		let G = ((hex >> 8) & 255) / 255;
		let B = (hex & 255) / 255;
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
		return Color.Pow_mem(Color.Init_mem(ptr, R, G, B), 2.2);
	}

    static Kelvin(K:number):number {
        var red:number;
        var green:number;
        var blue:number;
        // red
        if(K >= 6600){
            var A = 351.97690566805693;
            var B = 0.114206453784165;
            var c = -40.25366309332127;
            var x = K/100 - 55;
            red = A + B*x + c*Math.log(x)
        } else {
            red = 255;
        }
        // green
        if(K >= 6600){
            A = 325.4494125711974;
            B = 0.07943456536662342;
            c = -28.0852963507957;
            x = K/100 - 50;
            green = A + B*x + c*Math.log(x)
        } else if (K >= 1000) {
            A = -155.25485562709179;
            B = -0.44596950469579133;
            c = 104.49216199393888;
            x = K/100 - 2;
            green = A + B*x + c*Math.log(x)
        } else {
            green = 0
        }
        // blue
        if (K >= 6600) {
            blue = 255
        } else if (K >= 2000) {
            A = -254.76935184120902;
            B = 0.8274096064007395;
            c = 115.67994401066147;
            x = K/100 - 10;
            blue = A + B*x + c*Math.log(x)
        } else {
            blue = 0
        }
        red = Math.min(1, red/255);
        green = Math.min(1, green/255);
        blue = Math.min(1, blue/255);
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Color.Init_mem(ptr, red, green, blue);
    }

    static FloatRGBA(SELF:number):RGBA {
        return {
            R: turbo.Runtime._mem_float64[(SELF + 8) >> 3],
            G: turbo.Runtime._mem_float64[(SELF + 16) >> 3],
            B: turbo.Runtime._mem_float64[(SELF + 24) >> 3],
            A: 1.0
        };
    }

    static RGBA(SELF:number):RGBA {
        let _d:Uint8ClampedArray = new Uint8ClampedArray([
            turbo.Runtime._mem_float64[(SELF + 8) >> 3] * 255,
            turbo.Runtime._mem_float64[(SELF + 16) >> 3] * 255,
            turbo.Runtime._mem_float64[(SELF + 24) >> 3] * 255
        ]);
        return {
            R: _d[0],
            G: _d[1],
            B: _d[2],
            A: 255
        };
    }

    static RGBA64(SELF:number):RGBA {
        return {
            R: Math.round(Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 8) >> 3] * 65535))),
            G: Math.round(Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 16) >> 3] * 65535))),
            B: Math.round(Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 24) >> 3] * 65535))),
            A: 65535
        };
    }
    
    static Add(A:RGBA, B:RGBA):RGB { return rgb(A.R + B.R, A.G + B.G, A.B + B.B); }

    /**
     *
     * @param A Color 1
     * @param B Color 2
     * @param C result Color
     * @returns {number}
     * @constructor
     */
    static Add_mem(A:number, B:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[(A + 8) >> 3] + turbo.Runtime._mem_float64[(B + 8) >> 3];
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[(A + 16) >> 3] + turbo.Runtime._mem_float64[(B + 16) >> 3];
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[(A + 24) >> 3] + turbo.Runtime._mem_float64[(B + 24) >> 3];
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(A + 8) >> 3] + turbo.Runtime._mem_float64[(B + 8) >> 3],
                turbo.Runtime._mem_float64[(A + 16) >> 3] + turbo.Runtime._mem_float64[(B + 16) >> 3],
                turbo.Runtime._mem_float64[(A + 24) >> 3] + turbo.Runtime._mem_float64[(B + 24) >> 3]
            );
        }
    }

    static Sub(A:RGBA, B:RGBA):RGB { return rgb(A.R - B.R, A.G - B.G, A.B - B.B); }
    static Sub_mem(A:number, B:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[(A + 8) >> 3] - turbo.Runtime._mem_float64[(B + 8) >> 3];
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[(A + 16) >> 3] - turbo.Runtime._mem_float64[(B + 16) >> 3];
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[(A + 24) >> 3] - turbo.Runtime._mem_float64[(B + 24) >> 3];
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(A + 8) >> 3] - turbo.Runtime._mem_float64[(B + 8) >> 3],
                turbo.Runtime._mem_float64[(A + 16) >> 3] - turbo.Runtime._mem_float64[(B + 16) >> 3],
                turbo.Runtime._mem_float64[(A + 24) >> 3] - turbo.Runtime._mem_float64[(B + 24) >> 3]
            );
        }
    }
    
    static Mul(A:RGBA, B:RGBA):RGB { return rgb(A.R * B.R, A.G * B.G, A.B * B.B); }
    static Mul_mem(A:number, B:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[(A + 8) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3];
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[(A + 16) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3];
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[(A + 24) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3];
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(A + 8) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3],
                turbo.Runtime._mem_float64[(A + 16) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3],
                turbo.Runtime._mem_float64[(A + 24) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3]
            );
        }
    }

    static MulScalar(A:RGBA, f:number):RGB { return rgb(A.R * f, A.G * f, A.B * f); }
    static MulScalar_mem(A:number, f:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[(A + 8) >> 3] * f;
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[(A + 16) >> 3] * f;
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[(A + 24) >> 3] * f;
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(A + 8) >> 3] * f,
                turbo.Runtime._mem_float64[(A + 16) >> 3] * f,
                turbo.Runtime._mem_float64[(A + 24) >> 3] * f
            );
        }
    }

    static DivScalar(A:RGBA, f:number):RGB { return rgb(A.R / f, A.G / f, A.B / f); }
    static DivScalar_mem(A:number, f:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[(A + 8) >> 3] / f;
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[(A + 16) >> 3] / f;
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[(A + 24) >> 3] / f;
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(A + 8) >> 3] / f,
                turbo.Runtime._mem_float64[(A + 16) >> 3] / f,
                turbo.Runtime._mem_float64[(A + 24) >> 3] / f
            );
        }
    }

    static Min(A:RGBA, B:RGBA):RGB { return rgb( Math.min(A.R , B.R), Math.min(A.G , B.G), Math.min(A.B , B.B) ); }
    static Min_mem(A:number, B:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = Math.min(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]);
            turbo.Runtime._mem_float64[(C + 16) >> 3] = Math.min(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]);
            turbo.Runtime._mem_float64[(C + 24) >> 3] = Math.min(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3]);
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                Math.min(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]),
                Math.min(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]),
                Math.min(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3])
            );
        }
    }

    static Max(A:RGBA, B:RGBA):RGB {return rgb( Math.max(A.R , B.R), Math.max(A.G , B.G), Math.max(A.B , B.B) );}
    static Max_mem(A:number, B:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = Math.max(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]);
            turbo.Runtime._mem_float64[(C + 16) >> 3] = Math.max(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]);
            turbo.Runtime._mem_float64[(C + 24) >> 3] = Math.max(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3]);
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                Math.max(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]),
                Math.max(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]),
                Math.max(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3])
            );
        }
    }

    static MinComponent(A:RGBA):number {return Math.min(Math.min(A.R, A.G), A.B)}
    static MinComponent_mem(A:number) {
        return Math.min( Math.min(turbo.Runtime._mem_float64[(A + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3]), turbo.Runtime._mem_float64[(A + 24) >> 3] );
    }

    static MaxComponent(A:RGBA):number { return Math.max(Math.max(A.R, A.G), A.B) }
    static MaxComponent_mem(A:number):number {
        return Math.max( Math.max(turbo.Runtime._mem_float64[(A + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3]), turbo.Runtime._mem_float64[(A + 24) >> 3] );
    }

    static Pow(A:RGBA, f:number):RGB {return rgb( Math.pow(A.R, f), Math.pow(A.G, f), Math.pow(A.B, f) );}
    static Pow_mem(A:number, f:number, C?:number):number {
        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = Math.pow(turbo.Runtime._mem_float64[(A + 8) >> 3] , f);
            turbo.Runtime._mem_float64[(C + 16) >> 3] = Math.pow(turbo.Runtime._mem_float64[(A + 16) >> 3] , f);
            turbo.Runtime._mem_float64[(C + 24) >> 3] = Math.pow(turbo.Runtime._mem_float64[(A + 24) >> 3] , f);
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                Math.pow(turbo.Runtime._mem_float64[(A + 8) >> 3] , f),
                Math.pow(turbo.Runtime._mem_float64[(A + 16) >> 3] , f),
                Math.pow(turbo.Runtime._mem_float64[(A + 24) >> 3] , f)
            );
        }
    }

    static Mix(A:RGBA, B:RGBA, pct:number):RGB {
        let _a = Color.MulScalar(A, 1 - pct);
        let _b = Color.MulScalar(B, pct);
        return rgb(_a.R + _b.R, _a.G + _b.G, _a.B + _b.B);
    }
    static Mix_mem(A:number, B:number, pct:number, C?:number):number {

        let _a:number = Color.MulScalar_mem(A, 1 - pct);
        let _b:number = Color.MulScalar_mem(B, pct);

        if(C){
            turbo.Runtime._mem_float64[(C + 8) >> 3] = turbo.Runtime._mem_float64[((_a) + 8) >> 3] + turbo.Runtime._mem_float64[((_b) + 8) >> 3];
            turbo.Runtime._mem_float64[(C + 16) >> 3] = turbo.Runtime._mem_float64[((_a) + 16) >> 3] + turbo.Runtime._mem_float64[((_b) + 16) >> 3];
            turbo.Runtime._mem_float64[(C + 24) >> 3] = turbo.Runtime._mem_float64[((_a) + 24) >> 3] + turbo.Runtime._mem_float64[((_b) + 24) >> 3];
            return C;
        }else{
            let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Color.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[((_a) + 8) >> 3] + turbo.Runtime._mem_float64[((_b) + 8) >> 3],
                turbo.Runtime._mem_float64[((_a) + 16) >> 3] + turbo.Runtime._mem_float64[((_b) + 16) >> 3],
                turbo.Runtime._mem_float64[((_a) + 24) >> 3] + turbo.Runtime._mem_float64[((_b) + 24) >> 3]
            );
        }
    }

    static IsEqual(A:number, B:number):boolean{
        return turbo.Runtime._mem_float64[(A + 8) >> 3] === turbo.Runtime._mem_float64[(B + 8) >> 3] && turbo.Runtime._mem_float64[(A + 16) >> 3] === turbo.Runtime._mem_float64[(B + 16) >> 3] && turbo.Runtime._mem_float64[(A + 24) >> 3] === turbo.Runtime._mem_float64[(B + 24) >> 3];
    }

    static IsBlack(A:number):boolean{
        return Color.IsEqual(A, Color.BLACK);
    }

    static IsWhite(A:number):boolean{
        return Color.IsEqual(A, Color.WHITE);
    }
    static Set(SELF:number, R:number, G:number, B:number) {
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = R; 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = G; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = B; 
        return SELF;
    }

    static Clone(SELF:number):number {
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Color.Init_mem(ptr, turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3]);
    }

    static BLACK:number = Color.HexColor(0x000000);
    static WHITE:number = Color.HexColor(0xFFFFFF);

    static BrightColors = [
        Color.HexColor(0xFF00FF),
        Color.HexColor(0x84FF00),
        Color.HexColor(0xFF0084),
        Color.HexColor(0x00FFFF),
        Color.HexColor(0x00FF84),
        Color.HexColor(0xDD40FF),
        Color.HexColor(0xFFFF00)
    ];

    static Random():number {
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Color.Init_mem(ptr, Math.random(), Math.random(), Math.random());
    }

    static RandomBrightColor():number {
        var i:number = Math.round(Math.random() * Color.BrightColors.length);
        return Color.BrightColors[i];
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=194603; return SELF; }
}
turbo.Runtime._idToType[194603] = Color;

type XYZ = {
    X:number,
    Y:number,
    Z:number
};

export class Vector extends MemoryObject{
   static NAME:string = "Vector";
   static SIZE:number = 32;
   static ALIGN:number = 8;
   static CLSID:number = 1266219;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, vector = {X:0,Y:0,Z:0}):number {
		 turbo.Runtime._mem_float64[(SELF + 8) >> 3] = (vector.X); 
		 turbo.Runtime._mem_float64[(SELF + 16) >> 3] = (vector.Y); 
		 turbo.Runtime._mem_float64[(SELF + 24) >> 3] = (vector.Z); 
		return SELF;
	}

    static Init_mem(SELF:number, X:number = 0,Y:number = 0,Z:number = 0):number {
		 turbo.Runtime._mem_float64[(SELF + 8) >> 3] = X; 
		 turbo.Runtime._mem_float64[(SELF + 16) >> 3] = Y; 
		 turbo.Runtime._mem_float64[(SELF + 24) >> 3] = Z; 
		return SELF;
	}

    static NewVector(vector?):number {
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.init(ptr, vector);
    }

    static XYZ(a:number):XYZ {
        return xyz(turbo.Runtime._mem_float64[(a + 8) >> 3], turbo.Runtime._mem_float64[(a + 16) >> 3], turbo.Runtime._mem_float64[(a + 24) >> 3]);
    }

    static RandomUnitVector():number {
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));

        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;

        while(x*x+y*y+z*z > 1){
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
        }
        return Vector.Normalize_mem(Vector.Init_mem(ptr, x, y, z));
    }

    static Length(a:XYZ):number {
        return Math.sqrt((a.X * a.X) + (a.Y * a.Y) + (a.Z * a.Z));
    }

    static Length_mem(a:number):number {
        return Math.sqrt(turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(a + 8) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(a + 16) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(a + 24) >> 3]);
    }

    static LengthN(a:XYZ, n:number):number {
        if (n == 2) {
            return Vector.Length(a);
        }
        a = Vector.Abs(a);
        return Math.pow(
            Math.pow(a.X, n) + Math.pow(a.Y, n) + Math.pow(a.Z, n),
            1/n
        );
    }

    static LengthN_mem(a:number, n:number):number {
        if (n == 2) {
            return Vector.Length_mem(a);
        }
        a = Vector.Abs_mem(a);
        return Math.pow(
            Math.pow(turbo.Runtime._mem_float64[(a + 8) >> 3], n) + Math.pow(turbo.Runtime._mem_float64[(a + 16) >> 3], n) + Math.pow(turbo.Runtime._mem_float64[(a + 24) >> 3], n),
            1/n
        );
    }

    static Dot(a:XYZ, B:XYZ):number {
        return (a.X * B.X) + (a.Y * B.Y) + (a.Z * B.Z);
    }

    static Dot_mem(a:number, B:number):number {
        return (turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3]) + (turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3]) + (turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3]);
    }

    static Cross(a:XYZ, B:XYZ):XYZ {
        let x:number = (a.Y * B.Z) - (a.Z * B.Y);
        let y:number = (a.Z * B.X) - (a.X * B.Z);
        let z:number = (a.X * B.Y) - (a.Y * B.X);
        return xyz(x, y, z);
    }

    static Cross_mem(a:number, B:number, c?:number):number {
        let x:number = (turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3]) - (turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3]);
        let y:number = (turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3]) - (turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3]);
        let z:number = (turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3]) - (turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3]);

        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = x;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = y;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = z;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(ptr, x, y, z);
        }
    }

    static Normalize(a:XYZ):XYZ {
        let d:number = Vector.Length(a);
        return xyz(a.X / d, a.Y / d, a.Z / d);
    }

    static Normalize_mem(a:number, c?:number):number {
        let d:number = Vector.Length_mem(a);
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] / d;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] / d;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] / d;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(ptr, turbo.Runtime._mem_float64[(a + 8) >> 3] / d, turbo.Runtime._mem_float64[(a + 16) >> 3] / d, turbo.Runtime._mem_float64[(a + 24) >> 3] / d);
        }
    }

    static Negate(a:XYZ):XYZ {
        return xyz(-a.X, -a.Y, -a.Z);
    }

    static Negate_mem(a:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = -turbo.Runtime._mem_float64[(a + 8) >> 3];
            turbo.Runtime._mem_float64[(c + 16) >> 3] = -turbo.Runtime._mem_float64[(a + 16) >> 3];
            turbo.Runtime._mem_float64[(c + 24) >> 3] = -turbo.Runtime._mem_float64[(a + 24) >> 3];
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                -turbo.Runtime._mem_float64[(a + 8) >> 3],
                -turbo.Runtime._mem_float64[(a + 16) >> 3],
                -turbo.Runtime._mem_float64[(a + 24) >> 3]
            );
        }
    }

    static Abs(a:XYZ):XYZ {
        return xyz(Math.abs(a.X), Math.abs(a.Y), Math.abs(a.Z));
    }

    static Abs_mem(a:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = Math.abs(turbo.Runtime._mem_float64[(a + 8) >> 3]);
            turbo.Runtime._mem_float64[(c + 16) >> 3] = Math.abs(turbo.Runtime._mem_float64[(a + 16) >> 3]);
            turbo.Runtime._mem_float64[(c + 24) >> 3] = Math.abs(turbo.Runtime._mem_float64[(a + 24) >> 3]);
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                Math.abs(turbo.Runtime._mem_float64[(a + 8) >> 3]),
                Math.abs(turbo.Runtime._mem_float64[(a + 16) >> 3]),
                Math.abs(turbo.Runtime._mem_float64[(a + 24) >> 3])
            );
        }
    }
    static Add(a:XYZ, b:XYZ):XYZ { return xyz(a.X + b.X, a.Y + b.Y, a.Z + b.Z); }

    static Add_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] + turbo.Runtime._mem_float64[(b + 8) >> 3];
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] + turbo.Runtime._mem_float64[(b + 16) >> 3];
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] + turbo.Runtime._mem_float64[(b + 24) >> 3];
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] + turbo.Runtime._mem_float64[(b + 8) >> 3],
                turbo.Runtime._mem_float64[(a + 16) >> 3] + turbo.Runtime._mem_float64[(b + 16) >> 3],
                turbo.Runtime._mem_float64[(a + 24) >> 3] + turbo.Runtime._mem_float64[(b + 24) >> 3]
            );
        }
    }

    static Sub(a:XYZ, b:XYZ):XYZ { return xyz(a.X - b.X, a.Y - b.Y, a.Z - b.Z); }
    static Sub_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] - turbo.Runtime._mem_float64[(b + 8) >> 3];
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] - turbo.Runtime._mem_float64[(b + 16) >> 3];
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] - turbo.Runtime._mem_float64[(b + 24) >> 3];
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] - turbo.Runtime._mem_float64[(b + 8) >> 3],
                turbo.Runtime._mem_float64[(a + 16) >> 3] - turbo.Runtime._mem_float64[(b + 16) >> 3],
                turbo.Runtime._mem_float64[(a + 24) >> 3] - turbo.Runtime._mem_float64[(b + 24) >> 3]
            );
        }
    }

    static Mul(a:XYZ, b:XYZ):XYZ { return xyz(a.X * b.X, a.Y * b.Y, a.Z * b.Z); }
    static Mul_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3];
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3];
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3];
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3],
                turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3],
                turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3]
            );
        }
    }

    static Div(a:XYZ, b:XYZ):XYZ {
        return xyz(a.X / b.X, a.Y / b.Y, a.Z / b.Z);
    }

    static Div_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] / turbo.Runtime._mem_float64[(b + 8) >> 3];
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] / turbo.Runtime._mem_float64[(b + 16) >> 3];
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] / turbo.Runtime._mem_float64[(b + 24) >> 3];
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] / turbo.Runtime._mem_float64[(b + 8) >> 3],
                turbo.Runtime._mem_float64[(a + 16) >> 3] / turbo.Runtime._mem_float64[(b + 16) >> 3],
                turbo.Runtime._mem_float64[(a + 24) >> 3] / turbo.Runtime._mem_float64[(b + 24) >> 3]
            );
        }
    }

    static Mod(a:XYZ, b:XYZ):XYZ {
        // as implemented in GLSL
        let x = a.X - b.X * Math.floor(a.X/b.X);
        let y = a.Y - b.Y * Math.floor(a.Y/b.Y);
        let z = a.Z - b.Z * Math.floor(a.Z/b.Z);
        return xyz(x, y, z);
    }

    static Mod_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] - turbo.Runtime._mem_float64[(b + 8) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 8) >> 3]/turbo.Runtime._mem_float64[(b + 8) >> 3]);
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] - turbo.Runtime._mem_float64[(b + 16) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 16) >> 3]/turbo.Runtime._mem_float64[(b + 16) >> 3]);
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] - turbo.Runtime._mem_float64[(b + 24) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 24) >> 3]/turbo.Runtime._mem_float64[(b + 24) >> 3]);
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] - turbo.Runtime._mem_float64[(b + 8) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 8) >> 3]/turbo.Runtime._mem_float64[(b + 8) >> 3]),
                turbo.Runtime._mem_float64[(a + 16) >> 3] - turbo.Runtime._mem_float64[(b + 16) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 16) >> 3]/turbo.Runtime._mem_float64[(b + 16) >> 3]),
                turbo.Runtime._mem_float64[(a + 24) >> 3] - turbo.Runtime._mem_float64[(b + 24) >> 3] * Math.floor(turbo.Runtime._mem_float64[(a + 24) >> 3]/turbo.Runtime._mem_float64[(b + 24) >> 3])
            );
        }
    }

    static AddScalar(a:XYZ, f:number):XYZ { return xyz(a.X + f, a.Y + f, a.Z + f); }

    static AddScalar_mem(a:number, f:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] + f;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] + f;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] + f;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] + f,
                turbo.Runtime._mem_float64[(a + 16) >> 3] + f,
                turbo.Runtime._mem_float64[(a + 24) >> 3] + f
            );
        }
    }

    static SubScalar(a:XYZ, f:number):XYZ { return xyz(a.X - f, a.Y - f, a.Z - f); }

    static SubScalar_mem(a:number, f:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] - f;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] - f;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] - f;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] - f,
                turbo.Runtime._mem_float64[(a + 16) >> 3] - f,
                turbo.Runtime._mem_float64[(a + 24) >> 3] - f
            );
        }
    }

    static MulScalar(a:XYZ, f:number):XYZ { return xyz(a.X * f, a.Y * f, a.Z * f); }
    static MulScalar_mem(a:number, f:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * f;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] * f;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] * f;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] * f,
                turbo.Runtime._mem_float64[(a + 16) >> 3] * f,
                turbo.Runtime._mem_float64[(a + 24) >> 3] * f
            );
        }
    }

    static DivScalar(a:XYZ, f:number):XYZ { return xyz(a.X / f, a.Y / f, a.Z / f); }
    static DivScalar_mem(a:number, f:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] / f;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = turbo.Runtime._mem_float64[(a + 16) >> 3] / f;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = turbo.Runtime._mem_float64[(a + 24) >> 3] / f;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                turbo.Runtime._mem_float64[(a + 8) >> 3] / f,
                turbo.Runtime._mem_float64[(a + 16) >> 3] / f,
                turbo.Runtime._mem_float64[(a + 24) >> 3] / f
            );
        }
    }

    static Min(a:XYZ, b:XYZ):XYZ { return xyz( Math.min(a.X , b.X), Math.min(a.Y , b.Y), Math.min(a.Z , b.Z) ); }
    static Min_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = Math.min(turbo.Runtime._mem_float64[(a + 8) >> 3] , turbo.Runtime._mem_float64[(b + 8) >> 3]);
            turbo.Runtime._mem_float64[(c + 16) >> 3] = Math.min(turbo.Runtime._mem_float64[(a + 16) >> 3] , turbo.Runtime._mem_float64[(b + 16) >> 3]);
            turbo.Runtime._mem_float64[(c + 24) >> 3] = Math.min(turbo.Runtime._mem_float64[(a + 24) >> 3] , turbo.Runtime._mem_float64[(b + 24) >> 3]);
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                Math.min(turbo.Runtime._mem_float64[(a + 8) >> 3] , turbo.Runtime._mem_float64[(b + 8) >> 3]),
                Math.min(turbo.Runtime._mem_float64[(a + 16) >> 3] , turbo.Runtime._mem_float64[(b + 16) >> 3]),
                Math.min(turbo.Runtime._mem_float64[(a + 24) >> 3] , turbo.Runtime._mem_float64[(b + 24) >> 3])
            );
        }
    }

    static Max(a:XYZ, b:XYZ):XYZ {return xyz( Math.max(a.X , b.X), Math.max(a.Y , b.Y), Math.max(a.Z , b.Z) );}
    static Max_mem(a:number, b:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = Math.max(turbo.Runtime._mem_float64[(a + 8) >> 3] , turbo.Runtime._mem_float64[(b + 8) >> 3]);
            turbo.Runtime._mem_float64[(c + 16) >> 3] = Math.max(turbo.Runtime._mem_float64[(a + 16) >> 3] , turbo.Runtime._mem_float64[(b + 16) >> 3]);
            turbo.Runtime._mem_float64[(c + 24) >> 3] = Math.max(turbo.Runtime._mem_float64[(a + 24) >> 3] , turbo.Runtime._mem_float64[(b + 24) >> 3]);
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                Math.max(turbo.Runtime._mem_float64[(a + 8) >> 3] , turbo.Runtime._mem_float64[(b + 8) >> 3]),
                Math.max(turbo.Runtime._mem_float64[(a + 16) >> 3] , turbo.Runtime._mem_float64[(b + 16) >> 3]),
                Math.max(turbo.Runtime._mem_float64[(a + 24) >> 3] , turbo.Runtime._mem_float64[(b + 24) >> 3])
            );
        }
    }

    static MinAxis(a:XYZ):XYZ {
        let x:number = Math.abs(a.X);
        let y:number = Math.abs(a.Y);
        let z:number = Math.abs(a.Z);

        if(x <= y && x <= z) {
            return xyz(1, 0, 0);
        }else if(y <= x && y <= z){
            return xyz(0, 1, 0);
        }
        return xyz(0, 0, 1);
    }

    static MinAxis_mem(a:number, c?:number):number {
        let x:number = Math.abs(turbo.Runtime._mem_float64[(a + 8) >> 3]);
        let y:number = Math.abs(turbo.Runtime._mem_float64[(a + 16) >> 3]);
        let z:number = Math.abs(turbo.Runtime._mem_float64[(a + 24) >> 3]);

        if(x <= y && x <= z) {
            x = 1;
            y = 0;
            z = 0;
        }else if(y <= x && y <= z){
            x = 0;
            y = 1;
            z = 0;
        }else{
            x = 0;
            y = 0;
            z = 1;
        }

        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = x;
            turbo.Runtime._mem_float64[(c + 16) >> 3] = y;
            turbo.Runtime._mem_float64[(c + 24) >> 3] = z;
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(ptr, x,y,z);
        }
    }

    static MinComponent(a:XYZ):number {return Math.min(Math.min(a.X, a.Y), a.Z)}
    static MinComponent_mem(a:number) {
        return Math.min( Math.min(turbo.Runtime._mem_float64[(a + 8) >> 3], turbo.Runtime._mem_float64[(a + 16) >> 3]), turbo.Runtime._mem_float64[(a + 24) >> 3] );
    }

    static MaxComponent(a:XYZ):number { return Math.max(Math.max(a.X, a.Y), a.Z) }
    static MaxComponent_mem(a:number):number {
        return Math.max( Math.max(turbo.Runtime._mem_float64[(a + 8) >> 3], turbo.Runtime._mem_float64[(a + 16) >> 3]), turbo.Runtime._mem_float64[(a + 24) >> 3] );
    }

    static Reflect(a:XYZ, b:XYZ):XYZ {
        return Vector.Sub(b, Vector.MulScalar(a, 2 * Vector.Dot(a,b)));
    }

    static Reflect_mem(a:number, b:number, c?:number):number {
        c = c? c: Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Sub_mem(b, Vector.MulScalar_mem(a, 2 * Vector.Dot_mem(a,b), c), c);
    }

    static Refract(a:XYZ, b:XYZ, n1:number, n2:number):XYZ {
        let nr:number = n1 / n2;
        let cosI:number = -Vector.Dot(a, b);
        let sinT2:number = nr * nr * (1 - cosI * cosI);
        if (sinT2 > 1) {
            return xyz(0,0,0);
        }
        let cosT:number = Math.sqrt(1 - sinT2);
        return Vector.Add(Vector.MulScalar(b, nr), Vector.MulScalar(a, nr * cosI - cosT));
    }

    static Refract_mem(a:number, b:number, n1:number, n2:number, c?:number):number {
        let nr:number = n1 / n2;
        let cosI:number = -Vector.Dot_mem(a, b);
        let sinT2:number = nr * nr * (1 - cosI * cosI);
        if (sinT2 > 1) {
            return Vector.Init_mem(Vector.initInstance(turbo.Runtime.allocOrThrow(32,8)));
        }
        let cosT:number = Math.sqrt(1 - sinT2);
        c = c? c: Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Add_mem(Vector.MulScalar_mem(b, nr), Vector.MulScalar_mem(a, nr * cosI - cosT, c), c);
    }

    static Reflectance(a:XYZ, b:XYZ, n1:number, n2:number):number {
        let nr:number = n1 / n2;
        let cosI:number = -Vector.Dot(a, b);
        let sinT2:number = nr * nr * (1 - cosI * cosI);
        if (sinT2 > 1) {
            return 1;
        }
        let cosT:number = Math.sqrt(1 - sinT2);
        let rOrth:number = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
        let rPar:number = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT);
        return (rOrth * rOrth + rPar * rPar) / 2;
    }

    static Reflectance_mem(a:number, b:number, n1:number, n2:number):number {
        let nr:number = n1 / n2;
        let cosI:number = -Vector.Dot_mem(a, b);
        let sinT2:number = nr * nr * (1 - cosI * cosI);
        if (sinT2 > 1) {
            return 1;
        }
        let cosT:number = Math.sqrt(1 - sinT2);
        let rOrth:number = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
        let rPar:number = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT);
        return (rOrth * rOrth + rPar * rPar) / 2;
    }


    //--------------------------------
    // X X X X X X X X X X X X X X X X
    //--------------------------------


    static Pow(a:XYZ, f:number):XYZ {return xyz( Math.pow(a.X, f), Math.pow(a.Y, f), Math.pow(a.Z, f) );}
    static Pow_mem(a:number, f:number, c?:number):number {
        if(c){
            turbo.Runtime._mem_float64[(c + 8) >> 3] = Math.pow(turbo.Runtime._mem_float64[(a + 8) >> 3] , f);
            turbo.Runtime._mem_float64[(c + 16) >> 3] = Math.pow(turbo.Runtime._mem_float64[(a + 16) >> 3] , f);
            turbo.Runtime._mem_float64[(c + 24) >> 3] = Math.pow(turbo.Runtime._mem_float64[(a + 24) >> 3] , f);
            return c;
        }else{
            let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            return Vector.Init_mem(
                ptr,
                Math.pow(turbo.Runtime._mem_float64[(a + 8) >> 3] , f),
                Math.pow(turbo.Runtime._mem_float64[(a + 16) >> 3] , f),
                Math.pow(turbo.Runtime._mem_float64[(a + 24) >> 3] , f)
            );
        }
    }

    static IsEqual(a:number, b:number):boolean{
        return turbo.Runtime._mem_float64[(a + 8) >> 3] === turbo.Runtime._mem_float64[(b + 8) >> 3] && turbo.Runtime._mem_float64[(a + 16) >> 3] === turbo.Runtime._mem_float64[(b + 16) >> 3] && turbo.Runtime._mem_float64[(a + 24) >> 3] === turbo.Runtime._mem_float64[(b + 24) >> 3];
    }

    static Set(SELF:number, X:number, Y:number, Z:number) {
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = X; 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = Y; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = Z; 
        return SELF;
    }

    static Clone(SELF:number):number {
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Init_mem(ptr, turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3]);
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=1266219; return SELF; }
}
turbo.Runtime._idToType[1266219] = Vector;

export class Box extends MemoryObject{
   static NAME:string = "Box";
   static SIZE:number = 12;
   static ALIGN:number = 4;
   static CLSID:number = 1841;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, min:XYZ = xyz(0,0,0), max:XYZ= xyz(0,0,0)){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = (Vector.NewVector(min)); 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = (Vector.NewVector(max)); 
        return SELF;
	}

    static Init_mem(SELF:number, min:number, max:number){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = min; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = max; 
        return SELF;
	}


	static BoxForTriangles(){

	}

	static Anchor(){

	}
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=1841; return SELF; }
}
turbo.Runtime._idToType[1841] = Box;


// static BoxForShapes(shapes:Shape.Array):number{
// let length:number = len(shapes, Shape);
// if(length == 0) {
// return _new Box;
// }
// let box = shapes[0].BoundingBox();
//
// for(let i:number = 0; i < length; i++){
// let shape:number = Shape  .  Array  .  at(shapes, i);
// box = Box.Extend(box, Shape.BoundingBox(shape));
// }
// return box
// }

/*
func BoxForShapes(shapes []Shape) Box {
	if len(shapes) == 0 {
		return Box{}
	}
	box := shapes[0].BoundingBox()
	for _, shape := range shapes {
		box = box.Extend(shape.BoundingBox())
	}
	return box
}

func BoxForTriangles(shapes []*Triangle) Box {
	if len(shapes) == 0 {
		return Box{}
	}
	box := shapes[0].BoundingBox()
	for _, shape := range shapes {
		box = box.Extend(shape.BoundingBox())
	}
	return box
}

func (a Box) Anchor(anchor Vector) Vector {
	return a.Min.Add(a.Size().Mul(anchor))
}

func (a Box) Center() Vector {
	return a.Anchor(Vector{0.5, 0.5, 0.5})
}

func (a Box) OuterRadius() float64 {
	return a.Min.Sub(a.Center()).Length()
}

func (a Box) InnerRadius() float64 {
	return a.Center().Sub(a.Min).MaxComponent()
}

func (a Box) Size() Vector {
	return a.Max.Sub(a.Min)
}

func (a Box) Extend(b Box) Box {
	return Box{a.Min.Min(b.Min), a.Max.Max(b.Max)}
}

func (a Box) Contains(b Vector) bool {
	return a.Min.X <= b.X && a.Max.X >= b.X &&
		a.Min.Y <= b.Y && a.Max.Y >= b.Y &&
		a.Min.Z <= b.Z && a.Max.Z >= b.Z
}

func (a Box) Intersects(b Box) bool {
	return !(a.Min.X > b.Max.X || a.Max.X < b.Min.X || a.Min.Y > b.Max.Y ||
		a.Max.Y < b.Min.Y || a.Min.Z > b.Max.Z || a.Max.Z < b.Min.Z)
}

func (b *Box) Intersect(r Ray) (float64, float64) {
	x1 := (b.Min.X - r.Origin.X) / r.Direction.X
	y1 := (b.Min.Y - r.Origin.Y) / r.Direction.Y
	z1 := (b.Min.Z - r.Origin.Z) / r.Direction.Z
	x2 := (b.Max.X - r.Origin.X) / r.Direction.X
	y2 := (b.Max.Y - r.Origin.Y) / r.Direction.Y
	z2 := (b.Max.Z - r.Origin.Z) / r.Direction.Z
	if x1 > x2 {
		x1, x2 = x2, x1
	}
	if y1 > y2 {
		y1, y2 = y2, y1
	}
	if z1 > z2 {
		z1, z2 = z2, z1
	}
	t1 := math.Max(math.Max(x1, y1), z1)
	t2 := math.Min(math.Min(x2, y2), z2)
	return t1, t2
}

func (b *Box) Partition(axis Axis, point float64) (left, right bool) {
	switch axis {
	case AxisX:
		left = b.Min.X <= point
		right = b.Max.X >= point
	case AxisY:
		left = b.Min.Y <= point
		right = b.Max.Y >= point
	case AxisZ:
		left = b.Min.Z <= point
		right = b.Max.Z >= point
	}
	return
}
*/


interface Ray{
    Origin:number;
    Direction:number;
}

export class Matrix extends MemoryObject{
   static NAME:string = "Matrix";
   static SIZE:number = 136;
   static ALIGN:number = 8;
   static CLSID:number = 2093537;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number=0, x00:number=0, x01:number=0, x02:number=0, x03:number=0, x10:number=0, x11:number=0, x12:number=0, x13:number=0, x20:number=0, x21:number=0, x22:number=0, x23:number=0, x30:number=0, x31:number=0, x32:number=0, x33:number=0) {
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = x00; 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = x01; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = x02; 
         turbo.Runtime._mem_float64[(SELF + 32) >> 3] = x03; 
         turbo.Runtime._mem_float64[(SELF + 40) >> 3] = x10; 
         turbo.Runtime._mem_float64[(SELF + 48) >> 3] = x11; 
         turbo.Runtime._mem_float64[(SELF + 56) >> 3] = x12; 
         turbo.Runtime._mem_float64[(SELF + 64) >> 3] = x13; 
         turbo.Runtime._mem_float64[(SELF + 72) >> 3] = x20; 
         turbo.Runtime._mem_float64[(SELF + 80) >> 3] = x21; 
         turbo.Runtime._mem_float64[(SELF + 88) >> 3] = x22; 
         turbo.Runtime._mem_float64[(SELF + 96) >> 3] = x23; 
         turbo.Runtime._mem_float64[(SELF + 104) >> 3] = x30; 
         turbo.Runtime._mem_float64[(SELF + 112) >> 3] = x31; 
         turbo.Runtime._mem_float64[(SELF + 120) >> 3] = x32; 
         turbo.Runtime._mem_float64[(SELF + 128) >> 3] = x33; 
        return SELF;
    }

    static NewMatrix(x00?:number, x01?:number, x02?:number, x03?:number, x10?:number, x11?:number, x12?:number, x13?:number, x20?:number, x21?:number, x22?:number, x23?:number, x30?:number, x31?:number, x32?:number, x33?:number):number {
        let ptr:number = Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            x00, x01, x02, x03,
            x10, x11, x12, x13,
            x20, x21, x22, x23,
            x30, x31, x32, x33
        )
    }

    static DATA(SELF:number) {
        return [
            turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3], turbo.Runtime._mem_float64[(SELF + 32) >> 3],
            turbo.Runtime._mem_float64[(SELF + 40) >> 3], turbo.Runtime._mem_float64[(SELF + 48) >> 3], turbo.Runtime._mem_float64[(SELF + 56) >> 3], turbo.Runtime._mem_float64[(SELF + 64) >> 3],
            turbo.Runtime._mem_float64[(SELF + 72) >> 3], turbo.Runtime._mem_float64[(SELF + 80) >> 3], turbo.Runtime._mem_float64[(SELF + 88) >> 3], turbo.Runtime._mem_float64[(SELF + 96) >> 3],
            turbo.Runtime._mem_float64[(SELF + 104) >> 3], turbo.Runtime._mem_float64[(SELF + 112) >> 3], turbo.Runtime._mem_float64[(SELF + 120) >> 3], turbo.Runtime._mem_float64[(SELF + 128) >> 3]
        ]
    }

    static Identity(c?:number):number {
        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )
    }

    static IsEqual(a:number, b:number):boolean {
        return turbo.Runtime._mem_float64[(a + 8) >> 3] == turbo.Runtime._mem_float64[(b + 8) >> 3] && turbo.Runtime._mem_float64[(a + 16) >> 3] == turbo.Runtime._mem_float64[(b + 16) >> 3] && turbo.Runtime._mem_float64[(a + 24) >> 3] == turbo.Runtime._mem_float64[(b + 24) >> 3] && turbo.Runtime._mem_float64[(a + 32) >> 3] == turbo.Runtime._mem_float64[(b + 32) >> 3] && turbo.Runtime._mem_float64[(a + 40) >> 3] == turbo.Runtime._mem_float64[(b + 40) >> 3] && turbo.Runtime._mem_float64[(a + 48) >> 3] == turbo.Runtime._mem_float64[(b + 48) >> 3] && turbo.Runtime._mem_float64[(a + 56) >> 3] == turbo.Runtime._mem_float64[(b + 56) >> 3] && turbo.Runtime._mem_float64[(a + 64) >> 3] == turbo.Runtime._mem_float64[(b + 64) >> 3] && turbo.Runtime._mem_float64[(a + 72) >> 3] == turbo.Runtime._mem_float64[(b + 72) >> 3] && turbo.Runtime._mem_float64[(a + 80) >> 3] == turbo.Runtime._mem_float64[(b + 80) >> 3] && turbo.Runtime._mem_float64[(a + 88) >> 3] == turbo.Runtime._mem_float64[(b + 88) >> 3] && turbo.Runtime._mem_float64[(a + 96) >> 3] == turbo.Runtime._mem_float64[(b + 96) >> 3] && turbo.Runtime._mem_float64[(a + 104) >> 3] == turbo.Runtime._mem_float64[(b + 104) >> 3] && turbo.Runtime._mem_float64[(a + 112) >> 3] == turbo.Runtime._mem_float64[(b + 112) >> 3] && turbo.Runtime._mem_float64[(a + 120) >> 3] == turbo.Runtime._mem_float64[(b + 120) >> 3] && turbo.Runtime._mem_float64[(a + 128) >> 3] == turbo.Runtime._mem_float64[(b + 128) >> 3];
    }

    static IsIdentity(a:number):boolean {
        return turbo.Runtime._mem_float64[(a + 8) >> 3] == 1 && turbo.Runtime._mem_float64[(a + 16) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 24) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 32) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 40) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 48) >> 3] == 1 && turbo.Runtime._mem_float64[(a + 56) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 64) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 72) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 80) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 88) >> 3] == 1 && turbo.Runtime._mem_float64[(a + 96) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 104) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 112) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 120) >> 3] == 0 && turbo.Runtime._mem_float64[(a + 128) >> 3] == 1;
    }

    static TranslateUnitMatrix(v:number, c?:number):number{
        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            1, 0, 0, turbo.Runtime._mem_float64[(v + 8) >> 3],
            0, 1, 0, turbo.Runtime._mem_float64[(v + 16) >> 3],
            0, 0, 1, turbo.Runtime._mem_float64[(v + 24) >> 3],
            0, 0, 0, 1
        )
    }

    static ScaleUnitMatrix(v:number, c?:number):number{
        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            turbo.Runtime._mem_float64[(v + 8) >> 3], 0, 0, 0,
            0, turbo.Runtime._mem_float64[(v + 16) >> 3], 0, 0,
            0, 0, turbo.Runtime._mem_float64[(v + 24) >> 3], 0,
            0, 0, 0, 1
        )
    }

    static RotateUnitMatrix(v:number, a:number, _c?:number):number{

        v = Vector.Normalize_mem(v);
        let s:number = Math.sin(a);
        let c:number = Math.cos(a);
        let m:number = 1 - c;

        let ptr:number = _c?_c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            m*turbo.Runtime._mem_float64[(v + 8) >> 3] * turbo.Runtime._mem_float64[(v + 8) >> 3] + c, m * turbo.Runtime._mem_float64[(v + 8) >> 3] * turbo.Runtime._mem_float64[(v + 16) >> 3] + turbo.Runtime._mem_float64[(v + 24) >> 3] * s, m * turbo.Runtime._mem_float64[(v + 24) >> 3] * turbo.Runtime._mem_float64[(v + 8) >> 3] - turbo.Runtime._mem_float64[(v + 16) >> 3] * s, 0,
            m*turbo.Runtime._mem_float64[(v + 8) >> 3] * turbo.Runtime._mem_float64[(v + 16) >> 3] - turbo.Runtime._mem_float64[(v + 24) >> 3] * s, m*turbo.Runtime._mem_float64[(v + 16) >> 3] * turbo.Runtime._mem_float64[(v + 16) >> 3] + c, m*turbo.Runtime._mem_float64[(v + 16) >> 3] * turbo.Runtime._mem_float64[(v + 24) >> 3] + turbo.Runtime._mem_float64[(v + 8) >> 3] * s, 0,
            m*turbo.Runtime._mem_float64[(v + 24) >> 3] * turbo.Runtime._mem_float64[(v + 8) >> 3] + turbo.Runtime._mem_float64[(v + 16) >> 3] * s, m*turbo.Runtime._mem_float64[(v + 16) >> 3] * turbo.Runtime._mem_float64[(v + 24) >> 3] - turbo.Runtime._mem_float64[(v + 8) >> 3] * s, m*turbo.Runtime._mem_float64[(v + 24) >> 3] * turbo.Runtime._mem_float64[(v + 24) >> 3] + c, 0,
            0, 0, 0, 1
        )
    }

    static FrustumUnitMatrix(l:number, r:number, b:number, t:number, n:number, f:number, c?:number):number{

        let t1:number = 2 * n;
        let t2:number = r - l;
        let t3:number = t - b;
        let t4:number = f - n;

        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            t1 / t2, 0, (r + l) / t2, 0,
            0, t1 / t3, (t + b) / t3, 0,
            0, 0, (-f - n) / t4, (-t1 * f) / t4,
            0, 0, -1, 0
        )
    }

    static OrthographicUnitMatrix(l:number, r:number, b:number, t:number, n:number, f:number, c?:number):number{

        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            2 / (r - l), 0, 0, -(r + l) / (r - l),
            0, 2 / (t - b), 0, -(t + b) / (t - b),
            0, 0, -2 / (f - n), -(f + n) / (f - n),
            0, 0, 0, 1
        )
    }

    static PerspectiveUnitMatrix(fovy:number, aspect:number, near:number, far:number, c?:number):number {
        let ymax:number = near * Math.tan(fovy * Math.PI/360);
        let xmax:number = ymax * aspect;
        return Matrix.Frustum(-xmax, xmax, -ymax, ymax, near, far, c);
    }

    static LookAtMatrix(eye:number, center:number, up:number, c?:number):number{
        up = Vector.Normalize_mem(up);
        let f:number = Vector.Normalize_mem(Vector.Sub_mem(center, eye));
        let s:number = Vector.Normalize_mem(Vector.Cross_mem(f, up));
        let u:number = Vector.Cross_mem(s,f);

        let ptr:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        Matrix.init(ptr,
            turbo.Runtime._mem_float64[(s + 8) >> 3], turbo.Runtime._mem_float64[(u + 8) >> 3], turbo.Runtime._mem_float64[(f + 8) >> 3], 0,
            turbo.Runtime._mem_float64[(s + 16) >> 3], turbo.Runtime._mem_float64[(u + 16) >> 3], turbo.Runtime._mem_float64[(f + 16) >> 3], 0,
            turbo.Runtime._mem_float64[(s + 24) >> 3], turbo.Runtime._mem_float64[(u + 24) >> 3], turbo.Runtime._mem_float64[(f + 24) >> 3], 0,
            0, 0, 0, 1
        );
        return Matrix.Translate(Matrix.Inverse(Matrix.Transpose(ptr, ptr), ptr), eye, ptr);
    }
    
    static Translate(m:number, v:number, c?:number):number {
        return Matrix.Mul(m, Matrix.TranslateUnitMatrix(v), c);
    }

    static Scale(m:number, v:number):number{
        return Matrix.Mul(m, Matrix.ScaleUnitMatrix(v));
    }

    static Rotate(m:number, v:number, a:number):number {
        return Matrix.Mul(m, Matrix.RotateUnitMatrix(v, a));
    }

    static Frustum(m:number, l:number, r:number, b:number, t:number, n:number, f:number):number {
        return Matrix.Mul(m, Matrix.FrustumUnitMatrix(l, r, b, t, n, f));
    }

    static Orthographic(m:number, l:number, r:number, b:number, t:number, n:number, f:number):number {
        return Matrix.Mul(m, Matrix.OrthographicUnitMatrix(l, r, b, t, n, f));
    }

    static Perspective(m:number, fovy:number, aspect:number, near:number, far:number):number {
        return Matrix.Mul(m, Matrix.PerspectiveUnitMatrix(fovy, aspect, near, far));
    }

    static Mul(a:number, b:number, m?:number):number{
        m = m?m:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        turbo.Runtime._mem_float64[(m + 8) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 40) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 72) >> 3] + turbo.Runtime._mem_float64[(a + 32) >> 3] * turbo.Runtime._mem_float64[(b + 104) >> 3];
        turbo.Runtime._mem_float64[(m + 40) >> 3] = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 40) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 72) >> 3] + turbo.Runtime._mem_float64[(a + 64) >> 3] * turbo.Runtime._mem_float64[(b + 104) >> 3];
        turbo.Runtime._mem_float64[(m + 72) >> 3] = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 40) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 72) >> 3] + turbo.Runtime._mem_float64[(a + 96) >> 3] * turbo.Runtime._mem_float64[(b + 104) >> 3];
        turbo.Runtime._mem_float64[(m + 104) >> 3] = turbo.Runtime._mem_float64[(a + 104) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 112) >> 3] * turbo.Runtime._mem_float64[(b + 40) >> 3] + turbo.Runtime._mem_float64[(a + 120) >> 3] * turbo.Runtime._mem_float64[(b + 72) >> 3] + turbo.Runtime._mem_float64[(a + 128) >> 3] * turbo.Runtime._mem_float64[(b + 104) >> 3];
        turbo.Runtime._mem_float64[(m + 16) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 48) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 80) >> 3] + turbo.Runtime._mem_float64[(a + 32) >> 3] * turbo.Runtime._mem_float64[(b + 112) >> 3];
        turbo.Runtime._mem_float64[(m + 48) >> 3] = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 48) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 80) >> 3] + turbo.Runtime._mem_float64[(a + 64) >> 3] * turbo.Runtime._mem_float64[(b + 112) >> 3];
        turbo.Runtime._mem_float64[(m + 80) >> 3] = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 48) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 80) >> 3] + turbo.Runtime._mem_float64[(a + 96) >> 3] * turbo.Runtime._mem_float64[(b + 112) >> 3];
        turbo.Runtime._mem_float64[(m + 112) >> 3] = turbo.Runtime._mem_float64[(a + 104) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 112) >> 3] * turbo.Runtime._mem_float64[(b + 48) >> 3] + turbo.Runtime._mem_float64[(a + 120) >> 3] * turbo.Runtime._mem_float64[(b + 80) >> 3] + turbo.Runtime._mem_float64[(a + 128) >> 3] * turbo.Runtime._mem_float64[(b + 112) >> 3];
        turbo.Runtime._mem_float64[(m + 24) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 56) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 88) >> 3] + turbo.Runtime._mem_float64[(a + 32) >> 3] * turbo.Runtime._mem_float64[(b + 120) >> 3];
        turbo.Runtime._mem_float64[(m + 56) >> 3] = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 56) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 88) >> 3] + turbo.Runtime._mem_float64[(a + 64) >> 3] * turbo.Runtime._mem_float64[(b + 120) >> 3];
        turbo.Runtime._mem_float64[(m + 88) >> 3] = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 56) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 88) >> 3] + turbo.Runtime._mem_float64[(a + 96) >> 3] * turbo.Runtime._mem_float64[(b + 120) >> 3];
        turbo.Runtime._mem_float64[(m + 120) >> 3] = turbo.Runtime._mem_float64[(a + 104) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 112) >> 3] * turbo.Runtime._mem_float64[(b + 56) >> 3] + turbo.Runtime._mem_float64[(a + 120) >> 3] * turbo.Runtime._mem_float64[(b + 88) >> 3] + turbo.Runtime._mem_float64[(a + 128) >> 3] * turbo.Runtime._mem_float64[(b + 120) >> 3];
        turbo.Runtime._mem_float64[(m + 32) >> 3] = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 32) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 64) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 96) >> 3] + turbo.Runtime._mem_float64[(a + 32) >> 3] * turbo.Runtime._mem_float64[(b + 128) >> 3];
        turbo.Runtime._mem_float64[(m + 64) >> 3] = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 32) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 64) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 96) >> 3] + turbo.Runtime._mem_float64[(a + 64) >> 3] * turbo.Runtime._mem_float64[(b + 128) >> 3];
        turbo.Runtime._mem_float64[(m + 96) >> 3] = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 32) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 64) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 96) >> 3] + turbo.Runtime._mem_float64[(a + 96) >> 3] * turbo.Runtime._mem_float64[(b + 128) >> 3];
        turbo.Runtime._mem_float64[(m + 128) >> 3] = turbo.Runtime._mem_float64[(a + 104) >> 3] * turbo.Runtime._mem_float64[(b + 32) >> 3] + turbo.Runtime._mem_float64[(a + 112) >> 3] * turbo.Runtime._mem_float64[(b + 64) >> 3] + turbo.Runtime._mem_float64[(a + 120) >> 3] * turbo.Runtime._mem_float64[(b + 96) >> 3] + turbo.Runtime._mem_float64[(a + 128) >> 3] * turbo.Runtime._mem_float64[(b + 128) >> 3];
        return m;
    }

    static MulPosition(a:number, b:number, c?:number):number {
        let x:number = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 32) >> 3];
        let y:number = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 64) >> 3];
        let z:number = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3] + turbo.Runtime._mem_float64[(a + 96) >> 3];
        let ptr:number = c?c:Vector.initInstance(turbo.Runtime.allocOrThrow(32,8))();
        return Vector.Init_mem(ptr, x, y, z);
    }

    static MulDirection(a:number, b:number, c?:number):number {
        let x:number = turbo.Runtime._mem_float64[(a + 8) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 16) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 24) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3];
        let y:number = turbo.Runtime._mem_float64[(a + 40) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 48) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 56) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3];
        let z:number = turbo.Runtime._mem_float64[(a + 72) >> 3] * turbo.Runtime._mem_float64[(b + 8) >> 3] + turbo.Runtime._mem_float64[(a + 80) >> 3] * turbo.Runtime._mem_float64[(b + 16) >> 3] + turbo.Runtime._mem_float64[(a + 88) >> 3] * turbo.Runtime._mem_float64[(b + 24) >> 3];
        let ptr:number = c?c:Vector.initInstance(turbo.Runtime.allocOrThrow(32,8))();
        return Vector.Normalize_mem(Vector.Init_mem(ptr, x, y, z));
    }

    static MulRay(a:number, b:Ray):Ray {
        return ray(Matrix.MulPosition(a, b.Origin), Matrix.MulDirection(a, b.Direction));
    }

    static  MulBox(a:number, box:number, c?:number):number {
        let min:number = turbo.Runtime._mem_int32[(box + 4) >> 2];
        let max:number = turbo.Runtime._mem_int32[(box + 8) >> 2];
        // http://dev.theomader.com/transform-bounding-boxes/
        let r:number = Vector.Init_mem(Vector.initInstance(turbo.Runtime.allocOrThrow(32,8)), turbo.Runtime._mem_float64[(a + 8) >> 3], turbo.Runtime._mem_float64[(a + 40) >> 3], turbo.Runtime._mem_float64[(a + 72) >> 3]);
        let u:number = Vector.Init_mem(Vector.initInstance(turbo.Runtime.allocOrThrow(32,8)), turbo.Runtime._mem_float64[(a + 16) >> 3], turbo.Runtime._mem_float64[(a + 48) >> 3], turbo.Runtime._mem_float64[(a + 80) >> 3]);
        let b:number = Vector.Init_mem(Vector.initInstance(turbo.Runtime.allocOrThrow(32,8)), turbo.Runtime._mem_float64[(a + 24) >> 3], turbo.Runtime._mem_float64[(a + 56) >> 3], turbo.Runtime._mem_float64[(a + 88) >> 3]);
        let t:number = Vector.Init_mem(Vector.initInstance(turbo.Runtime.allocOrThrow(32,8)), turbo.Runtime._mem_float64[(a + 32) >> 3], turbo.Runtime._mem_float64[(a + 64) >> 3], turbo.Runtime._mem_float64[(a + 96) >> 3]);
        let xa:number = Vector.MulScalar_mem(r, turbo.Runtime._mem_float64[(min + 8) >> 3]);
        let xb:number = Vector.MulScalar_mem(r, turbo.Runtime._mem_float64[(max + 8) >> 3]);
        let ya:number = Vector.MulScalar_mem(u, turbo.Runtime._mem_float64[(min + 16) >> 3]);
        let yb:number = Vector.MulScalar_mem(u, turbo.Runtime._mem_float64[(max + 16) >> 3]);
        let za:number = Vector.MulScalar_mem(b, turbo.Runtime._mem_float64[(min + 24) >> 3]);
        let zb:number = Vector.MulScalar_mem(b, turbo.Runtime._mem_float64[(max + 24) >> 3]);
        xa = Vector.Min_mem(xa, xb, r);
        xb = Vector.Max_mem(xa, xb, u);
        ya = Vector.Min_mem(ya, yb, b);
        yb = Vector.Max_mem(ya, yb);
        za = Vector.Min_mem(za, zb);
        zb = Vector.Max_mem(za, zb);
        min = Vector.Add_mem(Vector.Add_mem(Vector.Add_mem(xa, ya), za),t);
        max = Vector.Add_mem(Vector.Add_mem(Vector.Add_mem(xb, yb), zb),t);
        let ptr = c?c:Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Box.Init_mem(ptr, min, max);
    }

    static Transpose(a:number, c?:number):number {
        let ptr = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        return Matrix.init(ptr,
            turbo.Runtime._mem_float64[(a + 8) >> 3], turbo.Runtime._mem_float64[(a + 40) >> 3], turbo.Runtime._mem_float64[(a + 72) >> 3], turbo.Runtime._mem_float64[(a + 104) >> 3],
            turbo.Runtime._mem_float64[(a + 16) >> 3], turbo.Runtime._mem_float64[(a + 48) >> 3], turbo.Runtime._mem_float64[(a + 80) >> 3], turbo.Runtime._mem_float64[(a + 112) >> 3],
            turbo.Runtime._mem_float64[(a + 24) >> 3], turbo.Runtime._mem_float64[(a + 56) >> 3], turbo.Runtime._mem_float64[(a + 88) >> 3], turbo.Runtime._mem_float64[(a + 120) >> 3],
            turbo.Runtime._mem_float64[(a + 32) >> 3], turbo.Runtime._mem_float64[(a + 64) >> 3], turbo.Runtime._mem_float64[(a + 96) >> 3], turbo.Runtime._mem_float64[(a + 128) >> 3]
        );
    }

    static Determinant(SELF:number):number {
        return (turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] +
        turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] +
        turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] +
        turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] +
        turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] +
        turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] -
        turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3])
    }

    static Inverse(SELF:number, c?:number):number {
        let m:number = c?c:Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
        let d:number = Matrix.Determinant(SELF);
        turbo.Runtime._mem_float64[(m + 8) >> 3] = (turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 16) >> 3] = (turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 24) >> 3] = (turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 32) >> 3] = (turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3] + turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 40) >> 3] = (turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 48) >> 3] = (turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 56) >> 3] = (turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 64) >> 3] = (turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 72) >> 3] = (turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 80) >> 3] = (turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 88) >> 3] = (turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 128) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 96) >> 3] = (turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] - turbo.Runtime._mem_float64[(SELF + 32) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 64) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 96) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 104) >> 3] = (turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 112) >> 3] = (turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] + turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 120) >> 3] = (turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 104) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 112) >> 3] + turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 120) >> 3]) / d
        turbo.Runtime._mem_float64[(m + 128) >> 3] = (turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] - turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 72) >> 3] + turbo.Runtime._mem_float64[(SELF + 24) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] - turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 56) >> 3]*turbo.Runtime._mem_float64[(SELF + 80) >> 3] - turbo.Runtime._mem_float64[(SELF + 16) >> 3]*turbo.Runtime._mem_float64[(SELF + 40) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3] + turbo.Runtime._mem_float64[(SELF + 8) >> 3]*turbo.Runtime._mem_float64[(SELF + 48) >> 3]*turbo.Runtime._mem_float64[(SELF + 88) >> 3]) / d
        return m
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=2093537; return SELF; }
}
turbo.Runtime._idToType[2093537] = Matrix;



