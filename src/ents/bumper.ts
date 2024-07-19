import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { PhysicsBody, PhysicsMotionType, PhysicsShapeCylinder } from "@babylonjs/core/Physics";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CollisionMask, Constants } from "../constants";
//import { Pointer } from "../helpers/pointer";
//import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";

export class Bumper implements IEntity{

  rootMesh: AbstractMesh
  readonly body: PhysicsBody;
  private triggerDelay = 0

  //forcePointer:Pointer
  //collisionCentrePointer:Pointer


  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh

   // BoundingInfo bounds = mesh.getBoundingInfo();
    const sizes = mesh.getHierarchyBoundingVectors()
    //this.forcePointer = new Pointer("paddle1", owner.scene, Color3.Blue(), 10, sizes.max, Vector3.Up())
    //this.collisionCentrePointer = new Pointer("paddle1", owner.scene, Color3.Red(), 10, sizes.max, Vector3.Up())
    
    
    const diameter = sizes.max.x - sizes.min.x
    //const shape = new PhysicsShapeCylinder(mesh.position, mesh.position.add(Vector3.Up().scale(-0.1)), diameter / 2, owner.scene)
    const shape = new PhysicsShapeCylinder(new Vector3(0,-0.1,0), new Vector3(0,0.1,0), diameter * 0.5 , owner.scene)
    
    shape.material =  {friction:Constants.bumperFriction, restitution: Constants.bumperRestitution};
    shape.filterMembershipMask = CollisionMask.Bumper
    shape.filterCollideMask = CollisionMask.Ball 

    const body = new PhysicsBody(this.rootMesh,PhysicsMotionType.STATIC, false, owner.scene)
    body.shape = shape
    body.setMassProperties({ mass: 0 })
    this.body = body


    //new Pointer("centre", owner.scene, Color3.Green(), 10, this.rootMesh.getAbsolutePosition() , Vector3.Up())
    body.setCollisionCallbackEnabled(true);
    const observable = body.getCollisionObservable();
    const observer = observable.add((event)=>{
      if (this.triggerDelay <= 0){


      const bumperCenter = this.rootMesh.getAbsolutePosition()
      const center = event.collidedAgainst.getObjectCenterWorld()
      const diff = center.subtract(bumperCenter)
      diff.y = 0;
      diff.normalize().scaleInPlace(Constants.bumperStrength);
      event.collidedAgainst.applyImpulse(diff ,center)


      //this.collisionCentrePointer.set(bumperCenter,diff)
      //this.forcePointer.set(center, diff);

      this.triggerDelay = Constants.bumperTriggerDelay
    }

      //new Pointer("paddle1", owner.scene, Color3.Blue(), 10,center, Vector3.Up())
    });
  }



  update(dT: number): void {
    this.triggerDelay -= dT
   // throw new Error("Method not implemented.");
  }



}