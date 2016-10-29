//turbo.js bundle
class MemoryObject {

   private _pointer:number;

   get pointer():number { return this._pointer; };

   constructor(p:number){
       this._pointer = (p | 0);
   }
}

namespace xray {
// Generated from /Users/d437814/workspace/x-ray-kernel/src/kernel/turbo/xray-kernel-turbo.tts by turbo.js 1.0.0; github.com/01alchemist/turbo.js

//Turbo module
type float32 = number;
type float64 = number;

const height:number = 600;
const width:number = 800;

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

/*
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

}*/


export enum Axis{
    AxisNone,
    AxisX,
    AxisY,
    AxisZ,
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
    
    static NewColor(color?,G:number = 0,B:number = 0):number {
        let ptr:number = Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        if(typeof color === "object"){
            return Color.init(ptr, color);
        }else{
            return Color.Init_mem(ptr, color, G, B);
        }
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

    static Clone(SELF:number, c?:number):number {
        let ptr:number = c?c:Color.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Color.Init_mem(ptr, turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3]);
    }

    static get BLACK():number{
        return Color.HexColor(0x000000);
    }
    static get WHITE():number {
        return Color.HexColor(0xFFFFFF);
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

    static NewVector(vector?,Y:number=0,Z:number=0):number {
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        if(typeof vector === "object"){
            return Vector.init(ptr, vector);
        }else{
            return Vector.Init_mem(ptr, vector, Y, Z);
        }
    }

    static ToJSON(SELF){
        return {
            X:turbo.Runtime._mem_float64[(SELF + 8) >> 3],
            Y:turbo.Runtime._mem_float64[(SELF + 16) >> 3],
            Z:turbo.Runtime._mem_float64[(SELF + 24) >> 3]
        };
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

    static ZERO:number = Vector.NewVector({X:0,Y:0,Y:0});
    static ONE:number = Vector.NewVector({X:1,Y:1,Y:1});
    static NegativeONE:number = Vector.NewVector({X:-1,Y:-1,Y:-1});

    static IsZero(a:number):boolean{
        return turbo.Runtime._mem_float64[(a + 8) >> 3] === 0 && turbo.Runtime._mem_float64[(a + 16) >> 3] === 0 && turbo.Runtime._mem_float64[(a + 24) >> 3] === 0;
    }

    static Set(SELF:number, X:number, Y:number, Z:number) {
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = X; 
         turbo.Runtime._mem_float64[(SELF + 16) >> 3] = Y; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = Z; 
        return SELF;
    }

    static Clone(SELF:number, c?:number):number {
        let ptr:number = c?c:Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Init_mem(ptr, turbo.Runtime._mem_float64[(SELF + 8) >> 3], turbo.Runtime._mem_float64[(SELF + 16) >> 3], turbo.Runtime._mem_float64[(SELF + 24) >> 3]);
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=1266219; return SELF; }
}
turbo.Runtime._idToType[1266219] = Vector;


export class Utils {

    static Radians(degrees:number):number {
        return degrees * Math.PI / 180
    }

    static Degrees(radians:number):number {
        return radians * 180 / Math.PI
    }

    static Cone(direction:number /*Vector*/, theta:number, u:number, v:number):number /*Vector*/ {
        if (theta < EPS) {
            return direction;
        }
        theta = theta * (1 - (2 * Math.acos(u) / Math.PI));
        let m1 = Math.sin(theta);
        let m2 = Math.cos(theta);
        let a = v * 2 * Math.PI;
        let q = Vector.RandomUnitVector();
        let s = Vector.Cross_mem(direction, q);
        let t = Vector.Cross_mem(direction, s);
        let d = Vector.NewVector();
        d = Vector.Add_mem(d, Vector.MulScalar_mem(s, m1 * Math.cos(a)));
        d = Vector.Add_mem(d, Vector.MulScalar_mem(t, m1 * Math.sin(a)));
        d = Vector.Add_mem(d, Vector.MulScalar_mem(direction, m2));
        d = Vector.Normalize_mem(d);
        return d;
    }
    
    static LoadImage(path:string):number /*Image*/ {
        //TODO: load image using img tag and canvas
        return null;
    }

    static SavePNG(path:string, im:number /*Image*/):boolean {
        //TODO: save using file
        return null;
    }

    static Median(items:number[]):number {
        let n = items.length;
        if (n == 0) {
            return 0
        } else if (n % 2 == 1) {
            return items[n / 2]
        } else {
            let a = items[n / 2 - 1];
            let b = items[n / 2];
            return (a + b) / 2
        }
    }

    static DurationString(t:number/*milliseconds*/):string {
        let d:Date = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(t);
        return d.toLocaleTimeString();
    }

    static NumberString(x:number):string {
        let suffixes = ["", "k", "M", "G"];

        suffixes.forEach((suffix) => {
            if (x < 1000) {
                return x + suffix;
            }
            x /= 1000
        });

        return x + "T";
    }

    static ParseFloats(items:string[]):number[] {
        let result:number[] = [];

        items.forEach((item) => {
            result.push(parseFloat(item));
        });
        return result;
    }

    static ParseInts(items:string[]):number[] {
        let result:number[] = [];

        items.forEach((item) => {
            result.push(parseInt(item));
        });
        return result;
    }

    static Fract(x:number):number {
        return x - Math.floor(x);
    }

    static FractAddOne(x:number):number {
        let f1 = x - Math.floor(x);
        return f1 - Math.floor(f1 + 1);
    }

    static  Modf(f):{int:number,frac:number} {
        var int = Math.floor(f);
        var frac = f - int;
        return {int: int, frac: frac};
    }

    static Clamp(x:number, lo:number, hi:number):number {
        if (x < lo) {
            return lo;
        }
        if (x > hi) {
            return hi;
        }
        return x;
    }

    static ClampInt(x:number, lo:number, hi:number):number {
        if (x < lo) {
            return lo;
        }
        if (x > hi) {
            return hi;
        }
        return x;
    }

    static append(slice:Array<any>, ...elements):Array<any>{
        if (slice == undefined) {
            return elements;
        } else {
            slice.push.apply(slice, elements);
        }
        return slice;
    }

    static sortAscending(slice) {
        slice.sort(function (a, b) {
            return a - b;
        });
    }

    static sortDescending(slice) {
        slice.sort(function (a, b) {
            return b - a;
        });
    }
}

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

    static init(SELF, min:XYZ = xyz(0,0,0), max:XYZ= xyz(0,0,0)){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = (Vector.NewVector(min)); 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = (Vector.NewVector(max)); 
        return SELF;
	}

    static Init_mem(SELF, min:number, max:number){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = min; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = max; 
        return SELF;
	}

    static NewBox(min?:number, max?:number){
        let SELF = Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = (min?min:Vector.NewVector()); 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = (max?max:Vector.NewVector()); 
        return SELF;
	}

    static ToJSON(SELF){
        return {
            min:Vector.ToJSON(turbo.Runtime._mem_int32[(SELF + 4) >> 2]),
            max:Vector.ToJSON(turbo.Runtime._mem_int32[(SELF + 8) >> 2])
        };
	}
    
	static BoxForShapes(shapes:number, numShapes:number):number{
		if(numShapes == 0) {
			return Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
		}
		let box = Shape.BoundingBox(turbo.Runtime._mem_int32[(  shapes+4*0) >> 2]);

		for(let i:number = 0; i < numShapes; i++){
			let shape:number = turbo.Runtime._mem_int32[(  shapes+4*i) >> 2];
			box = Box.Extend(box, Shape.BoundingBox(shape));
		}
		return box
	}

	static BoxForTriangles(shapes:number, numShapes:number):number {
        if(numShapes == 0) {
            return Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
        }
        let box = Triangle.BoundingBox(turbo.Runtime._mem_int32[(  shapes+4*0) >> 2]);

        for(let i:number = 0; i < numShapes; i++){
            let shape:number = turbo.Runtime._mem_int32[(  shapes+4*i) >> 2];
            box = Box.Extend(box, Triangle.BoundingBox(shape));
        }
        return box
	}

	static Anchor(SELF, anchor:number):number {
		return Vector.Add_mem(turbo.Runtime._mem_int32[(SELF + 4) >> 2], Vector.Mul_mem(Box.Size(SELF), anchor));
	}

	static Center(SELF):number {
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
		return Box.Anchor(SELF, Vector.init(ptr, 0.5, 0.5, 0.5));
	}

	static OuterRadius(SELF):number {
		return Vector.Length_mem(Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 4) >> 2], Box.Center(SELF)));
	}

	static InnerRadius(SELF):number {
		return Vector.MaxComponent_mem(Vector.Sub_mem(Box.Center(SELF), turbo.Runtime._mem_int32[(SELF + 4) >> 2]));
	}

	static Size(SELF):number {
		return Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 8) >> 2], turbo.Runtime._mem_int32[(SELF + 4) >> 2]);
	}

	static Extend(SELF, b:number):number{
        //let ptr:number = Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
		return Box.Init_mem(SELF, Vector.Min(turbo.Runtime._mem_int32[(SELF + 4) >> 2], turbo.Runtime._mem_int32[(b + 4) >> 2]), Vector.Max(turbo.Runtime._mem_int32[(SELF + 8) >> 2], turbo.Runtime._mem_int32[(b + 8) >> 2]));
	}

	static Contains(SELF , b:number):boolean{

        let a_min = turbo.Runtime._mem_int32[(SELF + 4) >> 2];
        let a_max = turbo.Runtime._mem_int32[(SELF + 8) >> 2];

		return turbo.Runtime._mem_float64[((a_min) + 8) >> 3] <= turbo.Runtime._mem_float64[(b + 8) >> 3] && turbo.Runtime._mem_float64[((a_max) + 8) >> 3] >= turbo.Runtime._mem_float64[(b + 8) >> 3] &&
			turbo.Runtime._mem_float64[((a_min) + 16) >> 3] <= turbo.Runtime._mem_float64[(b + 16) >> 3] && turbo.Runtime._mem_float64[((a_max) + 16) >> 3] >= turbo.Runtime._mem_float64[(b + 16) >> 3] &&
			turbo.Runtime._mem_float64[((a_min) + 24) >> 3] <= turbo.Runtime._mem_float64[(b + 24) >> 3] && turbo.Runtime._mem_float64[((a_max) + 24) >> 3] >= turbo.Runtime._mem_float64[(b + 24) >> 3];
	}

	static Intersects(a:number, b:number):boolean {
        let a_min = turbo.Runtime._mem_int32[(a + 4) >> 2];
        let a_max = turbo.Runtime._mem_int32[(a + 8) >> 2];
        let b_min = turbo.Runtime._mem_int32[(b + 4) >> 2];
        let b_max = turbo.Runtime._mem_int32[(b + 8) >> 2];

		return !(turbo.Runtime._mem_float64[((a_min) + 8) >> 3] > turbo.Runtime._mem_float64[((b_max) + 8) >> 3] || turbo.Runtime._mem_float64[((a_max) + 8) >> 3] < turbo.Runtime._mem_float64[((b_min) + 8) >> 3] || turbo.Runtime._mem_float64[((a_min) + 16) >> 3] > turbo.Runtime._mem_float64[((b_max) + 16) >> 3] ||
		turbo.Runtime._mem_float64[((a_max) + 16) >> 3] < turbo.Runtime._mem_float64[((b_min) + 16) >> 3] || turbo.Runtime._mem_float64[((a_min) + 24) >> 3] > turbo.Runtime._mem_float64[((b_max) + 24) >> 3] || turbo.Runtime._mem_float64[((a_max) + 24) >> 3] < turbo.Runtime._mem_float64[((b_min) + 24) >> 3]);
	}

	static Intersect(SELF, r:number):{tmax:number, tmin:number} {

        let min = turbo.Runtime._mem_int32[(SELF + 4) >> 2];
        let max = turbo.Runtime._mem_int32[(SELF + 8) >> 2];
        let origin = turbo.Runtime._mem_int32[(r + 4) >> 2];
        let dir = turbo.Runtime._mem_int32[(r + 8) >> 2];

		let x1 = (turbo.Runtime._mem_float64[(min + 8) >> 3] - turbo.Runtime._mem_float64[(origin + 8) >> 3]) / turbo.Runtime._mem_float64[(dir + 8) >> 3];
        let y1 = (turbo.Runtime._mem_float64[(min + 16) >> 3] - turbo.Runtime._mem_float64[(origin + 16) >> 3]) / turbo.Runtime._mem_float64[(dir + 16) >> 3];
        let z1 = (turbo.Runtime._mem_float64[(min + 24) >> 3] - turbo.Runtime._mem_float64[(origin + 24) >> 3]) / turbo.Runtime._mem_float64[(dir + 24) >> 3];
        let x2 = (turbo.Runtime._mem_float64[(max + 8) >> 3] - turbo.Runtime._mem_float64[(origin + 8) >> 3]) / turbo.Runtime._mem_float64[(dir + 8) >> 3];
        let y2 = (turbo.Runtime._mem_float64[(max + 16) >> 3] - turbo.Runtime._mem_float64[(origin + 16) >> 3]) / turbo.Runtime._mem_float64[(dir + 16) >> 3];
        let z2 = (turbo.Runtime._mem_float64[(max + 24) >> 3] - turbo.Runtime._mem_float64[(origin + 24) >> 3]) / turbo.Runtime._mem_float64[(dir + 24) >> 3];
        let tmp;
		if (x1 > x2) {
            tmp = x1;
			x1 = x2;
            x2 = tmp;
		}
		if (y1 > y2) {
			tmp = y1;
			y1 = y2;
            y2 = tmp
		}
		if (z1 > z2) {
            tmp = z1;
            z1 = z2;
            z2 = tmp
		}
		return {
            tmax: Math.max(Math.max(x1, y1), z1),
		    tmin: Math.min(Math.min(x2, y2), z2)
        }
	}

	static Partition(SELF, axis:Axis, point:number): {left:boolean, right:boolean} {
        let min = turbo.Runtime._mem_int32[(SELF + 4) >> 2];
        let max = turbo.Runtime._mem_int32[(SELF + 8) >> 2];
        let left;
        let right;
		switch (axis) {
			case Axis.AxisX:
				left = turbo.Runtime._mem_float64[(min + 8) >> 3] <= point;
				right = turbo.Runtime._mem_float64[(max + 8) >> 3] >= point;
                break;
			case Axis.AxisY:
				left = turbo.Runtime._mem_float64[(min + 16) >> 3] <= point;
				right = turbo.Runtime._mem_float64[(max + 16) >> 3] >= point;
                break;
			case Axis.AxisZ:
				left = turbo.Runtime._mem_float64[(min + 24) >> 3] <= point;
				right = turbo.Runtime._mem_float64[(min + 24) >> 3] >= point;
                break;
		}
		return {
            left :left,
            right:right
        };
	}
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=1841; return SELF; }
}
turbo.Runtime._idToType[1841] = Box;



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

    static Scale(m:number, v:number, c?:number):number{
        return Matrix.Mul(m, Matrix.ScaleUnitMatrix(v), c);
    }

    static Rotate(m:number, v:number, a:number, c?:number):number {
        return Matrix.Mul(m, Matrix.RotateUnitMatrix(v, a), c);
    }

    static Frustum(m:number, l:number, r:number, b:number, t:number, n:number, f:number, c?:number):number {
        return Matrix.Mul(m, Matrix.FrustumUnitMatrix(l, r, b, t, n, f, c), c);
    }

    static Orthographic(m:number, l:number, r:number, b:number, t:number, n:number, f:number, c?:number):number {
        return Matrix.Mul(m, Matrix.OrthographicUnitMatrix(l, r, b, t, n, f, c), c);
    }

    static Perspective(m:number, fovy:number, aspect:number, near:number, far:number, c?:number):number {
        return Matrix.Mul(m, Matrix.PerspectiveUnitMatrix(fovy, aspect, near, far, c), c);
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

    static MulRay(a:number, b:number):number {
        let ptr:number = Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Ray.init(ptr, Matrix.MulPosition(a, turbo.Runtime._mem_int32[(b + 4) >> 2]), Matrix.MulDirection(a, turbo.Runtime._mem_int32[(b + 8) >> 2]));
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

export class Texture extends MemoryObject{
   static NAME:string = "Texture";
   static SIZE:number = 20;
   static ALIGN:number = 4;
   static CLSID:number = 10502342;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, width:number, height:number, data:number){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = width; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = height; 
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = data; 
    }

    static textures:any = [];

    static GetTexture(path:string):number {

        let texture = Texture.textures[path];
        if(texture) {
            return texture;
        }
        texture = Texture.LoadTexture(path);
        if(texture){
            Texture.textures[path] = texture;
            return texture
        }
        return null;
    }

    static LoadTexture(path:string):number {
        console.log("Loading IMG: "+ path);
        let im = Utils.LoadImage(path);
        return Texture.NewTexture(im);
    }

    static NewTexture(im:number /*Image*/):number /*Texture*/{
        let size:number = turbo.Runtime._mem_int32[((Image.Bounds(im)) + 8) >> 2];
        let data:number = turbo.Runtime.allocOrThrow( (4 * (turbo.Runtime._mem_float64[(size + 8) >> 3] * turbo.Runtime._mem_float64[(size + 16) >> 3])), 4) /*Array*/;
        for (let y:number = 0; y < turbo.Runtime._mem_float64[(size + 16) >> 3]; y++) {
            for (let x:number = 0; x < turbo.Runtime._mem_float64[(size + 8) >> 3]; x++) {
                let index = y * turbo.Runtime._mem_float64[(size + 8) >> 3] + x;
                turbo.Runtime._mem_int32[(  data+4*index) >> 2] = (Color.Pow(Image.At(im, x, y), 2.2));
            }
        }
        let ptr:number = Texture.initInstance(turbo.Runtime.allocOrThrow(20,4));
        return Texture.init(ptr, turbo.Runtime._mem_float64[(size + 8) >> 3], turbo.Runtime._mem_float64[(size + 16) >> 3], data);
    }

    Pow(t:number, a:number):number {
        let data:number = turbo.Runtime._mem_int32[(t + 16) >> 2];
        let len:number = turbo.Runtime._mem_int32[(t + 12) >> 2];

        for (let i:number = 0; i < len; i++) {
            let d = turbo.Runtime._mem_int32[(  data+4*i) >> 2];
            Color.Pow_mem(d, a, d);
        }
        return t;
    }

    static MulScalar(t:number, a:number):number{
        let data:number = turbo.Runtime._mem_int32[(t + 16) >> 2];
        let len:number = turbo.Runtime._mem_int32[(t + 12) >> 2];

        for (let i:number = 0; i < len; i++) {
            let d = turbo.Runtime._mem_int32[(  data+4*i) >> 2];
            Color.MulScalar_mem(d, a, d);
        }
        return t;
    }

    static bilinearSample(t:number, u:number, v:number):number{
        let Width:number = turbo.Runtime._mem_int32[(t + 4) >> 2];
        let Height:number = turbo.Runtime._mem_int32[(t + 8) >> 2];
        let data:number = turbo.Runtime._mem_int32[(t + 16) >> 2];

        let w:number = Width - 1;
        let h:number = Height - 1;
        
        let _ = Utils.Modf(u * w);
        
        let X = _.int;
        let x = _.frac;
        _ = Utils.Modf(v * h);
        let Y = _.int;
        let y = _.frac;

        let x0:number = parseInt(X);
        let y0:number = parseInt(Y);
        let x1:number = x0 + 1;
        let y1:number = y0 + 1;
        let c00:number = turbo.Runtime._mem_int32[(  data+4*(y0 * Width + x0)) >> 2];
        let c01:number = turbo.Runtime._mem_int32[(  data+4*(y1 * Width + x0)) >> 2];
        let c10:number = turbo.Runtime._mem_int32[(  data+4*(y0 * Width + x1)) >> 2];
        let c11:number = turbo.Runtime._mem_int32[(  data+4*(y1 * Width + x1)) >> 2];
        let c:number = Color.BLACK;
        c = Color.Add_mem(c, Color.MulScalar_mem(c00, (1 - x) * (1 - y)));
        c = Color.Add_mem(c, Color.MulScalar_mem(c10, x * (1 - y)));
        c = Color.Add_mem(c, Color.MulScalar_mem(c01, (1 - x) * y));
        c = Color.Add_mem(c, Color.MulScalar_mem(c11, x * y));
        return c;
    }


    static Sample(t:number, u:number, v:number):number {
        u = Utils.FractAddOne(u);
        v = Utils.FractAddOne(v);
        return Texture.bilinearSample(t, u, 1-v);
    }

    static NormalSample(t:number, u:number, v:number, c?:number):number {
        let c = Texture.Sample(t, u, v);
        let ptr:number = c?c:Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Normalize_mem(Vector.Init_mem(ptr, turbo.Runtime._mem_float64[(c + 8) >> 3] * 2 - 1, turbo.Runtime._mem_float64[(c + 16) >> 3] * 2 - 1, turbo.Runtime._mem_float64[(c + 24) >> 3] * 2 - 1), ptr);
    }

    static BumpSample(t:number, u:number, v:number, c?:number):number {
        let Width:number = turbo.Runtime._mem_int32[(t + 4) >> 2];
        let Height:number = turbo.Runtime._mem_int32[(t + 8) >> 2];
        let data:number = turbo.Runtime._mem_int32[(t + 16) >> 2];
        u = Utils.FractAddOne(u);
        v = Utils.FractAddOne(v);
        v = 1 - v;
        let x:number = parseInt(u * Width);
        let y:number = parseInt(v * Height);
        let x1 = Utils.ClampInt(x-1, 0, Width-1);
        let x2 = Utils.ClampInt(x+1, 0, Width-1);
        let y1 = Utils.ClampInt(y-1, 0, Height-1);
        let y2 = Utils.ClampInt(y+1, 0, Height-1);
        let cx = Color.Sub_mem(turbo.Runtime._mem_int32[(  data+4*(y * Width + x1)) >> 2], turbo.Runtime._mem_int32[(  data+4*(y * Width + x2)) >> 2]);
        let cy = Color.Sub_mem(turbo.Runtime._mem_int32[(  data+4*(y1 * Width + x)) >> 2], turbo.Runtime._mem_int32[(  data+4*(y2 * Width + x)) >> 2]);
        let ptr:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Vector.Init_mem(ptr, turbo.Runtime._mem_float64[(cx + 8) >> 3], turbo.Runtime._mem_float64[(cy + 8) >> 3], 0);
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=10502342; return SELF; }
}
turbo.Runtime._idToType[10502342] = Texture;


export class Material extends MemoryObject{
   static NAME:string = "Material";
   static SIZE:number = 73;
   static ALIGN:number = 8;
   static CLSID:number = 167722613;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, Color, Texture, NormalTexture, BumpTexture, GlossTexture, BumpMultiplier, Emittance, Index, Gloss, Tint, Reflectivity, Transparent){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = Color; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = Texture; 
         turbo.Runtime._mem_int32[(SELF + 12) >> 2] = NormalTexture; 
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = BumpTexture; 
         turbo.Runtime._mem_int32[(SELF + 20) >> 2] = GlossTexture; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = BumpMultiplier; 
         turbo.Runtime._mem_float64[(SELF + 32) >> 3] = Emittance; 
         turbo.Runtime._mem_float64[(SELF + 40) >> 3] = Index; 
         turbo.Runtime._mem_float64[(SELF + 48) >> 3] = Gloss; 
         turbo.Runtime._mem_float64[(SELF + 56) >> 3] = Tint; 
         turbo.Runtime._mem_float64[(SELF + 64) >> 3] = Reflectivity; 
         turbo.Runtime._mem_uint8[(SELF + 72) >> 0] = Transparent; 
    }

    static Clone(SELF, c?:number):number {
        let ptr:number = c?c:Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr,
            Color.Clone(turbo.Runtime._mem_int32[(SELF + 4) >> 2]),
            turbo.Runtime._mem_int32[(SELF + 8) >> 2],
            turbo.Runtime._mem_int32[(SELF + 12) >> 2],
            turbo.Runtime._mem_int32[(SELF + 16) >> 2],
            turbo.Runtime._mem_int32[(SELF + 20) >> 2],
            turbo.Runtime._mem_float64[(SELF + 24) >> 3],
            turbo.Runtime._mem_float64[(SELF + 32) >> 3],
            turbo.Runtime._mem_float64[(SELF + 40) >> 3],
            turbo.Runtime._mem_float64[(SELF + 48) >> 3],
            turbo.Runtime._mem_float64[(SELF + 56) >> 3],
            turbo.Runtime._mem_float64[(SELF + 64) >> 3],
            turbo.Runtime._mem_uint8[(SELF + 72) >> 0]
        );
    }

    static DiffuseMaterial(color:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, 0, 1, 0, 0, -1, false);
    }

    static SpecularMaterial(color:number, index:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, 0, index, 0, 0, -1, false);
    }

    static GlossyMaterial(color:number, index:number, gloss:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, 0, index, gloss, 0, -1, false);
    }

    static ClearMaterial(index:number, gloss:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, Color.BLACK, null, null, null, null, 1, 0, index, gloss, 0, -1, true);
    }

    static TransparentMaterial(color:number, index:number, gloss:number, tint:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, 0, index, gloss, tint, -1, true);
    }

    static MetallicMaterial(color:number, gloss:number, tint:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, 0, 1, gloss, tint, -1, false);
    }

    static LightMaterial(color:number, emittance:number):number{
        let ptr:number = Material.initInstance(turbo.Runtime.allocOrThrow(73,8));
        return Material.init(ptr, color, null, null, null, null, 1, emittance, 1, 0, 0, -1, false);
    }

    static MaterialAt(shape:number, point:number):number{
        let material:number = Shape.MaterialAt(shape, point);
        let uv:number = Shape.UV(shape, point);
        if (turbo.Runtime._mem_int32[(material + 8) >> 2] != null) {
            turbo.Runtime._mem_int32[(material + 4) >> 2] = Texture.Sample(turbo.Runtime._mem_int32[(material + 8) >> 2], turbo.Runtime._mem_float64[(uv + 8) >> 3], turbo.Runtime._mem_float64[(uv + 16) >> 3]);
        }
        if (turbo.Runtime._mem_int32[(material + 20) >> 2] != null) {
            let c:number = Texture.Sample(turbo.Runtime._mem_int32[(material + 20) >> 2], turbo.Runtime._mem_float64[(uv + 8) >> 3], turbo.Runtime._mem_float64[(uv + 16) >> 3]);
            turbo.Runtime._mem_float64[(material + 48) >> 3] = (turbo.Runtime._mem_float64[(c + 8) >> 3] + turbo.Runtime._mem_float64[(c + 16) >> 3] + turbo.Runtime._mem_float64[(c + 24) >> 3]) / 3;
        }
        return material;
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=167722613; return SELF; }
}
turbo.Runtime._idToType[167722613] = Material;

