import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { PhysicsBody, PhysicsMotionType, PhysicsShapeCylinder } from "@babylonjs/core/Physics";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CollisionMask, Constants } from "../constants";
import { Pointer } from "../helpers/pointer";

export class Bumper implements IEntity{

  rootMesh: AbstractMesh
  readonly body: PhysicsBody;
  private triggerDelay = 0


  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh

    
    const sizes = mesh.getHierarchyBoundingVectors()

    //new Pointer("paddle1", owner.scene, Color3.Blue(), 10, sizes.max, Vector3.Up())
    //new Pointer("paddle1", owner.scene, Color3.Green(), 10, sizes.min, Vector3.Up())


    const diameter = sizes.max.x - sizes.min.x
    //const shape = new PhysicsShapeCylinder(mesh.position, mesh.position.add(Vector3.Up().scale(-0.1)), diameter / 2, owner.scene)
    const shape = new PhysicsShapeCylinder(new Vector3(0,-0.1,0), new Vector3(0,0.1,0), diameter * 0.5 , owner.scene)
    
    shape.material =  {friction:Constants.bumperFriction, restitution: Constants.bumperRestitution};
    shape.filterMembershipMask = CollisionMask.Bumper
    shape.filterCollideMask = CollisionMask.Ball 

    const body = new PhysicsBody(this.rootMesh,PhysicsMotionType.STATIC, false, owner.scene)
    body.shape = shape
    body.setMassProperties({ mass: Constants.ballMass })
    this.body = body


    body.setCollisionCallbackEnabled(true);
    const observable = body.getCollisionObservable();
    const observer = observable.add((event)=>{
      if (this.triggerDelay <= 0){
      const center = event.collidedAgainst.getObjectCenterWorld()
      const diff = center.subtract(this.body.getObjectCenterWorld())
      diff.z = 0;
      diff.normalize().scaleInPlace(1.5);
      event.collidedAgainst.applyImpulse(diff ,center)
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