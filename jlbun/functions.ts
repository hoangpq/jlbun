import { IJuliaValue, Julia } from "./index.js";

export class JuliaFunction extends Function implements IJuliaValue {
  ptr: number;
  name: string;

  constructor(ptr: number, name: string) {
    super();
    this.ptr = ptr;
    this.name = name;
    return new Proxy(this, {
      apply: (target, _thisArg, args) => Julia.call(target, ...args),
    });
  }

  get value(): string {
    return this.toString();
  }

  toString(): string {
    return `[Function] ${this.name}`;
  }
}