export class Ray extends MemoryObject{
   static NAME:string = "Ray";
   static SIZE:number = 12;
   static ALIGN:number = 4;
   static CLSID:number = 674;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, origin:number, direction:number):number{
		 turbo.Runtime._mem_int32[(SELF + 4) >> 2] = origin; 
		 turbo.Runtime._mem_int32[(SELF + 8) >> 2] = direction; 
		return SELF;
	}

	static Position(r:number, t:number):number{
		return Vector.Add_mem(turbo.Runtime._mem_int32[(r + 4) >> 2], Vector.MulScalar_mem(turbo.Runtime._mem_int32[(r + 8) >> 2], t));
	}

	static Reflect(n:number, i:number, r?:number):number{
		r = r?r:Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
		return Ray.init(r, turbo.Runtime._mem_int32[(n + 4) >> 2], Vector.Reflect_mem(turbo.Runtime._mem_int32[(n + 8) >> 2], turbo.Runtime._mem_int32[(i + 8) >> 2]) );
	}

    static Refract(n:number, i:number, n1:number, n2:number, r?:number):number{
        r = r?r:Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Ray.init(r, turbo.Runtime._mem_int32[(n + 4) >> 2], Vector.Refract_mem(turbo.Runtime._mem_int32[(n + 8) >> 2], turbo.Runtime._mem_int32[(i + 8) >> 2], n1, n2) );
    }

    static Reflectance(n:number, i:number, n1:number, n2:number):number{
        return Vector.Reflectance_mem(turbo.Runtime._mem_int32[(n + 8) >> 2], turbo.Runtime._mem_int32[(i + 8) >> 2], n1, n2);
    }

    static WeightedBounce(r:number, u:number, v:number, c?:number):number{
        c = c?c:Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        let radius:number = Math.sqrt(u);
        let theta:number = 2 * Math.PI * v;
        let s:number = Vector.Normalize_mem(Vector.Cross_mem(turbo.Runtime._mem_int32[(r + 8) >> 2], Vector.RandomUnitVector()));
        let t:number = Vector.Cross_mem(turbo.Runtime._mem_int32[(r + 8) >> 2], s);
        let d:number = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        Vector.Add_mem(d, Vector.MulScalar_mem(s, radius * Math.cos(theta)), d);
        Vector.Add_mem(d, Vector.MulScalar_mem(t, radius * Math.sin(theta)), d);
        Vector.Add_mem(d, Vector.MulScalar_mem(r, Math.sqrt(1 - u)), d);
        return Ray.init(c, turbo.Runtime._mem_int32[(r + 4) >> 2], d);
    }

    static ConeBounce(r:number, theta:number, u:number, v:number, c?:number):number{
        c = c?c:Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Ray.init(c, turbo.Runtime._mem_int32[(r + 4) >> 2], Cone(turbo.Runtime._mem_int32[(r + 8) >> 2], theta, u, v));
    }

    static Bounce(i:number, info:HitInfo, u:number, v:number, bounceType:BounceType):{ray:number, reflected:boolean, coefficient:number} {
        let n = info.Ray;
        let material = info.Material;
        let n1 = 1.0;
        let n2 = turbo.Runtime._mem_float64[(material + 40) >> 3];

        if(info.Inside){
            let tmp = n1;
            n1 = n2;
            n2 = tmp;
        }

        let p:number;

        if(turbo.Runtime._mem_float64[(material + 64) >> 3] >= 0) {
            p = turbo.Runtime._mem_float64[(material + 64) >> 3];
        }else{
            p = Ray.Reflectance(n, i, n1, n2);
        }

        let reflect:boolean;

        switch (bounceType){
            case BounceType.Any:
                reflect = Math.random() < p;
                break;
            case BounceType.Diffuse:
                reflect = false;
                break;
            case BounceType.Specular:
                reflect = true;
                break;
        }
        if(reflect) {
            let reflected:number = Ray.Reflect(n, i);
            return { ray: Ray.ConeBounce(reflected, turbo.Runtime._mem_float64[(material + 48) >> 3], u, v), reflected:true, coefficient:p };
        } else if (turbo.Runtime._mem_uint8[(material + 72) >> 0]) {
            let refracted:number = Ray.Refract(n, i, n1, n2);
            turbo.Runtime._mem_int32[(refracted + 4) >> 2] = Vector.Add(turbo.Runtime._mem_int32[(refracted + 4) >> 2], Vector.MulScalar(turbo.Runtime._mem_int32[(refracted + 8) >> 2], 1e-4));
            return { ray: Ray.ConeBounce(refracted, turbo.Runtime._mem_float64[(material + 48) >> 3], u, v), reflected: true, coefficient: 1 - p };
        } else {
            return { ray: Ray.WeightedBounce(n, u, v), reflected: false, coefficient: 1 - p };
        }
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=674; return SELF; }
}
turbo.Runtime._idToType[674] = Ray;

