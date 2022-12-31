import { FORMAT_MD, suite } from "@thi.ng/bench";
import { Julia, JuliaArray } from "../../index.js";

Julia.init({ project: null });

const genArray = (n: number) => {
  const arr = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = Math.random();
  }
  return arr;
};

const arr1000 = genArray(1000);
const arr10000 = genArray(10000);
const arr100000 = genArray(100000);
const arr1000000 = genArray(1000000);

const bunFn = (arr: Float64Array) => {
  let max = 0;
  for (let i = 0; i < arr.length; i++) {
    max = Math.max(max, arr[i]);
  }
  return max;
};

const juliaFn = (arr: Float64Array) => {
  const jlArr = JuliaArray.from(arr);
  return Julia.Base.maximum(jlArr).value;
};

suite(
  [
    { title: "bun max of 1000", fn: () => bunFn(arr1000) },
    { title: "julia max of 1000", fn: () => juliaFn(arr1000) },
    { title: "bun max of 10000", fn: () => bunFn(arr10000) },
    { title: "julia max of 10000", fn: () => juliaFn(arr10000) },
    { title: "bun max of 100000", fn: () => bunFn(arr100000) },
    { title: "julia max of 100000", fn: () => juliaFn(arr100000) },
    { title: "bun max of 1000000", fn: () => bunFn(arr1000000) },
    { title: "julia max of 1000000", fn: () => juliaFn(arr1000000) },
  ],
  {
    iter: 10,
    size: 100,
    warmup: 5,
    format: FORMAT_MD,
  },
);

Julia.close();
