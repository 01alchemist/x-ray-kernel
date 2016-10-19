///<reference path="./xray-kernel-turbo.ts" />
import kernel = require("./xray-kernel-turbo");

const Color = kernel.Color;
const turbo = kernel.turbo;

describe("Turbo Runtime suite", () => {

    it("Turbo should have defined", () => {
        expect(turbo).toBeDefined();
    });

    it("Turbo Runtime should have defined", () => {
        expect(turbo.Runtime).toBeDefined();
    });

});
describe("Kernel suite >> ", () => {

    it("Kernel should have defined", () => {
        expect(kernel).toBeDefined();
    });

    describe("Color definition >> ", () => {

        it("Color should have defined", () => {
            expect(Color).toBeDefined();
        });

        it("Color should have init method", () => {
            expect(Color.init).toBeDefined();
        });

        it("Color should have set method", () => {
            expect(Color.set).toBeDefined();
        });

        it("Color should have HexColor method", () => {
            expect(Color.HexColor).toBeDefined();
        });

        it("Color should have Kelvin method", () => {
            expect(Color.Kelvin).toBeDefined();
        });

        it("Color should have NewColor method", () => {
            expect(Color.NewColor).toBeDefined();
        });

        it("Color should have RGBA method", () => {
            expect(Color.RGBA).toBeDefined();
        });

        it("Color should have RGBA64 method", () => {
            expect(Color.RGBA64).toBeDefined();
        });
        it("Color should have Add method", () => {
            expect(Color.Add).toBeDefined();
        });

        it("Color should have Add_mem method", () => {
            expect(Color.Add_mem).toBeDefined();
        });

        it("Color should have Sub method", () => {
            expect(Color.Sub).toBeDefined();
        });

        it("Color should have Sub_mem method", () => {
            expect(Color.Sub_mem).toBeDefined();
        });

        it("Color should have Mul method", () => {
            expect(Color.Mul).toBeDefined();
        });

        it("Color should have Mul_mem method", () => {
            expect(Color.Mul_mem).toBeDefined();
        });

        it("Color should have MulScalar method", () => {
            expect(Color.MulScalar).toBeDefined();
        });

        it("Color should have MulScalar_mem method", () => {
            expect(Color.MulScalar_mem).toBeDefined();
        });

        it("Color should have DivScalar method", () => {
            expect(Color.DivScalar).toBeDefined();
        });

        it("Color should have DivScalar_mem method", () => {
            expect(Color.DivScalar_mem).toBeDefined();
        });

        it("Color should have Min method", () => {
            expect(Color.Min).toBeDefined();
        });

        it("Color should have Min_mem method", () => {
            expect(Color.Min_mem).toBeDefined();
        });

        it("Color should have Max method", () => {
            expect(Color.Max).toBeDefined();
        });

        it("Color should have Max_mem method", () => {
            expect(Color.Max_mem).toBeDefined();
        });

        it("Color should have MinComponent method", () => {
            expect(Color.MinComponent).toBeDefined();
        });

        it("Color should have MinComponent_mem method", () => {
            expect(Color.MinComponent_mem).toBeDefined();
        });

        it("Color should have MaxComponent method", () => {
            expect(Color.MaxComponent).toBeDefined();
        });

        it("Color should have MaxComponent_mem method", () => {
            expect(Color.MaxComponent_mem).toBeDefined();
        });

        it("Color should have Pow method", () => {
            expect(Color.Pow).toBeDefined();
        });

        it("Color should have Pow_mem method", () => {
            expect(Color.Pow_mem).toBeDefined();
        });

        it("Color should have Mix method", () => {
            expect(Color.Mix).toBeDefined();
        });

        it("Color should have Mix_mem method", () => {
            expect(Color.Mix_mem).toBeDefined();
        });

        it("Color should have Clone method", () => {
            expect(Color.Clone).toBeDefined();
        });

        it("Color should have Random method", () => {
            expect(Color.Random).toBeDefined();
        });

        it("Color should have RandomBrightColor method", () => {
            expect(Color.RandomBrightColor).toBeDefined();
        });

        it("Color should have BrightColors property", () => {
            expect(Color.BrightColors).toBeDefined();
        });
    });

    describe("Color instance >> ", () => {

        it("Should create with out a problem", () => {
            let color = new Color(0);
            expect(color).toBeTruthy();
        });

        it("Should add with out a problem", () => {

            let red = {R: 1, G: 0, B: 0};
            let green = {R: 0, G: 1, B: 0};
            let blue = {R: 0, G: 0, B: 1};
            let white = {R: 255, G: 255, B: 255, A:255};

            let color1:number = Color.NewColor(red);
            let color2:number = Color.NewColor(green);
            let color3:number = Color.NewColor(blue);

            let c3:number = Color.Add_mem(color1, color2);
            c3 = Color.Add_mem(c3, color3);

            expect(white).toEqual(Color.RGBA(c3));
        });
    });

});