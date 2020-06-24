import { strict as assert } from "assert";

import { buildStore, _minimalStore } from "../src/script.js";

assert.equal(buildStore("hoge"), _minimalStore());
