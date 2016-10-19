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
const height:number = 600;
const width:number = 800;
const RAW_MEMORY:ArrayBuffer = new SharedArrayBuffer(height*width*4 + 65536);
turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);

const shadows:boolean = true;		// Compute object shadows
const reflection:boolean = true;	// Compute object reflections
const reflection_depth:number = 2;
const antialias:boolean = false; // true;		// Antialias the image (expensive but pretty)

const debug:boolean = false;		// Progress printout, may confuse the consumer

const INF:number = 1e9;
const EPS:number = 1e-9;
const SENTINEL:number = 1e32;

function DL2(x:number, y:number) { return {x:x, y:y}; }
function DL3(x:number, y:number, z:number) { return {x:x, y:y, z:z}; }
function DL4(x:number, y:number, z:number, w:number) { return {x:x, y:y, z:z, w:w}; }
function F3(a:number, b:number, c:number) { return {a:a, b:b, c:c}; }
function RGB(r:number, g:number, b:number) { return {R:r, G:g, B:b}; }

const black = DL3(0,0,0);

function add(a, b) { return DL3(a.x+b.x, a.y+b.y, a.z+b.z); }
function addi(a, c) { return DL3(a.x+c, a.y+c, a.z+c); }
function sub(a, b) { return DL3(a.x-b.x, a.y-b.y, a.z-b.z); }
function subi(a, c) { return DL3(a.x-c, a.y-c, a.z-c); }
function muli(a, c) { return DL3(a.x*c, a.y*c, a.z*c); }
function divi(a, c) { return DL3(a.x/c, a.y/c, a.z/c); }
function neg(a) { return DL3(-a.x, -a.y, -a.z); }
function length(a) { return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z); }
function normalize(a) { var d = length(a); return DL3(a.x/d, a.y/d, a.z/d); }
function cross(a, b) { return DL3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x); }
function dot(a, b) { return a.x*b.x + a.y*b.y + a.z*b.z; }
function fract(f) { return f - Math.floor(f); }
function fract_add1(f) {
    let f1 = f - Math.floor(f);
    return f1 - Math.floor(f1 + 1);
}
function clampInt(x, lo, hi){
    if (x < lo) {return lo;}
    if (x > hi) {return hi;}
    return x;
}

