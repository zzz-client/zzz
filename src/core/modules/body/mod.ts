import { Action, asAny, Trace } from "../../etc.ts";
import { IModuleFields, IModuleModifier, Module } from "../../module.ts";
import { Model } from "../../storage/mod.ts";
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
      await loadBody(entity);
    }
    return Promise.resolve();
  }
}

function loadBody(entity: Model): Promise<void> {
  const body = asAny(entity).Body;
  if (typeof body === "string") {
    asAny(entity).Body = Deno.readTextFileSync(body);
  }
  return Promise.resolve();
}

class BodyFields {
  Body!: string | object;
}

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, assertSpyCall, describe, it, returnsNext, stub, TestStore } from "../../tests.ts";

describe("Body Module", () => {
  it("sets object body correctly", () => {
    const testStore = new TestStore();
    const module = new BodyModule(testStore);
    // GIVEN
    const request = new HttpRequest();
    asAny(request).Body = { foo: "bar" };
    const action = new Action({}, {});
    // WHEN
    module.modify(request, action);
    // THEN
    assertEquals(asAny(request).Body, { foo: "bar" }, "Body attribute not set correctly");
  });
  it("sets file body correctly", () => {
    const testStore = new TestStore();
    const module = new BodyModule(testStore);
    const testBodyContents = '{"foo":"bar"}';
    const readTextFileStub = stub(Deno, "readTextFileSync", returnsNext([testBodyContents]));
    // GIVEN
    const request = new HttpRequest();
    asAny(request).Body = "test/file/path";
    const action = new Action({}, {});
    // WHEN
    module.modify(request, action);
    // THEN
    assertSpyCall(readTextFileStub, 0, {
      args: ["test/file/path"],
      returned: testBodyContents,
    });
    assertEquals(asAny(request).Body, testBodyContents, "Body attribute not set correctly");
    readTextFileStub.restore();
  });
});
