import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateIcoSphere } from "@babylonjs/core/Meshes/Builders/icoSphereBuilder"
import { PhysicsBody, PhysicsMotionType, PhysicsShapeSphere } from "@babylonjs/core/Physics";
import { CollisionMask, Constants } from "../constants";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";


export class Ball implements IEntity{

  readonly rootMesh: AbstractMesh;
  readonly body: PhysicsBody;


  public constructor(readonly owner:IGame, position:Vector3){
    this.rootMesh = CreateIcoSphere("ball", { radius:Constants.ballSize}, owner.scene)
    this.rootMesh.position.set(-position.x, position.y, position.z)

    const shape = new PhysicsShapeSphere(Vector3.Zero(), Constants.ballSize, owner.scene)
    shape.material =  {friction:Constants.ballFriction, restitution: Constants.ballRestitution};
    shape.filterMembershipMask = CollisionMask.Ball
    shape.filterCollideMask = CollisionMask.BallMask

    const body = new PhysicsBody(this.rootMesh,PhysicsMotionType.DYNAMIC, false, owner.scene)
    body.shape = shape
    body.setMassProperties({ mass: Constants.ballMass})

    const mat = new StandardMaterial("ballmat", owner.scene)
  
    //mat.wireframe = true
    this.rootMesh.material = mat


    this.body = body;
  }

  launch(impulse:Vector3 ){
    this.body.applyImpulse(impulse, this.rootMesh.getAbsolutePosition())
    
  }

  update(dT: number): void {

  }


}
