import kernel = require("./xray-kernel-turbo");

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
            expect(kernel.Color).toBeDefined();
        });

        it("Color should have init method", () => {
            expect(kernel.Color.init).toBeDefined();
        });

        it("Color should have set method", () => {
            expect(kernel.Color.set).toBeDefined();
        });

        it("Color should have HexColor method", () => {
            expect(kernel.Color.HexColor).toBeDefined();
        });

        it("Color should have Kelvin method", () => {
            expect(kernel.Color.Kelvin).toBeDefined();
        });

        it("Color should have NewColor method", () => {
            expect(kernel.Color.NewColor).toBeDefined();
        });

        it("Color should have RGBA method", () => {
            expect(kernel.Color.RGBA).toBeDefined();
        });

        it("Color should have RGBA64 method", () => {
            expect(kernel.Color.RGBA64).toBeDefined();
        });

        it("Color should have Add method", () => {
            expect(kernel.Color.Add).toBeDefined();
        });

        it("Color should have Add_mem method", () => {
            expect(kernel.Color.Add_mem).toBeDefined();
        });

        it("Color should have Sub method", () => {
            expect(kernel.Color.Sub).toBeDefined();
        });

        it("Color should have Sub_mem method", () => {
            expect(kernel.Color.Sub_mem).toBeDefined();
        });

        it("Color should have Mul method", () => {
            expect(kernel.Color.Mul).toBeDefined();
        });

        it("Color should have Mul_mem method", () => {
            expect(kernel.Color.Mul_mem).toBeDefined();
        });

        it("Color should have MulScalar method", () => {
            expect(kernel.Color.MulScalar).toBeDefined();
        });

        it("Color should have MulScalar_mem method", () => {
            expect(kernel.Color.MulScalar_mem).toBeDefined();
        });

        it("Color should have DivScalar method", () => {
            expect(kernel.Color.DivScalar).toBeDefined();
        });

        it("Color should have DivScalar_mem method", () => {
            expect(kernel.Color.DivScalar_mem).toBeDefined();
        });

        it("Color should have Min method", () => {
            expect(kernel.Color.Min).toBeDefined();
        });

        it("Color should have Min_mem method", () => {
            expect(kernel.Color.Min_mem).toBeDefined();
        });

        it("Color should have Max method", () => {
            expect(kernel.Color.Max).toBeDefined();
        });

        it("Color should have Max_mem method", () => {
            expect(kernel.Color.Max_mem).toBeDefined();
        });

        it("Color should have MinComponent method", () => {
            expect(kernel.Color.MinComponent).toBeDefined();
        });

        it("Color should have MinComponent_mem method", () => {
            expect(kernel.Color.MinComponent_mem).toBeDefined();
        });

        it("Color should have MaxComponent method", () => {
            expect(kernel.Color.MaxComponent).toBeDefined();
        });

        it("Color should have MaxComponent_mem method", () => {
            expect(kernel.Color.MaxComponent_mem).toBeDefined();
        });

        it("Color should have Pow method", () => {
            expect(kernel.Color.Pow).toBeDefined();
        });

        it("Color should have Pow_mem method", () => {
            expect(kernel.Color.Pow_mem).toBeDefined();
        });

        it("Color should have Mix method", () => {
            expect(kernel.Color.Mix).toBeDefined();
        });

        it("Color should have Mix_mem method", () => {
            expect(kernel.Color.Mix_mem).toBeDefined();
        });

        it("Color should have Clone method", () => {
            expect(kernel.Color.Clone).toBeDefined();
        });

        it("Color should have Random method", () => {
            expect(kernel.Color.Random).toBeDefined();
        });

        it("Color should have RandomBrightColor method", () => {
            expect(kernel.Color.RandomBrightColor).toBeDefined();
        });

        it("Color should have BrightColors property", () => {
            expect(kernel.Color.BrightColors).toBeDefined();
        });
    });

    describe("Color instance >> ", () => {

        it("Should create with out a problem", () => {
            let color = new kernel.Color(0);
            expect(color).toBeTruthy();
        });

        it("Should add with out a problem", () => {
            let color1 = new kernel.Color();
            let color2 = new kernel.Color();

            let c3 = kernel.Color.Add_mem(color1, color2);
            console.log(c3);
            expect(color1).toEqual(color2);
        });
    });

});
