# jlbun - Using Julia in Bun

## Installation

> You need to have `Bun`, `CMake` and `Julia` installed to use this library.

```bash
bun install && bun rebuild
```

## Usage

### Pass a Bun array to Julia

```typescript
import { Julia, JuliaArray } from "./src/index.js";

// This initializes Julia and loads prelude symbols.
Julia.init();

// Create a `TypedArray` at the Bun side.
const bunArray = new Float64Array([1, 2, 3, 4, 5]);

// Create a `JuliaArray` from the `TypedArray`.
const juliaArray = JuliaArray.from(bunArray);

// These two arrays now share the same memory.
Julia.Base.println(juliaArray); // [1.0, 2.0, 3.0, 4.0, 5.0]

// We can modify the array at the Bun side (0-indexed).
bunArray[1] = 100.0;
Julia.Base.println(juliaArray); // [1.0, 100.0, 3.0, 4.0, 5.0]

// Or we can modify the array at the Julia side (also 0-indexed).
juliaArray.set(0, -10.0);
Julia.Base.println(juliaArray); // [-10.0, 100.0, 3.0, 4.0, 5.0]

// This cleans up Julia-related stuff.
Julia.close();
```

### Pass a Julia Array to Bun

```typescript
import { Julia } from "./src/index.js";

Julia.init();

const juliaArray = Julia.Base.rand(10, 10);
const bunArray = juliaArray.value;
console.log(bunArray);

Julia.close();
```

### Do some linear algebra

```typescript
import { Julia } from "./src/index.js";

Julia.init();

const juliaArray = Julia.Base.rand(2, 2);
const inv = Julia.Base.inv(juliaArray);
console.log(inv.value);

const anotherJuliaArray = Julia.Base.rand(2, 2);
const product = Julia.Base["*"](juliaArray, anotherJuliaArray);
console.log(product.value);

// We can also import Julia modules.
const LA = Julia.import("LinearAlgebra");
console.log(LA.norm(product).value);

Julia.close();
```

## TODO

- [ ] Tuple
- [ ] Range
- [ ] Dict
- [ ] Set
