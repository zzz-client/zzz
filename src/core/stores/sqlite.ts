import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { IStore } from "../app.ts";
import { ModelType } from "../models.ts";

export default class SqliteStore implements IStore {
  database: DB;
  context?: string;
  constructor(filePath: string) {
    this.database = new DB(filePath);
    this._init();
  }
  get(modelType: ModelType, entityId: string, environmentName: string): Promise<any> {
    const x = this.database.query("SELECT Id, Name FROM " + ModelType[modelType] + " WHERE Id = (?)", [entityId])[0];
    console.log(x);
    return Promise.resolve({
      Id: x[0],
      Name: x[1],
    });
  }
  store(key: string, value: any, environmentName: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  setContext(context: string): void {
    this.context = context;
  }
  _init(): Promise<void> {
    this.database.execute(`
      CREATE TABLE IF NOT EXISTS Request (
        Id TEXT UNIQUE,
        Name TEXT,
        Url TEXT,
        Method TEXT,
        Headers TEXT,
        QueryParams TEXT,
        Variables TEXT,
        Body TEXT,
        FolderId TEXT
        )
      `);
    this.database.execute(`
      CREATE TABLE IF NOT EXISTS Collection (
        Id TEXT UNIQUE,
        Name TEXT
      );
    `);
    this.database.execute(`
      CREATE TABLE IF NOT EXISTS Folder (
        Id TEXT UNIQUE,
        Name TEXT,
        Variables TEXT,
        CollectionId TEXT
      )
    `);
    this.database.execute(`
      CREATE TABLE IF NOT EXISTS Environment (
        Id TEXT UNIQUE,
        Name TEXT,
        Variables TEXT
      )
    `);
    if (this.database.query("SELECT Id FROM Collection WHERE Id = (?)", ["Salesforce Primary"]).length === 0) {
      this.database.query('INSERT INTO Collection (Id, Name) VALUES ("Salesforce Primary", "Salesforce Primary")', []);
    }
    return Promise.resolve();
  }
  // db.close();
}
