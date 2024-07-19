import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame, ITrigger } from "../interfaces";
import { PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeMesh } from "@babylonjs/core/Physics";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CollisionMask, Constants } from "../constants";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Pointer } from "../helpers/pointer";

export class Kicker implements IEntity, ITrigger{

  rootMesh: AbstractMesh
  private triggerDelay = 0
  private kickDirection:Vector3;
  //forcePointer:Pointer
  private inRange = new Set<PhysicsBody>()

  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh
    this.rootMesh.setEnabled(false);
    //mesh.rotation
    this.kickDirection = mesh.getDirection(Vector3.Right());

    //const shape = new PhysicsShapeBox(Vector3.Zero(), mesh.rotation.toQuaternion(), bounds.boundingBox.extendSize, owner.scene)
    const triggerShape = new PhysicsShapeMesh(mesh as Mesh, owner.scene)   
    triggerShape.material =  {friction:Constants.bumperFriction, restitution: Constants.bumperRestitution};
    triggerShape.filterMembershipMask = CollisionMask.Trigger
    triggerShape.filterCollideMask = CollisionMask.Ball 
    triggerShape.isTrigger = true
    const triggerBody = new PhysicsBody(this.rootMesh,PhysicsMotionType.STATIC, false, owner.scene)
    triggerBody.shape = triggerShape
    this.rootMesh.metadata.owner = this;

    //this.forcePointer = new Pointer("paddle1", owner.scene, Color3.Blue(), 10, triggerBody.getObjectCenterWorld(), Vector3.Up())

/*
    const hammer = this.rootMesh.getChildren(node=>node.name.includes("hammer"))[1]
    if (!hammer){
      throw new Error(`Kicker ${mesh.name} missing hammer mesh`)   
    } 
    const hammerShape = new PhysicsShapeMesh(hammer as Mesh, owner.scene)   
    hammerShape.filterMembershipMask = CollisionMask.Kicker
    hammerShape.filterCollideMask = CollisionMask.Ball 
    const hammerBody = new PhysicsBody(this.rootMesh,PhysicsMotionType.DYNAMIC, false, owner.scene)
    hammerBody.shape = hammerShape
*/


  }
  onTriggerExit(collider: PhysicsBody): void {

    this.inRange.delete(collider)
  }
  onTriggerEnter(collider: PhysicsBody): void {
    this.inRange.add(collider)
  }

  update(dT: number): void {
    this.triggerDelay -= dT
    if (this.triggerDelay < 0 && this.inRange.size > 0){
      this.triggerDelay = Constants.KickerTriggerDelay
      this.inRange.forEach(pb=>{
        const otherPos = pb.getObjectCenterWorld()
        //calc distance
        const difference  = this.rootMesh.position.subtract(otherPos)
        const distance = difference.length()
        console.log(`dist: ${distance} power: ${ Constants.KickerInfluence / distance }`)
        const impulse= this.kickDirection.scale( ( Constants.KickerInfluence / distance ) *  Constants.KickerStrength)
        //this.forcePointer.set(otherPos, impulse )
        pb.applyImpulse(impulse, otherPos)
      })
    }
  }
}