interface Hit{
    Shape:number;
}
interface Ray{

}

export enum ShapeType{
    Volume,
    SDFShape
}

export class Shape extends MemoryObject{
   static NAME:string = "Shape";
   static SIZE:number = 8;
   static ALIGN:number = 4;
   static CLSID:number = 255446;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, id):number{
         turbo.Runtime._mem_uint32[(SELF + 4) >> 2] = id; 
		return SELF;
	}
    static Compile_impl(SELF:number, c?:number){
		throw "Pure: Shape.Compile()";
	}
    static BoundingBox_impl(SELF:number, c?:number):number{
		throw "Pure: Shape.BoundingBox()";
	}
    static Intersect_impl(SELF:number, ray:Ray, c?:number):Hit{
		throw "Pure: Shape.Intersect()";
	}
    static UV_impl(SELF:number, p:number, c?:number):number{
		throw "Pure: Shape.UV()";
	}
    static NormalAt_impl(SELF:number, p:number, c?:number):number{
		throw "Pure: Shape.NormalAt()";
	}
    static MaterialAt_impl(SELF:number, p:number, c?:number):number{
		throw "Pure: Shape.MaterialAt()";
	}
    static Compile(SELF , c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
            case 232773086:
                return Shape.Compile_impl(SELF , c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static BoundingBox(SELF , c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
                return Shape.BoundingBox_impl(SELF , c);
            case 232773086:
                return Triangle.BoundingBox_impl(SELF , c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static Intersect(SELF , ray,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
            case 232773086:
                return Shape.Intersect_impl(SELF , ray,c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static UV(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
            case 232773086:
                return Shape.UV_impl(SELF , p,c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static NormalAt(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
            case 232773086:
                return Shape.NormalAt_impl(SELF , p,c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static MaterialAt(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 255446:
            case 232773086:
                return Shape.MaterialAt_impl(SELF , p,c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=255446; return SELF; }
}
turbo.Runtime._idToType[255446] = Shape;

export class TransformedShape extends MemoryObject{
   static NAME:string = "TransformedShape";
   static SIZE:number = 16;
   static ALIGN:number = 4;
   static CLSID:number = 245094204;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF:number, shape:number){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = shape; 
		return SELF;
	}

	static NewTransformedShape(s:number, m:number):number {
		return TransformedShape.init(TransformedShape.initInstance(turbo.Runtime.allocOrThrow(16,4)), s, m, Matrix.Inverse(m));
	}

	static BoundingBox(s:TransformedShape):Box {
		return Matrix.MulBox(s, Shape.BoundingBox(s));
	}

	static Intersect(s:number, r:Ray):Hit {
		let shapeRay = Matrix.MulRay(turbo.Runtime._mem_int32[(s + 12) >> 2], r);
		let hit = Shape.Intersect(s, shapeRay);
		if (!hit.Ok()) {
			return hit;
		}
		let shape:number = hit.Shape;
		let shapePosition = Ray.Position(shapeRay, hit.T);
		let shapeNormal = Shape.NormalAt(shape, shapePosition);
		let position = Matrix.MulPosition(s, shapePosition);
		let normal = Matrix.MulDirection(Matrix.Transpose(Matrix.Inverse(s)), shapeNormal);
		let material = Material.MaterialAt(shape, shapePosition);
		let inside = false;
		if (shapeNormal.Dot(shapeRay.Direction) > 0) {
			Vector.Negate_mem(normal, normal);
			inside = true;
		}
		let ray:number = Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        Ray.init(ray, position, normal);
		let info = new HitInfo(shape, position, normal, ray, material, inside);
		hit.T = Vector.Length(Vector.Sub_mem(position, turbo.Runtime._mem_int32[(r + 4) >> 2]));
		hit.HitInfo = info;
		return hit;
	}
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=245094204; return SELF; }
}
turbo.Runtime._idToType[245094204] = TransformedShape;

export class Node extends MemoryObject{
   static NAME:string = "Node";
   static SIZE:number = 32;
   static ALIGN:number = 8;
   static CLSID:number = 20726;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, axis:number, point:number, shapes:number, numShapes:number, left:number, right:number):number{
         turbo.Runtime._mem_uint8[(SELF + 4) >> 0] = axis; 
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = point; 
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = shapes; 
         turbo.Runtime._mem_int32[(SELF + 20) >> 2] = numShapes; 
         turbo.Runtime._mem_int32[(SELF + 24) >> 2] = left; 
         turbo.Runtime._mem_int32[(SELF + 28) >> 2] = right; 
        return SELF;
    }

    static NewNode(shapes:number, numShapes:number):number {
        let ptr:number = Node.initInstance(turbo.Runtime.allocOrThrow(32,8));
        return Node.init(ptr, Axis.AxisNone, 0, shapes, numShapes, null, null);
    }

    static Intersect(SELF, r:number, tmin:number, tmax:number):Hit {
        let tsplit:number;
        let leftFirst:boolean;

        let ori = turbo.Runtime._mem_int32[(r + 4) >> 2];
        let dir = turbo.Runtime._mem_int32[(r + 8) >> 2];

        switch (turbo.Runtime._mem_uint8[(SELF + 4) >> 0]) {
            case Axis.AxisNone:
                return Node.IntersectShapes(SELF, r);
            case Axis.AxisX:
                tsplit = (turbo.Runtime._mem_float64[(SELF + 8) >> 3] - turbo.Runtime._mem_float64[(ori + 8) >> 3]) / turbo.Runtime._mem_float64[(dir + 8) >> 3];
                leftFirst = (turbo.Runtime._mem_float64[(ori + 8) >> 3] < node.Point) || (turbo.Runtime._mem_float64[(ori + 8) >> 3] == turbo.Runtime._mem_float64[(SELF + 8) >> 3] && turbo.Runtime._mem_float64[(dir + 8) >> 3] <= 0);
                break;
            case Axis.AxisY:
                tsplit = (turbo.Runtime._mem_float64[(SELF + 8) >> 3] - turbo.Runtime._mem_float64[(ori + 16) >> 3]) / turbo.Runtime._mem_float64[(dir + 16) >> 3];
                leftFirst = (turbo.Runtime._mem_float64[(ori + 16) >> 3] < node.Point) || (turbo.Runtime._mem_float64[(ori + 16) >> 3] == turbo.Runtime._mem_float64[(SELF + 8) >> 3] && turbo.Runtime._mem_float64[(dir + 16) >> 3] <= 0);
                break;
            case Axis.AxisZ:
                tsplit = (turbo.Runtime._mem_float64[(SELF + 8) >> 3] - turbo.Runtime._mem_float64[(ori + 24) >> 3]) / turbo.Runtime._mem_float64[(dir + 24) >> 3];
                leftFirst = (turbo.Runtime._mem_float64[(ori + 24) >> 3] < node.Point) || (turbo.Runtime._mem_float64[(ori + 24) >> 3] == turbo.Runtime._mem_float64[(SELF + 8) >> 3] && turbo.Runtime._mem_float64[(dir + 24) >> 3] <= 0);
                break;
        }

        let first:number;
        let second:number;

        if (leftFirst) {
            first = turbo.Runtime._mem_int32[(SELF + 24) >> 2];
            second = turbo.Runtime._mem_int32[(SELF + 28) >> 2];
        } else {
            first = turbo.Runtime._mem_int32[(SELF + 28) >> 2];
            second = turbo.Runtime._mem_int32[(SELF + 24) >> 2];
        }

        if (tsplit > tmax || tsplit <= 0) {
            return Node.Intersect(first, r, tmin, tmax);
        } else if (tsplit < tmin) {
            return Node.Intersect(second, r, tmin, tmax);
        } else {
            let h1 = Node.Intersect(first, r, tmin, tsplit);
            if (h1.T <= tsplit) {
                return h1;
            }
            let h2 = Node.Intersect(second, r, tsplit, Math.min(tmax, h1.T));
            if (h1.T <= h2.T) {
                return h1;
            } else {
                return h2;
            }
        }
    }

    static IntersectShapes(SELF, r:number):Hit{
        let hit = Hit.NoHit;
        for(let i=0;i < turbo.Runtime._mem_int32[(SELF + 20) >> 2];i++) {
            let shape:number  = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 16) >> 2])+4*i) >> 2];
            let h = Shape.Intersect(shape, r);
            if (h.T < hit.T) {
                hit = h;
            }
        }
        return hit;
    }

    static PartitionScore(SELF, axis:Axis, point:number):number {
        let left = 0;
        let right = 0;
        for(let i=0;i < turbo.Runtime._mem_int32[(SELF + 20) >> 2];i++) {
            let shape:number  = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 16) >> 2])+4*i) >> 2];
            let box = Shape.BoundingBox(shape);
            let lr = Box.Partition(box, axis, point);
            if (lr.left) {
                left++
            }
            if (lr.right) {
                right++
            }
        }
        if (left >= right) {
            return left;
        } else {
            return right;
        }
    }

    static Partition(SELF, size:number, axis:Axis, point:number):{left:number, numLeft:number, right:number, numRight:number} {/*Shape[]*/
        let left = [];
        let right = [];
        for(let i=0;i < turbo.Runtime._mem_int32[(SELF + 20) >> 2];i++) {
            let shape:number  = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 16) >> 2])+4*i) >> 2];
            let box = Shape.BoundingBox(shape);
            let lr = Box.Partition(box, axis, point);
            if (lr.left) {
                left.push(shape);
            }
            if (lr.right) {
                right.push(shape);
            }
        }

        let left_ptr = turbo.Runtime.allocOrThrow( (4 * (left.length)), 4) /*Array*/;
        let right_ptr = turbo.Runtime.allocOrThrow( (4 * (right.length)), 4) /*Array*/;

        left.forEach((item, index) => {
           turbo.Runtime._mem_int32[(  (left_ptr)+4*index) >> 2] = item;
        });

        right.forEach((item, index) => {
           turbo.Runtime._mem_int32[(  (right_ptr)+4*index) >> 2] = item;
        });

        return {
            left:left_ptr, numLeft:left.length,
            right:right_ptr, numRight: right.length
        };
    }

    static Split(SELF, depth:number) {
        if ( turbo.Runtime._mem_int32[(SELF + 20) >> 2] < 8) {
            return;
        }

        let size:number = turbo.Runtime._mem_int32[(SELF + 20) >> 2] * 2;
        let xs = turbo.Runtime.allocOrThrow( (8 * size), 8) /*Array*/;
        let ys = turbo.Runtime.allocOrThrow( (8 * size), 8) /*Array*/;
        let zs = turbo.Runtime.allocOrThrow( (8 * size), 8) /*Array*/;

        let _xs = new Float64Array(size);
        let _ys = new Float64Array(size);
        let _zs = new Float64Array(size);

        let count = 0;
        for(let i=0;i < turbo.Runtime._mem_int32[(SELF + 20) >> 2];i++) {
            let shape:number  = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 16) >> 2])+4*i) >> 2];
            let box = Shape.BoundingBox(shape);

            _xs[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 4) >> 2]) + 8) >> 3];
            _ys[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 4) >> 2]) + 16) >> 3];
            _zs[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 4) >> 2]) + 24) >> 3];
            count++;

            _xs[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 8) >> 2]) + 8) >> 3];
            _ys[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 8) >> 2]) + 16) >> 3];
            _zs[count] = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(box + 8) >> 2]) + 24) >> 3];
            count++;
        }
        
        _xs.sort();
        _ys.sort();
        _zs.sort();

        for(let i=0;i < size;i++) {
            turbo.Runtime._mem_float64[(  xs+8*i) >> 3] = (_xs[i]);
            turbo.Runtime._mem_float64[(  ys+8*i) >> 3] = (_ys[i]);
            turbo.Runtime._mem_float64[(  zs+8*i) >> 3] = (_zs[i]);
        }

        let mx = Utils.Median(_xs);
        let my = Utils.Median(_ys);
        let mz = Utils.Median(_zs);
        let best = Math.round(turbo.Runtime._mem_int32[(SELF + 20) >> 2] * 0.85);
        let bestAxis = Axis.AxisNone;
        let bestPoint = 0.0;

        let sx = Node.PartitionScore(SELF, Axis.AxisX, mx);

        if (sx < best) {
            best = sx;
            bestAxis = Axis.AxisX;
            bestPoint = mx;
        }

        let sy = Node.PartitionScore(SELF, Axis.AxisY, my);
        if (sy < best) {
            best = sy;
            bestAxis = Axis.AxisY;
            bestPoint = my;
        }
        let sz = Node.PartitionScore(SELF, Axis.AxisZ, mz);
        if (sz < best) {
            best = sz;
            bestAxis = Axis.AxisZ;
            bestPoint = mz;
        }
        if (bestAxis == Axis.AxisNone) {
            return;
        }
        let lr = Node.Partition(SELF, best, bestAxis, bestPoint);
         turbo.Runtime._mem_uint8[(SELF + 4) >> 0] = bestAxis; 
         turbo.Runtime._mem_float64[(SELF + 8) >> 3] = bestPoint; 
         turbo.Runtime._mem_int32[(SELF + 24) >> 2] = (Node.NewNode(lr.left, lr.numLeft)); 
         turbo.Runtime._mem_int32[(SELF + 28) >> 2] = (Node.NewNode(lr.right, lr.numRight)); 
        Node.Split(turbo.Runtime._mem_int32[(SELF + 24) >> 2], depth + 1);
        Node.Split(turbo.Runtime._mem_int32[(SELF + 28) >> 2], depth + 1);
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = null;  // only needed at leaf nodes
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=20726; return SELF; }
}
turbo.Runtime._idToType[20726] = Node;

