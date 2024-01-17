import { Model } from "../../core/models.ts";

export class Context implements Model {
  Type = "Context";
  Id: string;
  Name: string;
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
  }
}
