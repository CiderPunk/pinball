import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IGame, IPaddle } from "../interfaces";
import { HingeConstraint, Physics6DoFConstraint, PhysicsAggregate, PhysicsBody, PhysicsConstraintAxis, PhysicsConstraintMotorType, PhysicsMotionType, PhysicsShapeMesh } from "@babylonjs/core/Physics";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { Pointer } from "../helpers/pointer";
import { PaddleType } from "../enums";
import { CollisionMask, Constants } from "../constants";

export class Paddle implements IPaddle{


  body: PhysicsBody
  //forcePoint: Vector3
  isActive = false
  motor: Physics6DoFConstraint;

  public constructor(readonly owner:IGame, readonly rootMesh:AbstractMesh, readonly paddleType:PaddleType, floor:PhysicsAggregate){
    const shape = new PhysicsShapeMesh(rootMesh as Mesh, owner.scene)
    const body  = new PhysicsBody(this.rootMesh, PhysicsMotionType.DYNAMIC, false, owner.scene)
    body.startAsleep = false
    body.shape= shape
    shape.filterMembershipMask = CollisionMask.Paddle
    shape.filterCollideMask = CollisionMask.Ball
    this.body = body
    body.setMassProperties({mass:Constants.paddleMass})

    const matrix = floor.transformNode.computeWorldMatrix(true)
    const pivotA = Vector3.TransformCoordinates(rootMesh.getAbsolutePosition(), matrix)
        
    switch(this.paddleType){

      case PaddleType.Left:
        this.motor = new Physics6DoFConstraint(
          {pivotA: pivotA.multiplyByFloats(1,-1,1), pivotB: new Vector3(0,0,0), perpAxisA:Vector3.Up(), perpAxisB:Vector3.Up(), collision:false, maxDistance:0},
          [
            { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0},
            { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:Constants.paddleTravel },
            { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0},
            { axis: PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0 }
          ],
          owner.scene)
        break;

      case PaddleType.Right:
        this.motor = new Physics6DoFConstraint(
          {pivotA: pivotA.multiplyByFloats(1,-1,1), pivotB: new Vector3(0,0,0), perpAxisA:Vector3.Up(), perpAxisB:Vector3.Up(), collision:false, maxDistance:0},
          [
            { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0},
            { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit:-Constants.paddleTravel, maxLimit:0 },
            { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0},
            { axis: PhysicsConstraintAxis.LINEAR_DISTANCE, minLimit:0, maxLimit:0 }
          ],
          owner.scene)
        break;
    }

    floor.body.addConstraint(body, this.motor) 
    this.motor.setAxisMotorType(PhysicsConstraintAxis.ANGULAR_Y, PhysicsConstraintMotorType.VELOCITY);
    this.motor.setAxisMotorMaxForce(PhysicsConstraintAxis.ANGULAR_Y,Constants.PaddleMaxForce);

    //body.setAngularDamping(10)
    //this.forcePoint = this.rootMesh.getAbsolutePosition().addInPlace(new Vector3(paddleType == PaddleType.Left ? -0.06 : 0.06, 0,0))

    this.body.startAsleep = false
  }

  activate(isActive: boolean): void {
    //this.body.setAngularVelocity(Vector3.Backward())
    this.isActive = isActive
    this.body.applyForce(Vector3.ZeroReadOnly, Vector3.ZeroReadOnly)
  }

  update(dT: number): void {
    //this.body.applyForce(new Vector3(0,0,(this.isActive ? -500 : 500)), this.forcePoint)
    this.motor.setAxisMotorTarget(PhysicsConstraintAxis.ANGULAR_Y, (this.paddleType == PaddleType.Right ? -1 : 1) *  (this.isActive ? 1 : -1) * Constants.PaaddleMotorTarget);
  }

}