export class Tree extends MemoryObject{
   static NAME:string = "Tree";
   static SIZE:number = 12;
   static ALIGN:number = 4;
   static CLSID:number = 27694;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, box:number, root:number):number{
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = box; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = root; 
        return SELF;
    }

    static NewTree(shapes:number, numShapes:number):number {
        console.log(`Building k-d tree (${numShapes} shapes)... `);
        console.time("Tree:BuildingBox");
        let box = Box.BoxForShapes(shapes, numShapes);
        console.timeEnd("Tree:BuildingBox");
        let node = Node.NewNode(shapes, numShapes);
        console.time("Node:Split");
        Node.Split(node, 0);
        console.timeEnd("Node:Split");
        let ptr:number = Tree.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Tree.init(ptr, box, node);
    }

    static Intersect(tree:number, r:number):Hit {
        let hit = Box.Intersect(turbo.Runtime._mem_int32[(tree + 4) >> 2], r);
        if (hit.tmax < hit.tmin || hit.tmax <= 0) {
            return Hit.NoHit;
        }
        return Node.Intersect(turbo.Runtime._mem_int32[(tree + 8) >> 2], r, hit.tmin, hit.tmax);
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=27694; return SELF; }
}
turbo.Runtime._idToType[27694] = Tree;


export class Triangle extends Shape{
   static NAME:string = "Triangle";
   static SIZE:number = 48;
   static ALIGN:number = 4;
   static CLSID:number = 232773086;

   static get BASE():string{
       return Shape
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, v1:number=-1, v2:number=-1, v3:number=-1, n1:number=-1, n2:number=-1, n3:number=-1, t1:number=-1, t2:number=-1, t3:number=-1, material:number=-1){
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = v1; 
         turbo.Runtime._mem_int32[(SELF + 12) >> 2] = v2; 
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = v3; 
         turbo.Runtime._mem_int32[(SELF + 20) >> 2] = n1; 
         turbo.Runtime._mem_int32[(SELF + 24) >> 2] = n2; 
         turbo.Runtime._mem_int32[(SELF + 28) >> 2] = n3; 
         turbo.Runtime._mem_int32[(SELF + 32) >> 2] = t1; 
         turbo.Runtime._mem_int32[(SELF + 36) >> 2] = t2; 
         turbo.Runtime._mem_int32[(SELF + 40) >> 2] = t3; 
         turbo.Runtime._mem_int32[(SELF + 44) >> 2] = material; 
		return SELF;
	}

