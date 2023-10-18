import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";

export class Plunger implements IEntity {

  rootMesh: AbstractMesh

  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh
  }

  update(dT: number): void {

  }


}