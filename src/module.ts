import { jlbun } from "./wrapper.js";
import { MethodError } from "./errors.js";
import { safeCString } from "./utils.js";
import { Julia, JuliaFunction, WrappedPointer } from "./types.js";

export class JuliaModule implements WrappedPointer {
  ptr: number;
  name: string;
  cache: Map<string, JuliaFunction>;
  [key: string]: any;

  constructor(ptr: number, name: string) {
    this.ptr = ptr;
    this.name = name;
    this.cache = new Map();

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "ptr") {
          return target.ptr;
        }
        if (target.cache.has(prop as string)) {
          return target.cache.get(prop as string);
        }

        const exist = jlbun.symbols.jl_hasproperty(
          target.ptr,
          safeCString(prop as string),
        );
        if (exist === 0) {
          throw new MethodError(
            `${prop as string} does not exist in module ${target.name}!`,
          );
        }

        const juliaFunc = Julia.getFunction(target, prop as string);
        target.cache.set(prop as string, juliaFunc);
        return juliaFunc;
      },
    });
  }
}