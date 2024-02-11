import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  Name = "Body";
  dependencies = [RequestsModule.name];
  fields = {
    HttpRequest: BodyFields,
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    Trace("BodyModule:modify");
    if (Module.hasFields(entity, ["Body"]) && entity instanceof HttpRequest) {
      await this.loadBody(entity);
    }
    return Promise.resolve();
  }
  private loadBody(entity: Model): Promise<void> {
    let body = asAny(entity).Body;
    if (typeof body === "string") {
      body = Deno.readTextFileSync(body);
    }
    if (body) {
      asAny(entity).Body = body;
    }
    return Promise.resolve();
  }
}

class BodyFields {
  Body!: string | object;
}

// ----------------------------------------- TESTS -----------------------------------------
import { assertEquals } from "../../../../lib/tests.ts";
import { describe, it } from "https://deno.land/std/testing/bdd.ts";

describe("Bearer Token Authorizer", () => {
  it("sets header correctly", async () => {
    // const module = new BodyModule();
    // assertEquals(module.Name, "Body");
    // assertEquals(module.dependencies, [RequestsModule.name]);
    // assertEquals(module.fields, { HttpRequest: BodyFields });
  });
});
