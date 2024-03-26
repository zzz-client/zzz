import createAppCommand from "../app.ts";
import ExecuteActor from "../core/actors/execute.ts";
import IApplication, { executeHooks, executeModules, FeatureFlags } from "../core/app.ts";
import { Command, resolvePath } from "../core/deps.ts";
import { Action, Log, Trace } from "../core/etc.ts";
import { HttpRequest } from "../core/modules/requests/mod.ts";
import { resolveScopeDir } from "../core/storage/config/mod.ts";
import { getFileFormat } from "../core/storage/files/formats.ts";
import { Model } from "../core/storage/mod.ts";

const DEFAULT_FORMAT = "json";

// deno-lint-ignore no-empty-interface
interface ExecuteOptions {}
// deno-lint-ignore no-empty-interface
interface ReadOptions {}
// deno-lint-ignore no-empty-interface
interface CreateOptions {}
// deno-lint-ignore no-empty-interface
interface UpdateOptions {}
// deno-lint-ignore no-empty-interface
interface DeleteOptions {}

async function execute(app: IApplication, modelId: string): Promise<void> {
  const modelType = await app.store.getModelType(modelId);
  if (modelType != HttpRequest.name) {
    throw new Error("Cannot execute model of type " + modelType);
  }
  const model = await readModel(modelId, app);
  const action = new Action(this.app.argv as FeatureFlags, this.app.env);
  // TODO: Pre-hooks
  await executeHooks("Before", model, action);
  const finalResult = await (new ExecuteActor()).act(model);
  await executeHooks("After", model, action);
  // TODO: Post-hooks
  output(app, finalResult);
}
async function read(app: IApplication, modelId: string): Promise<void> {
  Trace("read", modelId);
  const model = await readModel(modelId, app);
  output(app, model);
}
// deno-lint-ignore no-explicit-any
function create(app: IApplication, modelType: string, name: string, ...args: any): Promise<void> { // TODO: Type this args
  Trace("create", modelType, name);
  // const modelType = await app.store.getModelType(modelId);
  // const model = await readModel(modelId, app);
  // await app.store.set(modelType, model); //  TODO: How do create?
  if (app) {
    throw new Error("Finish implementing " + app + " " + args);
  }
  return Promise.resolve();
}
// deno-lint-ignore no-explicit-any
function update(app: IApplication, modelId: string, ...args: any): Promise<void> { // TODO: Type this args
  Trace("update", modelId);
  // const modelType = await app.store.getModelType(modelId);
  // const model = await readModel(modelId, app);
  // await app.store.set(modelType, model); //  TODO: How do create?
  if (app) {
    throw new Error("Finish implementing " + app + " " + args);
  }
  return Promise.resolve();
}
async function delort(app: IApplication, modelId: string): Promise<void> {
  Trace("delete", modelId);
  const modelType = await app.store.getModelType(modelId);
  await app.store.remove(modelType, modelId);
  output(app, `Deleted ${modelType} ${modelId}`);
  return Promise.resolve();
}
// deno-lint-ignore no-explicit-any
function output(app: IApplication, arg: any): void {
  const fileExt = app.env.ZZZ_OUTPUT || DEFAULT_FORMAT;
  console.info(getFileFormat(fileExt).stringify(arg));
}

async function readModel(modelId: string, app: IApplication): Promise<Model> {
  const flagValues = app.argv as FeatureFlags;
  const action = new Action(flagValues, app.env);
  const model = new Model(); // TODO Construct properly using modelType
  model.Id = modelId;
  try {
    await executeModules(app.modules, action, model);
    return Promise.resolve(model);
  } catch (error) {
    Log(error);
    Deno.exit(1);
    return Promise.reject(error);
  }
}
export function constructCliCommand(): Command {
  const cmd = createAppCommand();
  cmd
    .globalEnv("ZZZ_MODE=<mode:string>", "Either 'file' or 'project'")
    .globalEnv("ZZZ_SCOPE=<scope:string>", "The Scope to use")
    .globalEnv("ZZZ_CONTEXT=<context:string>", "The Context to use")
    .globalEnv("ZZZ_OUTPUT=<extension:string>", "The file extension of the format to output results as; defaults to JSON");
  return cmd;
}

async function getModelIdFromPath(path: string): Promise<string> {
  const scopeDir = await resolveScopeDir();
  const extLength = path.length - path.lastIndexOf(".");
  console.log("scopeDir", scopeDir);
  console.log("path", path);
  console.log("cwd", Deno.cwd());

  const diff = Deno.cwd().substring(scopeDir.length + 1);
  console.log("radda", diff);

  const fullPath = resolvePath(path);
  console.log("fullPath", fullPath);

  return Promise.resolve(fullPath.substring(scopeDir.length + 1 + diff.length + 1, fullPath.length - extLength));
}

export function configureRunnerCommand(cmd: Command): void {
  cmd.arguments("<path:string>")
    // deno-lint-ignore no-explicit-any
    .action(async (options: any, path: string) => {
      const modelId = await getModelIdFromPath(path);
      return options.execute ? execute(options, modelId) : read(options, modelId);
    });
}
export function configureFullCommand(cmd: Command, app: IApplication): void {
  // Act
  cmd.command("run", "Execute Request and output result; for Requests only")
    .arguments("<id:string>")
    .action((_options: void, modelId: string, ..._args) => execute(app, modelId));
  // View
  cmd.command("view", "View entity")
    .arguments("<id:string>")
    .action((_options: void, modelId: string, ..._args) => read(app, modelId));
  // Create
  cmd.command("new", "Create entity")
    .arguments("<type:string> <id:string>")
    .action((_options: void, modelType: string, modelId: string, ..._args) => create(app, modelType, modelId, ..._args));
  // Update
  cmd.command("edit", "Update entity")
    .arguments("<id:string>")
    .action((_options: void, modelId: string, ..._args) => update(app, modelId, ..._args));
  // Delete
  cmd.command("delete", "Delete entity")
    .arguments("<id:string>")
    .action((_options: void, modelId: string, ..._args) => delort(app, modelId, ..._args));
}

// TODO: Tests