	static NewTriangle(v1:number, v2:number, v3:number, t1:number, t2:number, t3:number, material:number):number {
		let SELF = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
		 turbo.Runtime._mem_int32[(SELF + 8) >> 2] = v1; 
		 turbo.Runtime._mem_int32[(SELF + 12) >> 2] = v2; 
		 turbo.Runtime._mem_int32[(SELF + 16) >> 2] = v3; 
		 turbo.Runtime._mem_int32[(SELF + 32) >> 2] = t1; 
		 turbo.Runtime._mem_int32[(SELF + 36) >> 2] = t2; 
		 turbo.Runtime._mem_int32[(SELF + 40) >> 2] = t3; 
		 turbo.Runtime._mem_int32[(SELF + 44) >> 2] = material; 
		Triangle.FixNormals(SELF );
		return SELF;
	}

    static Pack(triangles:number[]):number {
        let packed = turbo.Runtime.allocOrThrow( (4 * (triangles.length)), 4) /*Array*/;
        triangles.forEach((triangle, i) =>{
            turbo.Runtime._mem_int32[(  packed+4*i) >> 2] = triangle;
        });
        return packed;
    }

    static Copy(a:number, b:number):number{
        turbo.Runtime._mem_int32[(b + 8) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 8) >> 2]);
        turbo.Runtime._mem_int32[(b + 12) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 12) >> 2]);
        turbo.Runtime._mem_int32[(b + 16) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 16) >> 2]);
        turbo.Runtime._mem_int32[(b + 20) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 20) >> 2]);
        turbo.Runtime._mem_int32[(b + 24) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 24) >> 2]);
        turbo.Runtime._mem_int32[(b + 28) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 28) >> 2]);
        turbo.Runtime._mem_int32[(b + 32) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 32) >> 2]);
        turbo.Runtime._mem_int32[(b + 36) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 36) >> 2]);
        turbo.Runtime._mem_int32[(b + 40) >> 2] = Vector.Clone(turbo.Runtime._mem_int32[(a + 40) >> 2]);
        turbo.Runtime._mem_int32[(b + 44) >> 2] = Material.Clone(turbo.Runtime._mem_int32[(a + 44) >> 2]);
        return b;
    }

    static Vertices(SELF){
		return {
            V1:turbo.Runtime._mem_int32[(SELF + 8) >> 2],
            V2:turbo.Runtime._mem_int32[(SELF + 12) >> 2],
            V3:turbo.Runtime._mem_int32[(SELF + 16) >> 2]
        }
	}

	static Compile() {
	}
    static BoundingBox_impl(SELF, c?:number):number{
		let min = Vector.Min_mem(Vector.Min_mem(turbo.Runtime._mem_int32[(SELF + 8) >> 2], turbo.Runtime._mem_int32[(SELF + 12) >> 2]), turbo.Runtime._mem_int32[(SELF + 16) >> 2]);
		let max = Vector.Max_mem(Vector.Max_mem(turbo.Runtime._mem_int32[(SELF + 8) >> 2], turbo.Runtime._mem_int32[(SELF + 12) >> 2]), turbo.Runtime._mem_int32[(SELF + 16) >> 2]);
        let ptr:number = c?c:Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
		return Box.Init_mem(ptr, min, max);
	}

	static Intersect(SELF, r:number /*Ray*/):Hit {

        let dir = turbo.Runtime._mem_int32[(r + 8) >> 2];
        let org = turbo.Runtime._mem_int32[(r + 4) >> 2];

		let e1x = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 12) >> 2]) + 8) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 8) >> 3];
        let e1y = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 12) >> 2]) + 16) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 16) >> 3];
        let e1z = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 12) >> 2]) + 24) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 24) >> 3];
        let e2x = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 16) >> 2]) + 8) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 8) >> 3];
        let e2y = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 16) >> 2]) + 16) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 16) >> 3];
        let e2z = turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 16) >> 2]) + 24) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 24) >> 3];
        let px = turbo.Runtime._mem_float64[(dir + 16) >> 3] * e2z - turbo.Runtime._mem_float64[(dir + 24) >> 3] * e2y;
        let py = turbo.Runtime._mem_float64[(dir + 24) >> 3] * e2x - turbo.Runtime._mem_float64[(dir + 8) >> 3] * e2z;
        let pz = turbo.Runtime._mem_float64[(dir + 8) >> 3] * e2y - turbo.Runtime._mem_float64[(dir + 16) >> 3] * e2x;
		let det = e1x * px + e1y * py + e1z * pz;
		if (det > -EPS && det < EPS) {
			return Hit.NoHit;
		}
		let inv = 1 / det;
        let tx = turbo.Runtime._mem_float64[(org + 8) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 8) >> 3];
        let ty = turbo.Runtime._mem_float64[(org + 16) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 16) >> 3];
        let tz = turbo.Runtime._mem_float64[(org + 24) >> 3] - turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 8) >> 2]) + 24) >> 3];
        let u = (tx * px + ty * py + tz * pz) * inv;
		if (u < 0 || u > 1) {
			return Hit.NoHit;
		}
        let qx = ty * e1z - tz * e1y;
        let qy = tz * e1x - tx * e1z;
        let qz = tx * e1y - ty * e1x;
        let v = (turbo.Runtime._mem_float64[(dir + 8) >> 3] * qx + turbo.Runtime._mem_float64[(dir + 16) >> 3] * qy + turbo.Runtime._mem_float64[(dir + 24) >> 3] * qz) * inv;
		if (v < 0 || u+v > 1) {
			return Hit.NoHit;
		}
        let d = (e2x*qx + e2y*qy + e2z*qz) * inv;
		if (d < EPS) {
			return Hit.NoHit;
		}
		return new Hit(SELF, d, null);
	}

	static UV(SELF, p:number/*Vector*/):number /*Vector*/ {
        let uvw = Triangle.Barycentric(SELF, p);
		let n = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
		n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 32) >> 2], uvw.u), n);
		n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 36) >> 2], uvw.v), n);
		n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 40) >> 2], uvw.w), n);
        turbo.Runtime._mem_float64[(n + 24) >> 3] = 0;
		return n
	}

	static MaterialAt(SELF, p:number /*Vector*/):number /*Material*/ {
		return turbo.Runtime._mem_int32[(SELF + 44) >> 2];
	}

	static NormalAt(SELF, p:number /*Vector*/):number /*Vector*/ {
		let uvw = Triangle.Barycentric(p);
		let n = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 20) >> 2], uvw.u), n);
        n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 24) >> 2], uvw.v), n);
        n = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 28) >> 2], uvw.w), n);
		n = Vector.Normalize_mem(n);
		if (turbo.Runtime._mem_int32[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 12) >> 2] != null) {
			let b = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
            b = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 32) >> 2], uvw.u), b);
            b = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 36) >> 2], uvw.v), b);
            b = Vector.Add_mem(n, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 40) >> 2], uvw.w), b);

			let ns = Texture.NormalSample(turbo.Runtime._mem_int32[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 12) >> 2], b.X, b.Y);
			let dv1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 12) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
            let dv2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 16) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
            let dt1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 36) >> 2], turbo.Runtime._mem_int32[(SELF + 32) >> 2]);
            let dt2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 40) >> 2], turbo.Runtime._mem_int32[(SELF + 32) >> 2]);

			let T = Vector.Normalize_mem(Vector.Sub_mem(Vector.MulScalar_mem(dv1, turbo.Runtime._mem_float64[(dt2 + 16) >> 3]), Vector.MulScalar_mem(dv2, turbo.Runtime._mem_float64[(dt1 + 16) >> 3])));
            let B = Vector.Normalize_mem(Vector.Sub_mem(Vector.MulScalar_mem(dv2, turbo.Runtime._mem_float64[(dt1 + 8) >> 3]), Vector.MulScalar_mem(dv1, turbo.Runtime._mem_float64[(dt2 + 8) >> 3])));
            let N = Vector.Cross_mem(T, B);
			let matrix = Matrix.initInstance(turbo.Runtime.allocOrThrow(136,8));
			Matrix.init(matrix,
					turbo.Runtime._mem_float64[(T + 8) >> 3], turbo.Runtime._mem_float64[(B + 8) >> 3], turbo.Runtime._mem_float64[(N + 8) >> 3], 0,
					turbo.Runtime._mem_float64[(T + 16) >> 3], turbo.Runtime._mem_float64[(B + 16) >> 3], turbo.Runtime._mem_float64[(N + 16) >> 3], 0,
					turbo.Runtime._mem_float64[(T + 24) >> 3], turbo.Runtime._mem_float64[(B + 24) >> 3], turbo.Runtime._mem_float64[(N + 24) >> 3], 0,
					0, 0, 0, 1);
			n = Matrix.MulDirection(matrix, ns);
		}
		if (turbo.Runtime._mem_int32[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 16) >> 2] != null) {
			let b = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
			b = Vector.Add_mem(b, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 32) >> 2], uvw.u), b);
			b = Vector.Add_mem(b, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 36) >> 2], uvw.v), b);
			b = Vector.Add_mem(b, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(SELF + 40) >> 2], uvw.w), b);
			let bump = Texture.BumpSample(turbo.Runtime._mem_int32[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 16) >> 2], turbo.Runtime._mem_float64[(b + 8) >> 3], turbo.Runtime._mem_float64[(b + 16) >> 3]);
			let dv1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 12) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
			let dv2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 16) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
			let dt1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 36) >> 2], turbo.Runtime._mem_int32[(SELF + 32) >> 2]);
			let dt2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 40) >> 2], turbo.Runtime._mem_int32[(SELF + 32) >> 2]);
			let tangent = Vector.Normalize_mem(Vector.Sub_mem(Vector.MulScalar_mem(dv1, turbo.Runtime._mem_float64[(dt2 + 16) >> 3]), Vector.MulScalar_mem(dv2, turbo.Runtime._mem_float64[(dt1 + 16) >> 3])));
			let bitangent = Vector.Sub_mem(Vector.Normalize_mem(Vector.MulScalar_mem(dv2, turbo.Runtime._mem_float64[(dt1 + 8) >> 3]), Vector.MulScalar_mem(dv1, turbo.Runtime._mem_float64[(dt2 + 8) >> 3])));
			n = Vector.Add_mem(n, Vector.MulScalar_mem(tangent, turbo.Runtime._mem_float64[(bump + 8) >> 3] * turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 24) >> 3]), n);
			n = Vector.Add_mem(n, Vector.MulScalar_mem(bitangent, turbo.Runtime._mem_float64[(bump + 16) >> 3] * turbo.Runtime._mem_float64[((turbo.Runtime._mem_int32[(SELF + 44) >> 2]) + 24) >> 3]), n);
		}
		n = Vector.Normalize_mem(n, n);
		return n;
	}

	static Area(SELF):number {
		let e1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 12) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let e2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 16) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let n = Vector.Cross_mem(e1, e2);
		return Vector.Length_mem(n) / 2;
	}

	static Barycentric(SELF, p:number /*Vector*/):{u:number, v:number, w:number} {
		let v0 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 12) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let v1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 16) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let v2 = Vector.Sub_mem(p, turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let d00 = Vector.Dot_mem(v0, v0);
		let d01 = Vector.Dot_mem(v0, v1);
		let d11 = Vector.Dot_mem(v1, v1);
		let d20 = Vector.Dot_mem(v2, v0);
		let d21 = Vector.Dot_mem(v2, v1);
		let d = d00*d11 - d01*d01;
		let v = (d11*d20 - d01*d21) / d;
		let w = (d00*d21 - d01*d20) / d;
		let u = 1 - v - w;
		return {u:u,v:v,w:w};
	}

	static FixNormals(SELF) {
		let e1 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 12) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let e2 = Vector.Sub_mem(turbo.Runtime._mem_int32[(SELF + 16) >> 2], turbo.Runtime._mem_int32[(SELF + 8) >> 2]);
		let n = Vector.Normalize_mem(Vector.Cross_mem(e1, e2));

        if(Vector.IsZero(turbo.Runtime._mem_int32[(SELF + 20) >> 2])) {
             turbo.Runtime._mem_int32[(SELF + 20) >> 2] = n; 
        }
        if(Vector.IsZero(turbo.Runtime._mem_int32[(SELF + 24) >> 2])) {
             turbo.Runtime._mem_int32[(SELF + 24) >> 2] = n; 
        }
        if(Vector.IsZero(turbo.Runtime._mem_int32[(SELF + 28) >> 2])) {
             turbo.Runtime._mem_int32[(SELF + 28) >> 2] = n; 
        }
	}
    static BoundingBox(SELF , c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            case 232773086:
                return Triangle.BoundingBox_impl(SELF , c);
            default:
              throw turbo.Runtime._badType(SELF);
        }
    }
    static Compile(SELF , c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            default:
              return Shape.Compile_impl(SELF , c);
        }
    }
    static Intersect(SELF , ray,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            default:
              return Shape.Intersect_impl(SELF , ray,c);
        }
    }
    static UV(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            default:
              return Shape.UV_impl(SELF , p,c);
        }
    }
    static NormalAt(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            default:
              return Shape.NormalAt_impl(SELF , p,c);
        }
    }
    static MaterialAt(SELF , p,c) {
        switch (turbo.Runtime._mem_int32[SELF>>2]) {
            default:
              return Shape.MaterialAt_impl(SELF , p,c);
        }
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=232773086; return SELF; }
}
turbo.Runtime._idToType[232773086] = Triangle;


