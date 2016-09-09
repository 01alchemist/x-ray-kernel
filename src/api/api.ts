export interface CWrap{
    name:string;
    returnType:string;
    argumentTypes:string[];
}
export var api:CWrap[] = [];

api.push({name: "newScene", returnType: "number", argumentTypes: ["number"]});
