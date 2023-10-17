
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { IGame, ITable } from "./interfaces";
import { Node } from "@babylonjs/core/node";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics/v2";
import { Vector3 } from "@babylonjs/core/Maths/math";


export class Table implements ITable{

  loadedRoot?: Node;
  readonly shadowReceivers = new Array<AbstractMesh>()
  readonly aggregates = new Array<PhysicsAggregate>()
  
  launcher?:AbstractMesh
  shadowGenerator?: ShadowGenerator;


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
        this.aggregates.push(new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0}, scene))
      })

      const furnitureContainer = this.loadedRoot.getChildren().find(n=>n.id=="furniture")
      if (!furnitureContainer){
        throw new Error("no furniture container found")
      }
      furnitureContainer.getChildMeshes().forEach((mesh)=>{
        this.aggregates.push(new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0}, scene))
      })

      
      this.launcher = this.loadedRoot.getChildren().find(n=>n.id=="launch") as AbstractMesh
      if (!this.launcher){
        throw new Error("launcher not found")
      }
      this.owner.startGame()
    })
  }

  dispose(): void {
    this.aggregates.forEach(a=>a.dispose())
    this.loadedRoot?.dispose()
  }

}
 