export class Mesh extends MemoryObject{
   static NAME:string = "Mesh";
   static SIZE:number = 20;
   static ALIGN:number = 4;
   static CLSID:number = 24257;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, triangles:number, numTriangles:number){
        console.log(`numTriangles:${numTriangles}`);
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = triangles; 
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = numTriangles; 
        return SELF;
	}
	static NewMesh(triangles:number, numTriangles:number):number{
		let ptr:number = Mesh.initInstance(turbo.Runtime.allocOrThrow(20,4));
		return Mesh.init(ptr, triangles, numTriangles);
	}

	static dirty(SELF) {
		 turbo.Runtime._mem_int32[(SELF + 12) >> 2] = null; 
		 turbo.Runtime._mem_int32[(SELF + 16) >> 2] = null; 
	}
    
	Copy(SELF):number {

		let triangles = turbo.Runtime.allocOrThrow( (4 * (turbo.Runtime._mem_int32[(SELF + 4) >> 2])), 4) /*Array*/;
		for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2];i++) {
			let t = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			let a = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
			Triangle.Copy(t, a);
			turbo.Runtime._mem_int32[(  triangles+4*i) >> 2] = a;
		}
		return Mesh.NewMesh(triangles);
	}
    
	static Compile(SELF) {
		if (!turbo.Runtime._mem_int32[(SELF + 16) >> 2]) {
            console.time("Mesh:Compile");
			let numShapes:number = turbo.Runtime._mem_int32[(SELF + 4) >> 2];
            console.log(`Num shapes:${numShapes}`);
			// let shapes = turbo.Runtime.allocOrThrow( (4 * numShapes), 4) /*Array*/;
			// for (let i=0; i < numShapes; i++) {
			// 	let t = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
             //    turbo.Runtime._mem_int32[(  shapes+4*i) >> 2] = t;
			// }
			 turbo.Runtime._mem_int32[(SELF + 16) >> 2] = (Tree.NewTree(turbo.Runtime._mem_int32[(SELF + 8) >> 2], turbo.Runtime._mem_int32[(SELF + 4) >> 2])); 
            console.timeEnd("Mesh:Compile");
		}
        return turbo.Runtime._mem_int32[(SELF + 16) >> 2];
	}

	static Add(SELF, mesh:Mesh) {
        //TODO: Implement
        Mesh.dirty(SELF);
	}

	static BoundingBox(SELF):number {
		if (!turbo.Runtime._mem_int32[(SELF + 12) >> 2]) {

            let t = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*0) >> 2];
			let min = Vector.Clone(turbo.Runtime._mem_int32[(t + 8) >> 2]);
			let max = Vector.Clone(min);
			for (let i=1;i < turbo.Runtime._mem_int32[(SELF + 4) >> 2];i++) {
				Vector.Min_mem(Vector.Min_mem(Vector.Min_mem(min, t.V1, min), t.V2, min), t.V3, min);
				Vector.Max_mem(Vector.Max_mem(Vector.Max_mem(max, t.V1, max), t.V2, max), t.V3, max);
			}
            let ptr:number = Box.initInstance(turbo.Runtime.allocOrThrow(12,4));
			 turbo.Runtime._mem_int32[(SELF + 12) >> 2] = (Box.Init_mem(ptr, min, max)); 
		}
		return turbo.Runtime._mem_int32[(SELF + 12) >> 2];
	}

	static Intersect(SELF, r:number):Hit {
		return Tree.Intersect(turbo.Runtime._mem_int32[(SELF + 16) >> 2], r);
	}

	static UV(p:number):number {
		return null; // not implemented
	}

	static MaterialAt(p:number):number {
		return null; // not implemented
	}

	static NormalAt(p:number):number {
		return null; // not implemented
	}

	static _SmoothNormalsThreshold(SELF, normal:number, normals:number[], threshold:number):number {
		let result = Vector.NewVector();
		for (let i=0;i < normals.length; i++) {
            let x:number = normals[i];
			if (Vector.Dot_mem(x, normal) >= threshold) {
				Vector.Add_mem(result, x, result);
			}
		}
		return Vector.Normalize_mem(result);
	}

	static SmoothNormalsThreshold(SELF, radians:number) {
		let threshold:number = Math.cos(radians);
		let lookup:number[] = [];
		for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]] = Utils.append(lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]], turbo.Runtime._mem_int32[(t + 20) >> 2]);
			lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]] = Utils.append(lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]], turbo.Runtime._mem_int32[(t + 24) >> 2]);
			lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]] = Utils.append(lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]], turbo.Runtime._mem_int32[(t + 28) >> 2]);
		}
        for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			turbo.Runtime._mem_int32[(t + 20) >> 2] = Mesh._SmoothNormalsThreshold(SELF, turbo.Runtime._mem_int32[(t + 20) >> 2], lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]], threshold);
			turbo.Runtime._mem_int32[(t + 24) >> 2] = Mesh._SmoothNormalsThreshold(SELF, turbo.Runtime._mem_int32[(t + 24) >> 2], lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]], threshold);
			turbo.Runtime._mem_int32[(t + 28) >> 2] = Mesh._SmoothNormalsThreshold(SELF, turbo.Runtime._mem_int32[(t + 28) >> 2], lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]], threshold);
		}
	}

	static SmoothNormals(SELF) {
		let lookup:number[] = [];
        for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]] = lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]].Add(turbo.Runtime._mem_int32[(t + 20) >> 2]);
			lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]] = lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]].Add(turbo.Runtime._mem_int32[(t + 24) >> 2]);
			lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]] = lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]].Add(turbo.Runtime._mem_int32[(t + 28) >> 2]);
		}
		for (let i=0;i < lookup.length;i++) {
			 Vector.Normalize_mem(lookup[i], lookup[i]);
		}
        for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
            turbo.Runtime._mem_int32[(t + 20) >> 2] = lookup[turbo.Runtime._mem_int32[(t + 8) >> 2]];
			turbo.Runtime._mem_int32[(t + 24) >> 2] = lookup[turbo.Runtime._mem_int32[(t + 12) >> 2]];
			turbo.Runtime._mem_int32[(t + 28) >> 2] = lookup[turbo.Runtime._mem_int32[(t + 16) >> 2]];
		}
	}

	static UnitCube(SELF) {
		Mesh.FitInside(SELF, Box.NewBox(Vector.NewVector(), Vector.NewVector(1, 1, 1)), Vector.NewVector());
        Mesh.MoveTo(SELF, Vector.NewVector(), Vector.NewVector(0.5, 0.5, 0.5));
	}

	static MoveTo(SELF, position:number, anchor:number):number {
		let matrix = Matrix.TranslateUnitMatrix(Vector.Sub_mem(position, Box.Anchor(Mesh.BoundingBox(SELF), anchor)) );
		Matrix.Transform(SELF, matrix);
	}

	static FitInside(SELF, box:number, anchor:number) {
        let bsize:number = Box.Size(box);
        let mbox:number = Mesh.BoundingBox(SELF);
        let mbsize:number = Box.Size(mbox);
		let scale:number = Vector.MinComponent_mem(Vector.Div_mem(bsize, mbsize));
		let extra:number = Vector.MulScalar_mem(Vector.Sub_mem(bsize, mbsize), scale);
		let matrix:number = Matrix.Identity();
		Matrix.Translate(matrix, Vector.Negate_mem(turbo.Runtime._mem_int32[(mbox + 4) >> 2]), matrix);
		Matrix.Scale(matrix, Vector.NewVector(scale, scale, scale), matrix);
		Matrix.Translate(matrix, Vector.Add_mem(turbo.Runtime._mem_int32[(mbox + 4) >> 2], Vector.Mul_mem(extra, anchor)));
		Mesh.Transform(SELF, matrix);
	}

	static Transform(SELF, matrix:number) {
        for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			turbo.Runtime._mem_int32[(t + 8) >> 2] = Matrix.MulPosition(matrix, turbo.Runtime._mem_int32[(t + 8) >> 2]);
			turbo.Runtime._mem_int32[(t + 12) >> 2] = Matrix.MulPosition(matrix, turbo.Runtime._mem_int32[(t + 12) >> 2]);
			turbo.Runtime._mem_int32[(t + 16) >> 2] = Matrix.MulPosition(matrix, turbo.Runtime._mem_int32[(t + 16) >> 2]);
			turbo.Runtime._mem_int32[(t + 20) >> 2] = Matrix.MulDirection(matrix, turbo.Runtime._mem_int32[(t + 20) >> 2]);
			turbo.Runtime._mem_int32[(t + 24) >> 2] = Matrix.MulDirection(matrix, turbo.Runtime._mem_int32[(t + 24) >> 2]);
			turbo.Runtime._mem_int32[(t + 28) >> 2] = Matrix.MulDirection(matrix, turbo.Runtime._mem_int32[(t + 28) >> 2]);
		}
		Mesh.dirty(SELF);
	}

	static SetMaterial(material:number) {
        for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 4) >> 2]; i++) {
            let t:number = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 8) >> 2])+4*i) >> 2];
			turbo.Runtime._mem_int32[(t + 44) >> 2] = material;
		}
	}

	static SaveSTL(SELF, path:number):boolean {
		//return STL.SaveSTL(path, SELF)
        //TODO: Implement
	}
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=24257; return SELF; }
}
turbo.Runtime._idToType[24257] = Mesh;

export class Hit{

	static NoHit:Hit = new Hit(null, Number.POSITIVE_INFINITY, null);

	constructor(public Shape:number, public T:number, public HitInfo:HitInfo){

	}

	Ok():boolean{
		return this.T < Number.POSITIVE_INFINITY;
	}

	Info(r:number/*:Ray*/){
		if(this.HitInfo != null){
			return this.HitInfo;
		}

		let shape:number = this.Shape;
		let position:number = Ray.Position(r, this.T);
		let normal:number = Shape.NormalAt(this.Shape, position);
		let material:number = Material.MaterialAt(shape, position);
		let inside:boolean = false;

		if(Vector.Dot_mem(normal, turbo.Runtime._mem_int32[(r + 8) >> 2]) > 0){
			Vector.Negate_mem(normal, normal);
			inside = true;
			switch (Shape.Type(shape)) {
				case ShapeType.Volume:
				case ShapeType.SDFShape:
					inside = false;
					break;
			}
		}

		let ptr:number = Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
		let ray = Ray.init(ptr, position, normal);
		return new HitInfo(shape, position, normal, ray, material, inside);
	}
}

export class HitInfo{

	constructor(public Shape:number, //Shape
				public Position:number, //Vector
                public Normal:number, //Vector
                public Ray:number, //Ray
                public Material:number, //Material
                public Inside:boolean){

	}
}

