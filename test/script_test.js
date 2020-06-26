import { strict as assert } from "assert";

import { _minimalStore } from "../src/script.js";

assert(JSON.stringify(_minimalStore()) === JSON.stringify(_minimalStore()));
