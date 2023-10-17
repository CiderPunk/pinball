import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IEntity, IGame } from "../interfaces";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateIcoSphere } from "@babylonjs/core/Meshes/Builders/icoSphereBuilder"
import { PhysicsBody, PhysicsMotionType, PhysicsShapeSphere } from "@babylonjs/core/Physics";


export class Ball implements IEntity{

  readonly rootMesh: AbstractMesh;


  public constructor(readonly owner:IGame, position:Vector3){
    this.rootMesh = CreateIcoSphere("ball", { radius:0.015}, owner.scene)
    this.rootMesh.position.set(-position.x, position.y, position.z)

    const shape = new PhysicsShapeSphere(Vector3.Zero(), 0.015, owner.scene)
    shape.material =  {friction: 0.1, restitution: 0.3};
    const body = new PhysicsBody(this.rootMesh,PhysicsMotionType.DYNAMIC, false, owner.scene)
    body.shape = shape
    body.setMassProperties({ mass: 1})

  }




  update(dT: number): void {

  }


}