export class Camera extends MemoryObject{
   static NAME:string = "Camera";
   static SIZE:number = 48;
   static ALIGN:number = 8;
   static CLSID:number = 1632962;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF, p:number, u:number, v:number, w:number, m:number, focalDistance:number=0, apertureRadius:number=0){
         turbo.Runtime._mem_int32[(SELF + 4) >> 2] = p; 
         turbo.Runtime._mem_int32[(SELF + 8) >> 2] = u; 
         turbo.Runtime._mem_int32[(SELF + 12) >> 2] = v; 
         turbo.Runtime._mem_int32[(SELF + 16) >> 2] = w; 
         turbo.Runtime._mem_float64[(SELF + 24) >> 3] = m; 
         turbo.Runtime._mem_float64[(SELF + 32) >> 3] = focalDistance; 
         turbo.Runtime._mem_float64[(SELF + 40) >> 3] = apertureRadius; 
        return SELF;
    }

    static NewCamera(p:number, u?:number, v?:number, w?:number, m?:number, focalDistance?:number, apertureRadius?:number){
        let ptr:number = Camera.initInstance(turbo.Runtime.allocOrThrow(48,8));
        p = p?p:Vector.NewVector();
        u = u?u:Vector.NewVector();
        v = v?v:Vector.NewVector();
        w = w?w:Vector.NewVector();
        m = m?m:Vector.NewVector();
        return Camera.init(ptr, p, u, v, w, m, focalDistance, apertureRadius);
    }

    static ToJSON(SELF){
        return {
            p:turbo.Runtime._mem_int32[(SELF + 4) >> 2],
            u:turbo.Runtime._mem_int32[(SELF + 8) >> 2],
            v:turbo.Runtime._mem_int32[(SELF + 12) >> 2],
            w:turbo.Runtime._mem_int32[(SELF + 16) >> 2],
            m:turbo.Runtime._mem_float64[(SELF + 24) >> 3],
            focalDistance:turbo.Runtime._mem_float64[(SELF + 32) >> 3],
            apertureRadius:turbo.Runtime._mem_float64[(SELF + 40) >> 3]
        };
    }

    static LookAt(eye, center, up, fovy:number, c?:number):number {
        c = c?c:Camera.initInstance(turbo.Runtime.allocOrThrow(48,8));
        Camera.init(c);
        turbo.Runtime._mem_int32[(c + 4) >> 2] = eye;
        let w:number = Vector.Normalize_mem(Vector.Sub_mem(center, eye));
        turbo.Runtime._mem_int32[(c + 16) >> 2] = w;
        let u:number = Vector.Normalize_mem(Vector.Cross_mem(up, w));
        turbo.Runtime._mem_int32[(c + 8) >> 2] = u;
        turbo.Runtime._mem_int32[(c + 12) >> 2] = Vector.Normalize_mem(Vector.Cross_mem(w, u));
        turbo.Runtime._mem_float64[(c + 24) >> 3] = 1 / Math.tan(fovy*Math.PI/360);
        return c;
    }

    static SetFocus(c:number, focalPoint:number, apertureRadius:number) {
        turbo.Runtime._mem_float64[(c + 32) >> 3] = Vector.Length_mem(Vector.Sub_mem(focalPoint, turbo.Runtime._mem_int32[(c + 4) >> 2]));
        turbo.Runtime._mem_float64[(c + 40) >> 3] = apertureRadius;
    }

    static CastRay(c:number, x:number, y:number, w:number, h:number, u:number, v:number):number {
        let aspect = float64(w) / float64(h);
        let px = ((float64(x)+u-0.5)/(float64(w)-1))*2 - 1;
        let py = ((float64(y)+v-0.5)/(float64(h)-1))*2 - 1;
        let d = Vector.initInstance(turbo.Runtime.allocOrThrow(32,8));
        d = Vector.Add_mem(d, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(c + 8) >> 2], -px * aspect), d);
        d = Vector.Add_mem(d, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(c + 12) >> 2], -py), d);
        d = Vector.Add_mem(d, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(c + 16) >> 2], turbo.Runtime._mem_float64[(c + 24) >> 3]), d);
        d = Vector.Normalize_mem(d);
        let p = turbo.Runtime._mem_int32[(c + 4) >> 2];
        if (turbo.Runtime._mem_float64[(c + 40) >> 3] > 0) {
            let focalPoint = Vector.Add_mem(turbo.Runtime._mem_int32[(c + 4) >> 2], Vector.MulScalar_mem(d, turbo.Runtime._mem_float64[(c + 32) >> 3]));
            let angle = Math.random() * 2 * Math.PI;
            let radius = Math.random() * turbo.Runtime._mem_float64[(c + 40) >> 3];
            p = Vector.Add_mem(p, Vector.MulScalar_mem(turbo.Runtime._mem_int32[(c + 8) >> 2], Math.cos(angle) * radius), p);
            p = Vector.Add_mem(p, Vector.MulScalar_mem(Vector.MulScalar_mem(turbo.Runtime._mem_int32[(c + 12) >> 2], Math.sin(angle) * radius), p));
            d = Vector.Normalize_mem(Vector.Sub_mem(focalPoint, p))
        }
        let ptr:number = Ray.initInstance(turbo.Runtime.allocOrThrow(12,4));
        return Ray.init(ptr, p, d);
    }
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=1632962; return SELF; }
}
turbo.Runtime._idToType[1632962] = Camera;

export class Scene extends MemoryObject{
   static NAME:string = "Scene";
   static SIZE:number = 48;
   static ALIGN:number = 8;
   static CLSID:number = 237222;

   static get BASE():string{
       return null
   }

   constructor(p:number){
       super(p);
   }

    static init(SELF){
		return SELF;
	}

	Compile(SELF) {
		for (let i=0; i < turbo.Runtime._mem_int32[(SELF + 28) >> 2];i++) {
			let shape = turbo.Runtime._mem_int32[(  (turbo.Runtime._mem_int32[(SELF + 24) >> 2])+4*i) >> 2];
			Shape.Compile(shape);
		}
		if (turbo.Runtime._mem_int32[(SELF + 40) >> 2] == null) {
			 turbo.Runtime._mem_int32[(SELF + 40) >> 2] = (Tree.NewTree(turbo.Runtime._mem_int32[(SELF + 24) >> 2], turbo.Runtime._mem_int32[(SELF + 28) >> 2])); 
		}
		return SELF;
	}

	static RayCount(SELF):number {
		return Atomics.load(turbo.Runtime._mem_int32[(SELF + 44) >> 2]);
	}

	static Intersect(SELF, r:number):Hit {
		Atomic.add(turbo.Runtime._mem_int32[(SELF + 44) >> 2], 1);
		return Tree.Intersect(turbo.Runtime._mem_int32[(SELF + 40) >> 2], r);
	}
    static initInstance(SELF) { turbo.Runtime._mem_int32[SELF>>2]=237222; return SELF; }
}
turbo.Runtime._idToType[237222] = Scene;


export class MasterScene{

	shapes:IShape[];
	lights:IShape[];
	scenePtr:number;

	constructor(){
		this.scenePtr = Scene.initInstance(turbo.Runtime.allocOrThrow(48,8));
	}
	Add(shape) {
		this.shapes.push(shape);
		
		if (turbo.Runtime._mem_float64[((Shape.MaterialAt(shape, Vector.ZERO)) + 32) >> 3] > 0) {
			this.lights.push(shape);
		}
	}
	Commit(){
		turbo.Runtime._mem_int32[((this.scenePtr) + 28) >> 2] = this.shapes.length;
		turbo.Runtime._mem_int32[((this.scenePtr) + 24) >> 2] = turbo.Runtime.allocOrThrow( (4 * (this.shapes.length)), 4) /*Array*/;
		turbo.Runtime._mem_int32[((this.scenePtr) + 36) >> 2] = this.lights.length;
		turbo.Runtime._mem_int32[((this.scenePtr) + 32) >> 2] = turbo.Runtime.allocOrThrow( (4 * (this.lights.length)), 4) /*Array*/;

		this.shapes.forEach((shape, index) => {

		})
	}
}

export class BufferGeometry {

    constructor(){

    }

    static NewBufferGeometry(obj){
        BufferGeometry.loadChildren(obj);
    }

    static loadChildren(parent) {
        var child;
        for (var i:number = 0; i < parent.children.length; i++) {
            child = parent.children[i];

            if (child.children.length > 0) {
                this.loadChildren(child);
            }else{
                this.buildSceneObject(child);
            }
        }
    }

    static identityMatrix = new THREE.Matrix4().identity();

    static buildSceneObject(src) {

        /*switch (src.type) {
            case ThreeObjects.Mesh:
                var material = GIJSView.getMaterial(src.material);
                var shape:Shape = this.buildGeometry(src.geometry, material, src.smooth);

                var matrixWorld = src.matrixWorld;

                if (matrixWorld.equals(this.identityMatrix)) {
                    return shape;
                } else {
                    var mat:Matrix4 = Matrix4.fromTHREEJS(matrixWorld.elements);
                    return TransformedShape.newTransformedShape(shape, mat);
                }

            case ThreeObjects.PointLight:
                return this.getLight(src);

        }*/
        // return null;
        return this.buildGeometry(src.geometry, 0, src.smooth);
    }

