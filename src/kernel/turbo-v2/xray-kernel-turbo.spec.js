"use strict";
var kernel = require("./xray-kernel-turbo");
var turbo = kernel.turbo;
var Color = kernel.Color;
var Vector = kernel.Vector;
var Matrix = kernel.Matrix;
describe("Turbo Runtime suite", function () {
    it("Turbo should have defined", function () {
        expect(turbo).toBeDefined();
    });
    it("Turbo Runtime should have defined", function () {
        expect(turbo.Runtime).toBeDefined();
    });
});
describe("Kernel suite >> ", function () {
    it("Kernel should have defined", function () {
        expect(kernel).toBeDefined();
    });
    describe("Color definition >> ", function () {
        it("Color should have defined", function () {
            expect(Color).toBeDefined();
        });
        it("Color should have init method", function () {
            expect(Color.init).toBeDefined();
        });
        it("Color should have Set method", function () {
            expect(Color.Set).toBeDefined();
        });
        it("Color should have HexColor method", function () {
            expect(Color.HexColor).toBeDefined();
        });
        it("Color should have Kelvin method", function () {
            expect(Color.Kelvin).toBeDefined();
        });
        it("Color should have NewColor method", function () {
            expect(Color.NewColor).toBeDefined();
        });
        it("Color should have RGBA method", function () {
            expect(Color.RGBA).toBeDefined();
        });
        it("Color should have RGBA64 method", function () {
            expect(Color.RGBA64).toBeDefined();
        });
        it("Color should have Add method", function () {
            expect(Color.Add).toBeDefined();
        });
        it("Color should have Add_mem method", function () {
            expect(Color.Add_mem).toBeDefined();
        });
        it("Color should have Sub method", function () {
            expect(Color.Sub).toBeDefined();
        });
        it("Color should have Sub_mem method", function () {
            expect(Color.Sub_mem).toBeDefined();
        });
        it("Color should have Mul method", function () {
            expect(Color.Mul).toBeDefined();
        });
        it("Color should have Mul_mem method", function () {
            expect(Color.Mul_mem).toBeDefined();
        });
        it("Color should have MulScalar method", function () {
            expect(Color.MulScalar).toBeDefined();
        });
        it("Color should have MulScalar_mem method", function () {
            expect(Color.MulScalar_mem).toBeDefined();
        });
        it("Color should have DivScalar method", function () {
            expect(Color.DivScalar).toBeDefined();
        });
        it("Color should have DivScalar_mem method", function () {
            expect(Color.DivScalar_mem).toBeDefined();
        });
        it("Color should have Min method", function () {
            expect(Color.Min).toBeDefined();
        });
        it("Color should have Min_mem method", function () {
            expect(Color.Min_mem).toBeDefined();
        });
        it("Color should have Max method", function () {
            expect(Color.Max).toBeDefined();
        });
        it("Color should have Max_mem method", function () {
            expect(Color.Max_mem).toBeDefined();
        });
        it("Color should have MinComponent method", function () {
            expect(Color.MinComponent).toBeDefined();
        });
        it("Color should have MinComponent_mem method", function () {
            expect(Color.MinComponent_mem).toBeDefined();
        });
        it("Color should have MaxComponent method", function () {
            expect(Color.MaxComponent).toBeDefined();
        });
        it("Color should have MaxComponent_mem method", function () {
            expect(Color.MaxComponent_mem).toBeDefined();
        });
        it("Color should have Pow method", function () {
            expect(Color.Pow).toBeDefined();
        });
        it("Color should have Pow_mem method", function () {
            expect(Color.Pow_mem).toBeDefined();
        });
        it("Color should have Mix method", function () {
            expect(Color.Mix).toBeDefined();
        });
        it("Color should have Mix_mem method", function () {
            expect(Color.Mix_mem).toBeDefined();
        });
        it("Color should have Clone method", function () {
            expect(Color.Clone).toBeDefined();
        });
        it("Color should have Random method", function () {
            expect(Color.Random).toBeDefined();
        });
        it("Color should have RandomBrightColor method", function () {
            expect(Color.RandomBrightColor).toBeDefined();
        });
        it("Color should have BrightColors property", function () {
            expect(Color.BrightColors).toBeDefined();
        });
    });
    describe("Color instance >> ", function () {
        it("Should create without a problem", function () {
            var color = new Color(0);
            expect(color).toBeTruthy();
        });
        it("Should add without a problem", function () {
            var red = { R: 1, G: 0, B: 0 };
            var green = { R: 0, G: 1, B: 0 };
            var blue = { R: 0, G: 0, B: 1 };
            var white = { R: 255, G: 255, B: 255, A: 255 };
            var _red = Color.NewColor(red);
            var _green = Color.NewColor(green);
            var _blue = Color.NewColor(blue);
            var result1 = Color.NewColor();
            var tmp1 = Color.Add_mem(_red, _green);
            Color.Add_mem(tmp1, _blue, result1);
            var result2 = Color.Add_mem(tmp1, _blue);
            expect(white).toEqual(Color.RGBA(result1));
            expect(white).toEqual(Color.RGBA(result2));
        });
        it("Should subtract without a problem", function () {
            var white = { R: 1, G: 1, B: 1 };
            var green = { R: 0, G: 1, B: 0 };
            var blue = { R: 0, G: 0, B: 1 };
            var red = { R: 255, G: 0, B: 0, A: 255 };
            var _white = Color.NewColor(white);
            var _green = Color.NewColor(green);
            var _blue = Color.NewColor(blue);
            var result1 = Color.NewColor();
            var tmp1 = Color.Sub_mem(_white, _blue);
            Color.Sub_mem(tmp1, _green, result1);
            var result2 = Color.Sub_mem(tmp1, _green);
            expect(red).toEqual(Color.RGBA(result1));
            expect(red).toEqual(Color.RGBA(result2));
        });
        it("Should multiply without a problem", function () {
            var red = { R: 1, G: 0, B: 0 };
            var green = { R: 0, G: 1, B: 0 };
            var blue = { R: 0, G: 0, B: 1 };
            var black = { R: 0, G: 0, B: 0, A: 255 };
            var _red = Color.NewColor(red);
            var _green = Color.NewColor(green);
            var _blue = Color.NewColor(blue);
            var result1 = Color.NewColor();
            var tmp1 = Color.Mul_mem(_red, _green);
            Color.Mul_mem(tmp1, _blue, result1);
            var result2 = Color.Mul_mem(tmp1, _blue);
            expect(black).toEqual(Color.RGBA(result1));
            expect(black).toEqual(Color.RGBA(result2));
        });
        it("Should multiply scalar without a problem", function () {
            var white = { R: 1, G: 1, B: 1 };
            var halfwhite = { R: Math.round(255 * 0.5), G: Math.round(255 * 0.5), B: Math.round(255 * 0.5), A: 255 };
            var halfwhiteFloat = { R: 0.5, G: 0.5, B: 0.5, A: 1.0 };
            var _white = Color.NewColor(white);
            var result1 = Color.NewColor();
            Color.MulScalar_mem(_white, 0.5, result1);
            var result2 = Color.MulScalar_mem(_white, 0.5);
            var result3 = Color.MulScalar_mem(_white, 0.5000000000000001);
            expect(halfwhite).toEqual(Color.RGBA(result1));
            expect(halfwhite).toEqual(Color.RGBA(result2));
            expect(halfwhiteFloat).not.toEqual(Color.FloatRGBA(result3));
        });
        it("Should divide scalar without a problem", function () {
            var white = { R: 1, G: 1, B: 1 };
            var halfwhite = { R: Math.round(255 * 0.5), G: Math.round(255 * 0.5), B: Math.round(255 * 0.5), A: 255 };
            var _white = Color.NewColor(white);
            var result1 = Color.NewColor();
            Color.DivScalar_mem(_white, 2, result1);
            var result2 = Color.DivScalar_mem(_white, 2);
            expect(halfwhite).toEqual(Color.RGBA(result1));
            expect(halfwhite).toEqual(Color.RGBA(result2));
        });
        it("Should calculate minimum value without a problem", function () {
            var color1 = { R: 1, G: 0.00055, B: 0.0255 };
            var color2 = { R: 0.25, G: 0.5, B: 0.05 };
            var min = { R: 0.25, G: 0.00055, B: 0.0255, A: 1 };
            var _c1 = Color.NewColor(color1);
            var _c2 = Color.NewColor(color2);
            var result1 = Color.NewColor();
            Color.Min_mem(_c1, _c2, result1);
            var result2 = Color.Min_mem(_c1, _c2);
            expect(min).toEqual(Color.FloatRGBA(result1));
            expect(min).toEqual(Color.FloatRGBA(result2));
        });
        it("Should calculate maximum value without a problem", function () {
            var color1 = { R: 1, G: 0.00055, B: 0.0255 };
            var color2 = { R: 0.25, G: 0.5, B: 0.05 };
            var max = { R: 1, G: 0.5, B: 0.05, A: 1 };
            var _c1 = Color.NewColor(color1);
            var _c2 = Color.NewColor(color2);
            var result1 = Color.NewColor();
            Color.Max_mem(_c1, _c2, result1);
            var result2 = Color.Max_mem(_c1, _c2);
            expect(max).toEqual(Color.FloatRGBA(result1));
            expect(max).toEqual(Color.FloatRGBA(result2));
        });
        it("Should calculate minimum component without a problem", function () {
            var color1 = { R: 1, G: 0.00055, B: 0.0255 };
            var _c1 = Color.NewColor(color1);
            var result = Color.MinComponent_mem(_c1);
            expect(result).toEqual(0.00055);
        });
        it("Should calculate maximum component without a problem", function () {
            var color1 = { R: 1, G: 0.00055, B: 0.0255 };
            var _c1 = Color.NewColor(color1);
            var result = Color.MaxComponent_mem(_c1);
            expect(result).toEqual(1);
        });
        it("Should calculate power without a problem", function () {
            var factor = 2;
            var color = { R: 1, G: 0.00055, B: 0.0255 };
            var color_pow = {
                R: Math.pow(color.R, factor),
                G: Math.pow(color.G, factor),
                B: Math.pow(color.B, factor),
                A: 1.0
            };
            var _c1 = Color.NewColor(color);
            var result = Color.Pow_mem(_c1, factor);
            expect(Color.FloatRGBA(result)).toEqual(color_pow);
        });
        it("Should mix without a problem", function () {
            var factor = 0.5;
            var color1 = { R: 1, G: 0, B: 0.0255 };
            var color2 = { R: 1, G: 1, B: 0.0255 };
            var color_mix = { R: 1, G: 0.5, B: 0.0255, A: 1 };
            var _c1 = Color.NewColor(color1);
            var _c2 = Color.NewColor(color2);
            var result1 = Color.NewColor();
            Color.Mix_mem(_c1, _c2, factor, result1);
            var result2 = Color.Mix_mem(_c1, _c2, factor);
            expect(Color.FloatRGBA(result1)).toEqual(color_mix);
            expect(Color.FloatRGBA(result2)).toEqual(color_mix);
        });
        it("Should check IsEqual without a problem", function () {
            var color1 = { R: 0.256, G: 0, B: 1 };
            var color2 = { R: 0.256, G: 0, B: 1 };
            var color3 = { R: 0.254, G: 1, B: 0.0255 };
            var _c1 = Color.NewColor(color1);
            var _c2 = Color.NewColor(color2);
            var _c3 = Color.NewColor(color3);
            var result1 = Color.IsEqual(_c1, _c2);
            var result2 = Color.IsEqual(_c2, _c1);
            var result3 = Color.IsEqual(_c1, _c3);
            var result4 = Color.IsEqual(_c2, _c3);
            expect(result1).toBeTruthy();
            expect(result2).toBeTruthy();
            expect(result3).not.toBeTruthy();
            expect(result4).not.toBeTruthy();
        });
        it("Should check IsBlack without a problem", function () {
            var black = { R: 0, G: 0, B: 0 };
            var blue = { R: 0, G: 0, B: 1 };
            var _c1 = Color.NewColor(black);
            var _c2 = Color.NewColor(blue);
            var result1 = Color.IsBlack(_c1);
            var result2 = Color.IsBlack(_c2);
            expect(result1).toBeTruthy();
            expect(result2).not.toBeTruthy();
        });
        it("Should check IsWhite without a problem", function () {
            var white = { R: 1, G: 1, B: 1 };
            var blue = { R: 0, G: 0, B: 1 };
            var _c1 = Color.NewColor(white);
            var _c2 = Color.NewColor(blue);
            var result1 = Color.IsWhite(_c1);
            var result2 = Color.IsWhite(_c2);
            expect(result1).toBeTruthy();
            expect(result2).not.toBeTruthy();
        });
        it("Should set value without a problem", function () {
            var blue = { R: 0, G: 0, B: 1, A: 1 };
            var _c = Color.NewColor();
            var result = Color.Set(_c, blue.R, blue.G, blue.B);
            expect(Color.FloatRGBA(result)).toEqual(blue);
        });
        it("Should clone without a problem", function () {
            var blue = { R: 0, G: 0, B: 1, A: 1 };
            var _c = Color.NewColor(blue);
            var result = Color.Clone(_c);
            expect(Color.FloatRGBA(result)).toEqual(blue);
        });
        it("Should create random color without a problem", function () {
            var color1 = Color.Random();
            var color2 = Color.Random();
            expect(color1).not.toBeNull();
            expect(color2).not.toBeNull();
            expect(Color.RGBA(color1)).not.toBeNull();
            expect(Color.RGBA(color2)).not.toBeNull();
            expect(Color.RGBA(color1)).not.toEqual(Color.RGBA(color2));
        });
        it("Should create random bright color without a problem", function () {
            var color1 = Color.RandomBrightColor();
            var color2 = Color.RandomBrightColor();
            expect(color1).not.toBeNull();
            expect(color2).not.toBeNull();
            expect(Color.RGBA(color1)).not.toBeNull();
            expect(Color.RGBA(color2)).not.toBeNull();
        });
    });
    describe("Vector definition >> ", function () {
        it("Vector should have defined", function () {
            expect(Vector).toBeDefined();
        });
        it("Vector should have RandomUnitVector method", function () {
            expect(Vector.RandomUnitVector).toBeDefined();
        });
        it("Vector should have Length method", function () {
            expect(Vector.Length).toBeDefined();
        });
        it("Vector should have LengthN method", function () {
            expect(Vector.LengthN).toBeDefined();
        });
        it("Vector should have Dot method", function () {
            expect(Vector.Dot).toBeDefined();
        });
        it("Vector should have Dot_mem method", function () {
            expect(Vector.Dot_mem).toBeDefined();
        });
        it("Vector should have Cross method", function () {
            expect(Vector.Cross).toBeDefined();
        });
        it("Vector should have Cross_mem method", function () {
            expect(Vector.Cross_mem).toBeDefined();
        });
        it("Vector should have Normalize method", function () {
            expect(Vector.Normalize).toBeDefined();
        });
        it("Vector should have Normalize_mem method", function () {
            expect(Vector.Normalize_mem).toBeDefined();
        });
        it("Vector should have Negate method", function () {
            expect(Vector.Negate).toBeDefined();
        });
        it("Vector should have Negate_mem method", function () {
            expect(Vector.Negate_mem).toBeDefined();
        });
        it("Vector should have Abs method", function () {
            expect(Vector.Abs).toBeDefined();
        });
        it("Vector should have Abs_mem method", function () {
            expect(Vector.Abs_mem).toBeDefined();
        });
        it("Vector should have Add method", function () {
            expect(Vector.Add).toBeDefined();
        });
        it("Vector should have Add_mem method", function () {
            expect(Vector.Add_mem).toBeDefined();
        });
        it("Vector should have Sub method", function () {
            expect(Vector.Sub).toBeDefined();
        });
        it("Vector should have Sub_mem method", function () {
            expect(Vector.Sub_mem).toBeDefined();
        });
        it("Vector should have Mul method", function () {
            expect(Vector.Mul).toBeDefined();
        });
        it("Vector should have Mul_mem method", function () {
            expect(Vector.Mul_mem).toBeDefined();
        });
        it("Vector should have Div method", function () {
            expect(Vector.Div).toBeDefined();
        });
        it("Vector should have Div_mem method", function () {
            expect(Vector.Div_mem).toBeDefined();
        });
        it("Vector should have Mod method", function () {
            expect(Vector.Mod).toBeDefined();
        });
        it("Vector should have Mod_mem method", function () {
            expect(Vector.Mod_mem).toBeDefined();
        });
        it("Vector should have AddScalar method", function () {
            expect(Vector.AddScalar).toBeDefined();
        });
        it("Vector should have AddScalar_mem method", function () {
            expect(Vector.AddScalar_mem).toBeDefined();
        });
        it("Vector should have SubScalar method", function () {
            expect(Vector.SubScalar).toBeDefined();
        });
        it("Vector should have SubScalar_mem method", function () {
            expect(Vector.SubScalar_mem).toBeDefined();
        });
        it("Vector should have MulScalar method", function () {
            expect(Vector.MulScalar).toBeDefined();
        });
        it("Vector should have MulScalar_mem method", function () {
            expect(Vector.MulScalar_mem).toBeDefined();
        });
        it("Vector should have DivScalar method", function () {
            expect(Vector.DivScalar).toBeDefined();
        });
        it("Vector should have DivScalar_mem method", function () {
            expect(Vector.DivScalar_mem).toBeDefined();
        });
        it("Vector should have Min method", function () {
            expect(Vector.Min).toBeDefined();
        });
        it("Vector should have Min_mem method", function () {
            expect(Vector.Min_mem).toBeDefined();
        });
        it("Vector should have Max method", function () {
            expect(Vector.Max).toBeDefined();
        });
        it("Vector should have Max_mem method", function () {
            expect(Vector.Max_mem).toBeDefined();
        });
        it("Vector should have MinAxis method", function () {
            expect(Vector.MinAxis).toBeDefined();
        });
        it("Vector should have MinAxis_mem method", function () {
            expect(Vector.MinAxis_mem).toBeDefined();
        });
        it("Vector should have MinComponent method", function () {
            expect(Vector.MinComponent).toBeDefined();
        });
        it("Vector should have MinComponent_mem method", function () {
            expect(Vector.MinComponent_mem).toBeDefined();
        });
        it("Vector should have MaxComponent method", function () {
            expect(Vector.MaxComponent).toBeDefined();
        });
        it("Vector should have MaxComponent_mem method", function () {
            expect(Vector.MaxComponent_mem).toBeDefined();
        });
        it("Vector should have Reflect method", function () {
            expect(Vector.Reflect).toBeDefined();
        });
        it("Vector should have Reflect_mem method", function () {
            expect(Vector.Reflect_mem).toBeDefined();
        });
        it("Vector should have Refract method", function () {
            expect(Vector.Refract).toBeDefined();
        });
        it("Vector should have Refract_mem method", function () {
            expect(Vector.Refract_mem).toBeDefined();
        });
        it("Vector should have Reflectance method", function () {
            expect(Vector.Reflectance).toBeDefined();
        });
        it("Vector should have Reflectance_mem method", function () {
            expect(Vector.Reflectance_mem).toBeDefined();
        });
    });
    describe("Vector instance >> ", function () {
        it("Should create without a problem", function () {
            var vector = new Vector(0);
            expect(vector).toBeTruthy();
        });
        it("Should add without a problem", function () {
            var a1 = { X: 1, Y: 0, Z: 0 };
            var a2 = { X: 0, Y: 1, Z: 0 };
            var a3 = { X: 0, Y: 0, Z: 1 };
            var a4 = { X: 1, Y: 1, Z: 1 };
            var _red = Vector.NewVector(a1);
            var _green = Vector.NewVector(a2);
            var _blue = Vector.NewVector(a3);
            var result1 = Vector.NewVector();
            var tmp1 = Vector.Add_mem(_red, _green);
            Vector.Add_mem(tmp1, _blue, result1);
            var result2 = Vector.Add_mem(tmp1, _blue);
            expect(a4).toEqual(Vector.XYZ(result1));
            expect(a4).toEqual(Vector.XYZ(result2));
        });
        it("Should subtract without a problem", function () {
            var white = { X: 1, Y: 1, Z: 1 };
            var a2 = { X: 0, Y: 1, Z: 0 };
            var a3 = { X: 0, Y: 0, Z: 1 };
            var a1 = { X: 1, Y: 0, Z: 0 };
            var _white = Vector.NewVector(white);
            var _green = Vector.NewVector(a2);
            var _blue = Vector.NewVector(a3);
            var result1 = Vector.NewVector();
            var tmp1 = Vector.Sub_mem(_white, _blue);
            Vector.Sub_mem(tmp1, _green, result1);
            var result2 = Vector.Sub_mem(tmp1, _green);
            expect(a1).toEqual(Vector.XYZ(result1));
            expect(a1).toEqual(Vector.XYZ(result2));
        });
        it("Should multiply without a problem", function () {
            var a1 = { X: 1, Y: 0, Z: 0 };
            var a2 = { X: 0, Y: 1, Z: 0 };
            var a3 = { X: 0, Y: 0, Z: 1 };
            var black = { X: 0, Y: 0, Z: 0 };
            var _red = Vector.NewVector(a1);
            var _green = Vector.NewVector(a2);
            var _blue = Vector.NewVector(a3);
            var result1 = Vector.NewVector();
            var tmp1 = Vector.Mul_mem(_red, _green);
            Vector.Mul_mem(tmp1, _blue, result1);
            var result2 = Vector.Mul_mem(tmp1, _blue);
            expect(black).toEqual(Vector.XYZ(result1));
            expect(black).toEqual(Vector.XYZ(result2));
        });
        it("Should multiply scalar without a problem", function () {
            var white = { X: 1, Y: 1, Z: 1 };
            var halfwhite = { X: 0.5, Y: 0.5, Z: 0.5 };
            var _white = Vector.NewVector(white);
            var result1 = Vector.NewVector();
            Vector.MulScalar_mem(_white, 0.5, result1);
            var result2 = Vector.MulScalar_mem(_white, 0.5);
            var result3 = Vector.MulScalar_mem(_white, 0.5000000000000001);
            expect(halfwhite).toEqual(Vector.XYZ(result1));
            expect(halfwhite).toEqual(Vector.XYZ(result2));
            expect(halfwhite).not.toEqual(Vector.XYZ(result3));
        });
        it("Should divide scalar without a problem", function () {
            var white = { X: 1, Y: 1, Z: 1 };
            var halfwhite = { X: 0.5, Y: 0.5, Z: 0.5 };
            var _white = Vector.NewVector(white);
            var result1 = Vector.NewVector();
            Vector.DivScalar_mem(_white, 2, result1);
            var result2 = Vector.DivScalar_mem(_white, 2);
            expect(halfwhite).toEqual(Vector.XYZ(result1));
            expect(halfwhite).toEqual(Vector.XYZ(result2));
        });
        it("Should calculate minimum value without a problem", function () {
            var vector1 = { X: 1, Y: 0.00055, Z: 0.0255 };
            var vector2 = { X: 0.25, Y: 0.5, Z: 0.05 };
            var min = { X: 0.25, Y: 0.00055, Z: 0.0255 };
            var _c1 = Vector.NewVector(vector1);
            var _c2 = Vector.NewVector(vector2);
            var result1 = Vector.NewVector();
            Vector.Min_mem(_c1, _c2, result1);
            var result2 = Vector.Min_mem(_c1, _c2);
            expect(min).toEqual(Vector.XYZ(result1));
            expect(min).toEqual(Vector.XYZ(result2));
        });
        it("Should calculate maximum value without a problem", function () {
            var vector1 = { X: 1, Y: 0.00055, Z: 0.0255 };
            var vector2 = { X: 0.25, Y: 0.5, Z: 0.05 };
            var max = { X: 1, Y: 0.5, Z: 0.05 };
            var _c1 = Vector.NewVector(vector1);
            var _c2 = Vector.NewVector(vector2);
            var result1 = Vector.NewVector();
            Vector.Max_mem(_c1, _c2, result1);
            var result2 = Vector.Max_mem(_c1, _c2);
            expect(max).toEqual(Vector.XYZ(result1));
            expect(max).toEqual(Vector.XYZ(result2));
        });
        it("Should calculate minimum component without a problem", function () {
            var vector1 = { X: 1, Y: 0.00055, Z: 0.0255 };
            var _c1 = Vector.NewVector(vector1);
            var result = Vector.MinComponent_mem(_c1);
            expect(result).toEqual(0.00055);
        });
        it("Should calculate maximum component without a problem", function () {
            var vector1 = { X: 1, Y: 0.00055, Z: 0.0255 };
            var _c1 = Vector.NewVector(vector1);
            var result = Vector.MaxComponent_mem(_c1);
            expect(result).toEqual(1);
        });
        it("Should calculate power without a problem", function () {
            var factor = 2;
            var vector = { X: 1, Y: 0.00055, Z: 0.0255 };
            var color_pow = {
                X: Math.pow(vector.X, factor),
                Y: Math.pow(vector.Y, factor),
                Z: Math.pow(vector.Z, factor)
            };
            var _c1 = Vector.NewVector(vector);
            var result = Vector.Pow_mem(_c1, factor);
            expect(Vector.XYZ(result)).toEqual(color_pow);
        });
        it("Should check IsEqual without a problem", function () {
            var vector1 = { X: 0.256, Y: 0, Z: 1 };
            var vector2 = { X: 0.256, Y: 0, Z: 1 };
            var color3 = { X: 0.254, Y: 1, Z: 0.0255 };
            var _c1 = Vector.NewVector(vector1);
            var _c2 = Vector.NewVector(vector2);
            var _c3 = Vector.NewVector(color3);
            var result1 = Vector.IsEqual(_c1, _c2);
            var result2 = Vector.IsEqual(_c2, _c1);
            var result3 = Vector.IsEqual(_c1, _c3);
            var result4 = Vector.IsEqual(_c2, _c3);
            expect(result1).toBeTruthy();
            expect(result2).toBeTruthy();
            expect(result3).not.toBeTruthy();
            expect(result4).not.toBeTruthy();
        });
        it("Should set value without a problem", function () {
            var a3 = { X: 0, Y: 0, Z: 1 };
            var _c = Vector.NewVector();
            var result = Vector.Set(_c, a3.X, a3.Y, a3.Z);
            expect(Vector.XYZ(result)).toEqual(a3);
        });
        it("Should clone without a problem", function () {
            var a3 = { X: 0, Y: 0, Z: 1 };
            var _c = Vector.NewVector(a3);
            var result = Vector.Clone(_c);
            expect(Vector.XYZ(result)).toEqual(a3);
        });
        it("Should create random vector without a problem", function () {
            var vector1 = Vector.RandomUnitVector();
            var vector2 = Vector.RandomUnitVector();
            expect(vector1).not.toBeNull();
            expect(vector2).not.toBeNull();
            expect(Vector.XYZ(vector1)).not.toBeNull();
            expect(Vector.XYZ(vector2)).not.toBeNull();
            expect(Vector.XYZ(vector1)).not.toEqual(Vector.XYZ(vector2));
        });
    });
    describe("Matrix definition >> ", function () {
        it("Matrix should have defined", function () {
            expect(Matrix).toBeDefined();
        });
        it("Matrix should have Identity method", function () {
            expect(Matrix.Identity).toBeDefined();
        });
        it("Matrix should have NewMatrix method", function () {
            expect(Matrix.NewMatrix).toBeDefined();
        });
        it("Matrix should have TranslateUnitMatrix method", function () {
            expect(Matrix.TranslateUnitMatrix).toBeDefined();
        });
        it("Matrix should have ScaleUnitMatrix method", function () {
            expect(Matrix.ScaleUnitMatrix).toBeDefined();
        });
        it("Matrix should have RotateUnitMatrix method", function () {
            expect(Matrix.RotateUnitMatrix).toBeDefined();
        });
        it("Matrix should have FrustumUnitMatrix method", function () {
            expect(Matrix.FrustumUnitMatrix).toBeDefined();
        });
        it("Matrix should have OrthographicUnitMatrix method", function () {
            expect(Matrix.OrthographicUnitMatrix).toBeDefined();
        });
        it("Matrix should have PerspectiveUnitMatrix method", function () {
            expect(Matrix.PerspectiveUnitMatrix).toBeDefined();
        });
        it("Matrix should have LookAtMatrix method", function () {
            expect(Matrix.LookAtMatrix).toBeDefined();
        });
        it("Matrix should have Translate method", function () {
            expect(Matrix.Translate).toBeDefined();
        });
        it("Matrix should have Scale method", function () {
            expect(Matrix.Scale).toBeDefined();
        });
        it("Matrix should have Rotate method", function () {
            expect(Matrix.Rotate).toBeDefined();
        });
        it("Matrix should have Frustum method", function () {
            expect(Matrix.Frustum).toBeDefined();
        });
        it("Matrix should have Orthographic method", function () {
            expect(Matrix.Orthographic).toBeDefined();
        });
        it("Matrix should have Perspective method", function () {
            expect(Matrix.Perspective).toBeDefined();
        });
        it("Matrix should have Mul method", function () {
            expect(Matrix.Mul).toBeDefined();
        });
        it("Matrix should have MulPosition method", function () {
            expect(Matrix.MulPosition).toBeDefined();
        });
        it("Matrix should have MulDirection method", function () {
            expect(Matrix.MulDirection).toBeDefined();
        });
        it("Matrix should have Mul method", function () {
            expect(Matrix.Mul).toBeDefined();
        });
        it("Matrix should have MulRay method", function () {
            expect(Matrix.MulRay).toBeDefined();
        });
        it("Matrix should have MulBox method", function () {
            expect(Matrix.MulBox).toBeDefined();
        });
        it("Matrix should have Transpose method", function () {
            expect(Matrix.Transpose).toBeDefined();
        });
        it("Matrix should have Determinant method", function () {
            expect(Matrix.Determinant).toBeDefined();
        });
        it("Matrix should have Inverse method", function () {
            expect(Matrix.Inverse).toBeDefined();
        });
    });
    describe("Matrix instance >> ", function () {
        it("Should create without a problem", function () {
            var matrix = new Matrix(0);
            expect(matrix).toBeTruthy();
        });
        it("Should TranslateUnitMatrix without a problem", function () {
            var a1 = { X: 1, Y: 0, Z: 0 };
            var vec = Vector.NewVector(a1);
            var expectedMat = Matrix.NewMatrix(1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            var transUnitMatrix = Matrix.TranslateUnitMatrix(vec);
            expect(Matrix.IsEqual(transUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(transUnitMatrix)).not.toBeTruthy();
        });
        it("Should ScaleUnitMatrix without a problem", function () {
            var a1 = { X: 1, Y: 0, Z: 0 };
            var vec = Vector.NewVector(a1);
            var expectedMat = Matrix.NewMatrix(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
            var scaleUnitMatrix = Matrix.ScaleUnitMatrix(vec);
            expect(Matrix.IsEqual(scaleUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(scaleUnitMatrix)).not.toBeTruthy();
        });
        it("Should RotateUnitMatrix without a problem", function () {
            var a1 = { X: 1, Y: 0, Z: 0 };
            var vec = Vector.NewVector(a1);
            var expectedMat = Matrix.NewMatrix(1, 0, 0, 0, 0, -0.4480736161291702, 0.8939966636005579, 0, 0, -0.8939966636005579, -0.4480736161291702, 0, 0, 0, 0, 1);
            var rotateUnitMatrix = Matrix.RotateUnitMatrix(vec, 90);
            expect(Matrix.IsEqual(rotateUnitMatrix, expectedMat)).toBeTruthy();
            expect(Matrix.IsIdentity(rotateUnitMatrix)).not.toBeTruthy();
        });
    });
});
//# sourceMappingURL=xray-kernel-turbo.spec.js.map