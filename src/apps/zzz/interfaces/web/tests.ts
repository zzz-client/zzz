import { describe, it } from "https://deno.land/std/testing/bdd.ts";
import { fail } from "https://deno.land/std/assert/fail.ts";
import DI from "../../../../lib/di.ts";

import { newInstance as iNewInstance } from "../../../../lib/di.ts";
export const newRealInstance = {
  newInstance(): object {
    return {
      describe,
      it,
      fail,
    };
  },
} as iNewInstance;

if (import.meta.url.startsWith("file://")) {
  console.log("YAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPP");
  DI.register("ITest", newRealInstance);
}
