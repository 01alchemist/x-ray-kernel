/**
 * ...
 * @author Nidin Vinayakan
 * @company 01 Alchemist | Munich | Germany
 */

export interface NativeMod{
    cwrap(name:string, ...arg):Function;
}