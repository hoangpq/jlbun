import { jlbun, Julia, JuliaSymbol, IJuliaValue } from "./index.js";

export class JuliaTuple implements IJuliaValue {
  ptr: number;
  length: number;

  constructor(ptr: number) {
    this.ptr = ptr;
    this.length = jlbun.symbols.jl_nfields_getter(this.ptr);
  }

  get(index: number): IJuliaValue {
    return Julia.wrapPtr(jlbun.symbols.jl_get_nth_field(this.ptr, index));
  }

  get value(): IJuliaValue[] {
    const len = this.length;
    let arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.get(i));
    }
    return arr;
  }

  toString(): string {
    return `(${this.value.map((x) => x.toString()).join(", ")})`;
  }
}

export class JuliaNamedTuple implements IJuliaValue {
  ptr: number;
  length: number;
  fieldNames: string[];

  constructor(ptr: number) {
    this.ptr = ptr;
    this.length = Number(jlbun.symbols.jl_nfields_getter(this.ptr));
    this.fieldNames = Julia.Base.fieldnames(Julia.Base.typeof(this)).value.map(
      (x: JuliaSymbol) => x.name,
    );
  }

  get(index: number): IJuliaValue {
    return Julia.wrapPtr(jlbun.symbols.jl_get_nth_field(this.ptr, index));
  }

  get value(): Map<string, IJuliaValue> {
    const len = this.length;
    let obj = new Map<string, IJuliaValue>();
    for (let i = 0; i < len; i++) {
      obj.set(this.fieldNames[i], this.get(i));
    }
    return obj;
  }

  toString(): string {
    return `(${Array.from(this.value.entries())
      .map(([key, value]) => `${key} = ${value.toString()}`)
      .join(", ")})`;
  }
}
