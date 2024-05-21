
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { IGame, IPaddle, ITable } from "./interfaces";
import { Node } from "@babylonjs/core/node";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics/v2";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Plunger } from "./ents/plunger";
import { Paddle } from "./ents/paddle";
import { CollisionMask } from "./constants";
import { PaddleType } from "./enums";


export class Table implements ITable{

  loadedRoot?: Node;
  readonly shadowReceivers = new Array<AbstractMesh>()
  readonly aggregates = new Array<PhysicsAggregate>()
  launcher?:AbstractMesh
  shadowGenerator?: ShadowGenerator;
  plunger?:Plunger

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

      const outerContainer = this.loadedRoot.getChildren().find(n=>n.id=="outer")
      if (!outerContainer){
        throw new Error("no table container found")
      }
      outerContainer.getChildMeshes().forEach((mesh)=>{
        const agg = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0}, scene)
        agg.shape.filterCollideMask = CollisionMask.Ball
        agg.shape.filterMembershipMask = CollisionMask.Wall
        if (mesh.name == "floor"){
          this.floorBody = agg  
        }
        if (mesh.name == "glass"){
          mesh.setEnabled(false)

        }
        this.aggregates.push(agg)
      })

      const furnitureContainer = this.loadedRoot.getChildren().find(n=>n.id=="furniture")
      if (!furnitureContainer){
        throw new Error("no furniture container found")
      }
      furnitureContainer.getChildMeshes().forEach((mesh)=>{
        const agg = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0}, scene)
        agg.shape.filterCollideMask = CollisionMask.Ball
        agg.shape.filterMembershipMask = CollisionMask.Wall
        this.aggregates.push(agg)
      })

      const plungerMesh = this.loadedRoot.getChildren(undefined, false).find(n=>n.id=="plunger") as AbstractMesh
      this.plunger = new Plunger(owner, plungerMesh)

      const paddleContainer = this.loadedRoot.getChildren().find(n=>n.id=="interactive")
      if (!paddleContainer){
        throw new Error("no paddle container found")
      }
      paddleContainer.getChildMeshes().forEach((mesh)=>{
        if (mesh.name.includes("paddle")){
          if (mesh.name.includes("left")){
            this.leftPaddles.push(new Paddle(owner, mesh, PaddleType.Left, this.floorBody!))
          }
          else if (mesh.name.includes("right")){
            this.rightPaddles.push(new Paddle(owner, mesh, PaddleType.Right, this.floorBody!)) 
          }
        
        }
      })

      this.launcher = this.loadedRoot.getChildren().find(n=>n.id=="launch") as AbstractMesh
      if (!this.launcher){
        throw new Error("launcher not found")
      }
      
    
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
 