interface RGBA {
    R:number,
    G:number,
    B:number,
    A:number
}

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

	static HexColor(hex:number):number {
		let R = ((hex >> 16) & 255 ) / 255;
		let G = ((hex >> 8) & 255) / 255;
		let B = (hex & 255) / 255;
        let c = RGB(R, G, B);
        let new_ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
		return Color.Pow_mem(Color.init(new_ptr, c), 2.2);
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
        return Color.init(Color.initInstance(turbo.Runtime.allocOrThrow(32,8)), RGB(red, green, blue));
    }
    static RGBA(SELF:number):RGBA {
        let _c:Uint8Array = new Uint8Array(3);
        _c[0] = Math.max(0, Math.min(255, turbo.Runtime._mem_float64[(SELF + 8) >> 3] * 255));
        _c[1] = Math.max(0, Math.min(255, turbo.Runtime._mem_float64[(SELF + 16) >> 3] * 255));
        _c[2] = Math.max(0, Math.min(255, turbo.Runtime._mem_float64[(SELF + 24) >> 3] * 255));
        return {R: _c[0], G: _c[1], B: _c[2], A: 255};
    }
    static RGBA64(SELF:number):RGBA {
        let _c:Uint16Array = new Uint16Array(3);
        _c[0] = Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 8) >> 3] * 65535));
        _c[1] = Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 16) >> 3] * 65535));
        _c[2] = Math.max(0, Math.min(65535, turbo.Runtime._mem_float64[(SELF + 24) >> 3] * 65535));
        return {R: _c[0], G: _c[1], B: _c[2], A: 65535};
    }
    
    static Add(A:RGBA, B:RGBA){return RGB(A.R + B.R, A.G + B.G, A.B + B.B);}

    static Add_mem(A:number, B:number, C?:number){
        //C = C?C:Color.init(Color.initInstance(turbo.Runtime.allocOrThrow(32,8)));
        if(C){
            C = C;
        }else{
            return Color.init(Color.initInstance(turbo.Runtime.allocOrThrow(32,8)), RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] + turbo.Runtime._mem_float64[(B + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3] + turbo.Runtime._mem_float64[(B + 16) >> 3], turbo.Runtime._mem_float64[(A + 24) >> 3] + turbo.Runtime._mem_float64[(B + 24) >> 3]));
        }
        // return RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] + turbo.Runtime._mem_float64[(B + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3] + turbo.Runtime._mem_float64[(B + 16) >> 3], turbo.Runtime._mem_float64[(A + 24) >> 3] + turbo.Runtime._mem_float64[(B + 24) >> 3]);
    }

    static Sub(A:RGBA, B:RGBA){return RGB(A.R - B.R, A.G - B.G, A.B - B.B);}
    static Sub_mem(A:number, B:number){
        return RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] - turbo.Runtime._mem_float64[(B + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3] - turbo.Runtime._mem_float64[(B + 16) >> 3], turbo.Runtime._mem_float64[(A + 24) >> 3] - turbo.Runtime._mem_float64[(B + 24) >> 3]);
    }
    
    static Mul(A:RGBA, B:RGBA){return RGB(A.R * B.R, A.G * B.G, A.B * B.B);}
    static Mul_mem(A:number, B:number) {
        return RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] * turbo.Runtime._mem_float64[(B + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3] * turbo.Runtime._mem_float64[(B + 16) >> 3], turbo.Runtime._mem_float64[(A + 24) >> 3] * turbo.Runtime._mem_float64[(B + 24) >> 3]);
    }

    static MulScalar(A:RGBA, f:number){return RGB(A.R * f, A.G * f, A.B * f);}
    static MulScalar_mem(A:number, f:number) {
        return RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] * f, turbo.Runtime._mem_float64[(A + 16) >> 3] * f, turbo.Runtime._mem_float64[(A + 24) >> 3] * f);
    }

    static DivScalar(A:RGBA, f:number){return RGB(A.R / f, A.G / f, A.B / f);}
    static DivScalar_mem(A:number, f:number) {
        return RGB(turbo.Runtime._mem_float64[(A + 8) >> 3] / f, turbo.Runtime._mem_float64[(A + 16) >> 3] / f, turbo.Runtime._mem_float64[(A + 24) >> 3] / f);
    }

    static Min(A:RGBA, B:RGBA) {return RGB( Math.min(A.R , B.R), Math.min(A.G , B.G), Math.min(A.B , B.B) );}
    static Min_mem(A:number, B:number) {
        return RGB( Math.min(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]), Math.min(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]), Math.min(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3]) );
    }

    static Max(A:RGBA, B:RGBA){return RGB( Math.max(A.R , B.R), Math.max(A.G , B.G), Math.max(A.B , B.B) );}
    static Max_mem(A:number, B:number){
        return RGB( Math.max(turbo.Runtime._mem_float64[(A + 8) >> 3] , turbo.Runtime._mem_float64[(B + 8) >> 3]), Math.max(turbo.Runtime._mem_float64[(A + 16) >> 3] , turbo.Runtime._mem_float64[(B + 16) >> 3]), Math.max(turbo.Runtime._mem_float64[(A + 24) >> 3] , turbo.Runtime._mem_float64[(B + 24) >> 3]) );
    }

    static MinComponent(A:RGBA):number {return Math.min(Math.min(A.R, A.G), A.B)}
    static MinComponent_mem(A:number) {
        return Math.min( Math.min(turbo.Runtime._mem_float64[(A + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3]), turbo.Runtime._mem_float64[(A + 24) >> 3] );
    }

    static MaxComponent(A:RGBA){ return Math.max(Math.max(A.R, A.G), A.B) }
    static MaxComponent_mem(A:number){
        return Math.max( Math.max(turbo.Runtime._mem_float64[(A + 8) >> 3], turbo.Runtime._mem_float64[(A + 16) >> 3]), turbo.Runtime._mem_float64[(A + 24) >> 3] );
    }

    static Pow(A:RGBA, f:number) {return RGB( Math.pow(A.R, f), Math.pow(A.G, f), Math.pow(A.B, f) );}
    static Pow_mem(A:number, f:number) {
        let SELF = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = (Math.pow(turbo.Runtime._mem_float64[(A + 8) >> 3], f)); 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = (Math.pow(turbo.Runtime._mem_float64[(A + 16) >> 3], f)); 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = (Math.pow(turbo.Runtime._mem_float64[(A + 24) >> 3], f)); 
        return SELF;
    }

    static Mix(A:RGBA, B:RGBA, pct:number) {
        let _a = Color.MulScalar(A, 1 - pct);
        let _b = Color.MulScalar(B, pct);
        return RGB(_a.R + _b.R, _a.G + _b.G, _a.B + _b.B);
    }
    static Mix_mem(A:number, B:number, pct:number) {
        let _a = Color.MulScalar_mem(A, 1 - pct);
        let _b = Color.MulScalar_mem(B, pct);
        return RGB(_a.R + _b.R, _a.G + _b.G, _a.B + _b.B);
    }
    static set(SELF, r:number, g:number, b:number) {
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = r; 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = g; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = b; 
        return SELF;
    }
    static Clone(SELF):number {
        return Color.init(SELF, RGB(turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3]));
    }


    static NewColor(color):number {
        return Color.init(Color.initInstance(turbo.Runtime.allocOrThrow(32,8)), color);
    }

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
        return Color.NewColor(RGB(Math.random(), Math.random(), Math.random()));
    }

    static RandomBrightColor():number {
        var i:number = Math.round(Math.random() * Color.BrightColors.length);
        return Color.BrightColors[i];
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=194603; return SELF; }
}
turbo.Runtime._idToType[194603] = Color;



