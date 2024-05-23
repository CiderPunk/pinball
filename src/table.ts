
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { IEntity, IGame, IPaddle, ITable } from "./interfaces";
import { Node } from "@babylonjs/core/node";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics/v2";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { Plunger } from "./ents/plunger";
import { Paddle } from "./ents/paddle";
import { CollisionMask, Constants } from "./constants";
import { PaddleType } from "./enums";
import { Pointer } from "./helpers/pointer";
import { Bumper } from "./ents/bumper";


export class Table implements ITable{

  loadedRoot?: Node;
  readonly shadowReceivers = new Array<AbstractMesh>()
  readonly aggregates = new Array<PhysicsAggregate>()
  launcher?:AbstractMesh
  shadowGenerator?: ShadowGenerator;
  plunger?:Plunger


  entities = new Array<IEntity>()
  leftPaddles = new Array<IPaddle>()
  rightPaddles = new Array<IPaddle>()
  floorBody?: PhysicsAggregate;

  
  public launchPosition():Vector3{
    return this.launcher?.position ?? Vector3.Zero()
  }

  public constructor(readonly owner:IGame, path:string){
    SceneLoader.Append("assets/", path, owner.scene, (scene)=>{ 
      this.loadedRoot = scene.rootNodes.find(n=>n.id == "__root__")
      if (!this.loadedRoot){
        throw new Error("Root node not found")
      }

      const tableContainer = this.loadedRoot.getChildren().find(n=>n.id=="table")
      if (!tableContainer){
        throw new Error("no table container found")
      }

      const collisionContainer = tableContainer.getChildren().find(n=>n.id === "collision")
      if (!collisionContainer){
        throw new Error("no collision container found")
      }

      collisionContainer.getChildMeshes().forEach((mesh)=>{
        const agg = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0}, scene)
        agg.shape.filterCollideMask = CollisionMask.Ball
        agg.shape.filterMembershipMask = CollisionMask.Wall
        agg.shape.material = {friction:Constants.floorFriction, restitution: Constants.floorRestitution}
        if (mesh.name == "floor"){
          this.floorBody = agg  
        }
        if (mesh.name == "glass"){
          mesh.setEnabled(false)

        }
        this.aggregates.push(agg)
      })

      const entityContainer = tableContainer.getChildren().find(n=>n.id === "ents")
      if (!entityContainer){
        throw new Error("no entity container found")
      }
  
      entityContainer.getChildMeshes().forEach((mesh)=>{
        if (mesh.name.includes("paddle")){
          if (mesh.name.includes("left")){
            this.leftPaddles.push(new Paddle(owner, mesh, PaddleType.Left, this.floorBody!))
          }
          else if (mesh.name.includes("right")){
            this.rightPaddles.push(new Paddle(owner, mesh, PaddleType.Right, this.floorBody!)) 
          }
        }


        if (mesh.name.includes("bumper")){
          this.entities.push(new Bumper(owner, mesh));

        }
      })

      this.launcher = tableContainer.getChildren().find(n=>n.id=="launch") as AbstractMesh
      if (!this.launcher){
        throw new Error("launcher not found")
      }

      

//new Pointer("paddle1", owner.scene, Color3.Red(), 1,this.launchPosition(), Vector3.Up())
      
    
      this.owner.startGame()
    })
  }
  
  update(dT: number): void {
    this.leftPaddles.forEach(p=>p.update(dT))
    this.rightPaddles.forEach(p=>p.update(dT))
  }

  activatePaddles(isActive: boolean, side: string): void {
    const paddles = side === "left" ? this.leftPaddles : this.rightPaddles
    paddles.forEach(p=>p.activate(isActive, side))
  }

  dispose(): void {
    this.aggregates.forEach(a=>a.dispose())
    this.loadedRoot?.dispose()
  }

}
 
