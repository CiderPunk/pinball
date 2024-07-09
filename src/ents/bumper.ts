import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { PhysicsBody, PhysicsMotionType, PhysicsShapeCylinder } from "@babylonjs/core/Physics";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CollisionMask, Constants } from "../constants";
import { Pointer } from "../helpers/pointer";

export class Bumper implements IEntity{

  rootMesh: AbstractMesh
  readonly body: PhysicsBody;
  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh


    const sizes = mesh.getHierarchyBoundingVectors()
    const diameter = sizes.max.x - sizes.min.x
    //const shape = new PhysicsShapeCylinder(mesh.position, mesh.position.add(Vector3.Up().scale(-0.1)), diameter / 2, owner.scene)
    const shape = new PhysicsShapeCylinder(new Vector3(0,-0.05,0), new Vector3(0,0,0), diameter  / 2, owner.scene)
    
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
      const center = event.collidedAgainst.getObjectCenterWorld()
      const diff = center.subtract(this.body.getObjectCenterWorld())
      diff.normalize();
      event.collidedAgainst.applyImpulse(diff.scale(2),center)
      new Pointer("paddle1", owner.scene, Color3.Blue(), 10,center, Vector3.Up())
    });
  }



  update(dT: number): void {
   // throw new Error("Method not implemented.");
  }



}