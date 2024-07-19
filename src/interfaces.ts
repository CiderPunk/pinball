import { Vector2, Vector3 } from "@babylonjs/core/Maths/math";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PhysicsBody } from "@babylonjs/core/Physics";
import { Scene } from "@babylonjs/core/scene";

export interface IGame{
  scene:Scene
  startGame():void
}

export interface IEntity{
  rootMesh:AbstractMesh
  update(dT:number):void
}

export interface ITrigger{
  onTriggerExit(collider: PhysicsBody): void;
  onTriggerEnter(collider: PhysicsBody): void;
}


export interface IInputManager{
  bind(keyCode:string, commandName:string):void
  getCommand(name:string):IInputCommand
  registerCommands(commandSpecs: ICommandSepc[]):IInputCommand[]
  registerCommand(spec: ICommandSepc):IInputCommand
}

export interface IPaddle extends IEntity{
  activate(isActive: boolean, side: string): void;

}

export interface ITable{
  update(dT: number): unknown;
  activatePaddles(isActive: boolean, side: string): void;
  launchPosition():Vector3
}

export type CommandAction  = (active:boolean,action:string)=>void;
export type AxisAction  = (val:number,action:string)=>void;
/*
export interface IJoystickSpec{
  name:string
  action:string
  vertical:
  horizontal:IAxisSpec
}
*/

export interface IInputBase{
  name:string
  action:string
}

export interface IAxisBase extends IInputBase{
  value:number
  single:boolean
}

export interface ICommandAxisSpec extends IInputBase{
  single:boolean
  defaultPositiveControls:Array<string>
  defaultNegativeControls?:Array<string>
}

export interface ICommandSepc extends IInputBase{
  defaultControls:Array<string>
}

export interface IInputCommand extends IInputBase{
  getDefaultControls():Readonly<Array<string>>
  //unique name of command
  name:string
  //is active
  isActive:boolean

  Subscribe(act:CommandAction):void
  Unsubscribe(act:CommandAction):void
}