    static buildGeometry(geometry:THREE.BufferGeometry|any, material:number, smooth:boolean=false):Shape {

        if (geometry["_bufferGeometry"]) {
            geometry = geometry["_bufferGeometry"];
        }

        var triangles:number[] = [];

        if (!geometry.attributes) {

            var vertices = geometry.vertices;
            var faces = geometry.faces;
            if (vertices && faces) {
                for (var i = 0; i < faces.length; i++) {
                    var face = faces[i];
                    var t:number = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
                    triangle.material = material;
                    triangle.v1 = new Vector3(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
                    triangle.v2 = new Vector3(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
                    triangle.v3 = new Vector3(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
                    triangle.n1 = new Vector3();
                    triangle.n2 = new Vector3();
                    triangle.n3 = new Vector3();

                    turbo.Runtime._mem_int32[(t + 44) >> 2] = material;
                    turbo.Runtime._mem_int32[(t + 8) >> 2] = Vector.NewVector(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
                    turbo.Runtime._mem_int32[(t + 12) >> 2] = Vector.NewVector(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
                    turbo.Runtime._mem_int32[(t + 16) >> 2] = Vector.NewVector(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
                    turbo.Runtime._mem_int32[(t + 20) >> 2] = Vector.NewVector();
                    turbo.Runtime._mem_int32[(t + 24) >> 2] = Vector.NewVector();
                    turbo.Runtime._mem_int32[(t + 28) >> 2] = Vector.NewVector();

                    // triangle.updateBox();
                    // triangle.fixNormals();
                    triangles.push(t);
                }
            } else {
                return null;
            }

        } else {

            var positions:Float32Array = geometry.attributes["position"].array;
            if(geometry.attributes["uv"]){
                var uv:Float32Array = geometry.attributes["uv"].array;
            }

            var normals:Float32Array;
            if (geometry.attributes["normal"]) {
                normals = geometry.attributes["normal"].array;
            } else {
                normals = this.computeNormals(positions);
            }
            var triCount:number = 0;
            var indexAttribute = geometry.getIndex();

            if (indexAttribute) {

                var indices = indexAttribute.array;
                var uvIndex:number = 0;
                for (var i = 0; i < indices.length; i = i + 3) {

                    triCount++;

                    var a;
                    var b;
                    var c;

                    a = indices[i];
                    b = indices[i + 1];
                    c = indices[i + 2];

                    if (triCount % 2 !== 0) {
                        a = indices[i];
                        b = indices[i + 1];
                        c = indices[i + 2];
                    } else {
                        c = indices[i];
                        b = indices[i + 1];
                        a = indices[i + 2];
                    }

                    //[....,ax,ay,az, bx,by,bz, cx,xy,xz,....]
                    var ax = a * 3;
                    var ay = (a * 3) + 1;
                    var az = (a * 3) + 2;

                    var bx = b * 3;
                    var by = (b * 3) + 1;
                    var bz = (b * 3) + 2;

                    var cx = c * 3;
                    var cy = (c * 3) + 1;
                    var cz = (c * 3) + 2;

                    var au = a * 2;
                    var av = (a * 2) + 1;

                    var bu = b * 2;
                    var bv = (b * 2) + 1;

                    var cu = c * 2;
                    var cv = (c * 2) + 1;

                    var t = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
                    turbo.Runtime._mem_int32[(t + 44) >> 2] = material;
                    turbo.Runtime._mem_int32[(t + 8) >> 2] = Vector.NewVector(positions[ax], positions[ay], positions[az]);
                    turbo.Runtime._mem_int32[(t + 12) >> 2] = Vector.NewVector(positions[bx], positions[by], positions[bz]);
                    turbo.Runtime._mem_int32[(t + 16) >> 2] = Vector.NewVector(positions[cx], positions[cy], positions[cz]);

                    turbo.Runtime._mem_int32[(t + 20) >> 2] = Vector.NewVector(normals[ax], normals[ay], normals[az]);
                    turbo.Runtime._mem_int32[(t + 24) >> 2] = Vector.NewVector(normals[bx], normals[by], normals[bz]);
                    turbo.Runtime._mem_int32[(t + 28) >> 2] = Vector.NewVector(normals[cx], normals[cy], normals[cz]);

                    if(uv){
                        turbo.Runtime._mem_int32[(t + 32) >> 2] = Vector.NewVector(uv[au], uv[av], 0);
                        turbo.Runtime._mem_int32[(t + 36) >> 2] = Vector.NewVector(uv[bu], uv[bv], 0);
                        turbo.Runtime._mem_int32[(t + 40) >> 2] = Vector.NewVector(uv[cu], uv[cv], 0);
                    }

                    // triangle.fixNormals();
                    // triangle.updateBox();
                    triangles.push(t);
                    uvIndex += 2;
                }

            } else {
                uvIndex = 0;
                for (var i = 0; i < positions.length; i = i + 9) {
                    var t = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
                    turbo.Runtime._mem_int32[(t + 44) >> 2] = material;
                    turbo.Runtime._mem_int32[(t + 8) >> 2] = Vector.NewVector(positions[i], positions[i + 1], positions[i + 2]);
                    turbo.Runtime._mem_int32[(t + 12) >> 2] = Vector.NewVector(positions[i + 3], positions[i + 4], positions[i + 5]);
                    turbo.Runtime._mem_int32[(t + 16) >> 2] = Vector.NewVector(positions[i + 6], positions[i + 7], positions[i + 8]);
                    turbo.Runtime._mem_int32[(t + 20) >> 2] = Vector.NewVector(normals[i], normals[i + 1], normals[i + 2]);
                    turbo.Runtime._mem_int32[(t + 24) >> 2] = Vector.NewVector(normals[i + 3], normals[i + 4], normals[i + 5]);
                    turbo.Runtime._mem_int32[(t + 28) >> 2] = Vector.NewVector(normals[i + 6], normals[i + 7], normals[i + 8]);

                    if(uv){
                        turbo.Runtime._mem_int32[(t + 32) >> 2] = Vector.NewVector(uv[uvIndex], uv[uvIndex + 1], 0);
                        turbo.Runtime._mem_int32[(t + 36) >> 2] = Vector.NewVector(uv[uvIndex + 2], uv[uvIndex + 3], 0);
                        turbo.Runtime._mem_int32[(t + 40) >> 2] = Vector.NewVector(uv[uvIndex + 4], uv[uvIndex + 5], 0);
                    }

                    // triangle.fixNormals();
                    // triangle.updateBox();
                    triangles.push(t);
                    uvIndex += 6;
                }
            }
        }

        console.log(`Num triangles: ${triangles.length}`);
        let meshRef = Mesh.NewMesh(Triangle.Pack(triangles), triangles.length);
        Mesh.Compile(meshRef);
        return meshRef;
        // if(smooth){
        //     mesh.smoothNormals();
        // }
        // return mesh;
    }

    static computeNormals(positions:Float32Array):Float32Array {
        return new Float32Array(positions.length);
    }

}


export class OBJLoader {

    static parentMaterial:number;
    static lastMesh:number;
    static materials:Map<string, number>;
    static hasMaterials:boolean = false;
    static materialsLoaded:boolean = false;
    static materialsLoading:boolean = false;
    static pendingCallback:Function = null;

    static Load(url:string, onLoad:Function) {
        console.log("Loading OBJ:" + url);
        let basePath = url.substring(0, url.lastIndexOf("/"));
        let xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            console.time("Parsing OBJ file");
            OBJLoader.lastMesh = OBJLoader.parseOBJ(xhr.response, basePath);
            console.timeEnd("Parsing OBJ file");
            console.log("Parsing completed, Mesh Ref:"+OBJLoader.lastMesh);
            if (onLoad) {
                if (OBJLoader.hasMaterials && OBJLoader.materialsLoaded) {
                    onLoad(OBJLoader.lastMesh);
                } else if (!OBJLoader.hasMaterials) {
                    onLoad(OBJLoader.lastMesh);
                } else {
                    OBJLoader.pendingCallback = onLoad;
                }
            }
        };
        xhr.send(null);
        return null;
    }

    static parseIndex(value:string, length:number):number {
        var n = parseInt(value);
        if (n < 0) {
            n += length;
        }
        return n;
    }

    static parseLine(line:string):{keyword:string, value:string[]} {
        try {
            var result = line.match(/^(\S+)\s(.*)/)
            if (result) {
                var _str = result.slice(1);
            } else {
                return null;
            }
        } catch (e) {
            console.log("Error in line:", line, e);
            return null;
        }
        if (!_str) {
            return null;
        } else {
            return {
                keyword: _str[0],
                value: _str[1].split(/ {1,}/)
            };
        }
    }

    static parseFloats(fs:string[]):number[] {
        var floats:number[] = [];
        fs.forEach(function (f:string) {
            floats.push(parseFloat(f));
        });
        return floats;
    }

    static parseOBJ(data:string, basePath:string):number {

        this.hasMaterials = false;
        this.materialsLoaded = false;
        this.materialsLoading = false;

        var vs:XYZ[] = [null]; //1024 // 1-based indexing
        var vts:XYZ[] = [null]; // 1-based indexing
        var vns:XYZ[] = [null]; // 1-based indexing
        var triangles:number[];
        this.materials = new Map<string, number>();//make(map[string]*Material)
        var material:number = this.parentMaterial;
        var lines = data.split("\n");

        console.log("OBJ File Details");
        console.log(`    lines: ${lines.length}`);

        for (var i = 0; i < lines.length; i++) {
            let line:string = lines[i].trim();
            if (line.length == 0) {
                continue;
            }
            let item = OBJLoader.parseLine(line);
            if (item) {
                let f:number[];
                let v:XYZ;

                switch (item.keyword) {
                    case "mtllib":
                        this.hasMaterials = true;
                        this.materialsLoaded = false;
                        //OBJLoader.LoadMTL(item.value[0], basePath);
                        break;

                    case "usemtl":
                        //material = OBJLoader.GetMaterial(item.value[0]);
                        break;

                    case "v":
                        f = OBJLoader.parseFloats(item.value);
                        v = xyz(f[0], f[1], f[2]);
                        vs = Utils.append(vs, v);
                        break;

                    case "vt":
                        f = OBJLoader.parseFloats(item.value);
                        v = xyz(f[0], f[1], 0);
                        vts = Utils.append(vts, v);
                        break;

                    case "vn":
                        f = OBJLoader.parseFloats(item.value);
                        v = xyz(f[0], f[1], f[2]);
                        vns = Utils.append(vns, v);
                        break;

                    case "f":
                        var fvs:number[] = [];
                        var fvts:number[] = [];
                        var fvns:number[] = [];

                        item.value.forEach(function (str:string, i) {
                            let vertex:string[] = str.split(/\/\/{1,}/);
                            fvs[i] = OBJLoader.parseIndex(vertex[0], vs.length);
                            fvts[i] = OBJLoader.parseIndex(vertex[1], vts.length);
                            fvns[i] = OBJLoader.parseIndex(vertex[2], vns.length);
                        });

                        for (let i:number = 1; i < fvs.length - 1; i++) {
                            let i1 = 0;
                            let i2 = i;
                            let i3 = i + 1;
                            let t = Triangle.initInstance(turbo.Runtime.allocOrThrow(48,4));
                            turbo.Runtime._mem_int32[(t + 44) >> 2] = material;
                            turbo.Runtime._mem_int32[(t + 8) >> 2] = vs[fvs[i1]];
                            turbo.Runtime._mem_int32[(t + 12) >> 2] = vs[fvs[i2]];
                            turbo.Runtime._mem_int32[(t + 16) >> 2] = vs[fvs[i3]];
                            turbo.Runtime._mem_int32[(t + 32) >> 2] = vts[fvts[i1]];
                            turbo.Runtime._mem_int32[(t + 36) >> 2] = vts[fvts[i2]];
                            turbo.Runtime._mem_int32[(t + 40) >> 2] = vts[fvts[i3]];
                            turbo.Runtime._mem_int32[(t + 20) >> 2] = vns[fvns[i1]];
                            turbo.Runtime._mem_int32[(t + 24) >> 2] = vns[fvns[i2]];
                            turbo.Runtime._mem_int32[(t + 28) >> 2] = vns[fvns[i3]];
                            // Triangle.UpdateBox(t);
                            //Triangle.FixNormals(t);
                            triangles = Utils.append(triangles, t);
                        }
                        break;
                }
            }
        }
        console.log(`Num triangles: ${triangles.length}`);
        return Mesh.NewMesh(Triangle.Pack(triangles), triangles.length);
    }

    static GetMaterial(index:string):number {
        if (this.materials[index] == undefined) {
            // var material:number = Material.Clone(this.parentMaterial);
            var material:number = this.parentMaterial;
            this.materials[index] = material;
            return material;
        } else {
            return this.materials[index];
        }
    }

    static LoadMTL(url:string, basePath:string) {
        if (this.materialsLoaded || this.materialsLoading) {
            return;
        }
        this.materialsLoading = true;
        url = basePath == "" ? url : basePath + "/" + url;
        console.log("Loading MTL:" + url);
        var self = this;
        var xhr:XMLHttpRequest = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            var lines = xhr.response.split("\n");

            for (var i = 0; i < lines.length; i++) {
                let line:string = lines[i].trim();
                if (line.length == 0) {
                    continue;
                }
                let item = OBJLoader.parseLine(line);
                if (item) {
                    var material:number;
                    switch (item.keyword) {
                        case "newmtl":
                            material = self.materials[item.value[0]];
                            // material = material ? material : Material.Clone(self.parentMaterial);
                            material = 0;
                            self.materials[item.value[0]] = material;
                            break;
                        case "Ke":
                            var c:number[] = OBJLoader.parseFloats(item.value);
                            let max = Math.max(Math.max(c[0], c[1]), c[2]);
                            if (max > 0) {
                                turbo.Runtime._mem_int32[(material + 4) >> 2] = Color.NewColor(c[0] / max, c[1] / max, c[2] / max);
                                turbo.Runtime._mem_float64[(material + 32) >> 3] = max;
                            }
                            break;
                        case "Kd":
                            var c:number[] = OBJLoader.parseFloats(item.value);
                            turbo.Runtime._mem_int32[(material + 4) >> 2] = Color.NewColor(c[0], c[1], c[2]);
                            break;
                        case "map_Kd":
                            //material.texture = Texture.getTexture(item.value[0]);
                            break;
                        case "map_bump":
                            //material.texture = Texture.getTexture(item.value[0]);
                            break;
                    }
                }
            }
            self.materialsLoaded = true;
            if (self.pendingCallback) {
                self.pendingCallback(self.lastMesh);
                self.pendingCallback = null;
            }
        };
        xhr.send(null);

        return null;
    }
}




}
