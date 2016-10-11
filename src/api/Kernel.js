define(["require", "exports", "./api"], function (require, exports, api_1) {
    "use strict";
    /**
     * ...
     * @author Nidin Vinayakan
     * @company 01 Alchemist | Munich | Germany
     */
    var Kernel = (function () {
        function Kernel(nativeMod) {
            this.api = {};
            this.mapNativeFunctions(nativeMod);
        }
        Kernel.prototype.mapNativeFunctions = function (nativeMod) {
            var _this = this;
            api_1.api.forEach(function (cwrap) {
                _this.api[cwrap.name] = nativeMod.cwrap(cwrap.name, cwrap.returnType, cwrap.argumentTypes);
            });
        };
        ;
        return Kernel;
    }());
    exports.Kernel = Kernel;
});
//# sourceMappingURL=Kernel.js.map