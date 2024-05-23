import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { PhysicsBody, PhysicsMotionType, PhysicsShapeCylinder } from "@babylonjs/core/Physics";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CollisionMask, Constants } from "../constants";

export class Bumper implements IEntity{

  rootMesh: AbstractMesh
  readonly body: PhysicsBody;
  public constructor( owner:IGame, mesh:AbstractMesh){
    this.rootMesh = mesh


    const sizes = mesh.getHierarchyBoundingVectors()
    const diameter = sizes.max.x - sizes.min.x
    const shape = new PhysicsShapeCylinder(mesh.position, mesh.position.add(Vector3.Up().scale(2)), diameter / 2, owner.scene)
    shape.material =  {friction:Constants.bumperFriction, restitution: Constants.bumperRestitution};
    shape.filterMembershipMask = CollisionMask.Bumper
    shape.filterCollideMask = CollisionMask.Ball 

    const body = new PhysicsBody(this.rootMesh,PhysicsMotionType.STATIC, false, owner.scene)
    body.shape = shape
    body.setMassProperties({ mass: Constants.ballMass})
    this.body = body

  }



  update(dT: number): void {
   // throw new Error("Method not implemented.");
  }



}