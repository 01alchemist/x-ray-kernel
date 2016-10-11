import {NativeMod} from "./NativeMod";
import {api, CWrap} from "./api";
/**
 * ...
 * @author Nidin Vinayakan
 * @company 01 Alchemist | Munich | Germany
 */

export class Kernel {

    public api:{[key:string]:Function};

    constructor(nativeMod:NativeMod) {
        this.api = {};
        this.mapNativeFunctions(nativeMod);
    }

    private mapNativeFunctions(nativeMod:NativeMod) {
        api.forEach((cwrap:CWrap) => {
            this.api[cwrap.name] = nativeMod.cwrap(cwrap.name, cwrap.returnType, cwrap.argumentTypes);
        });
    };
}