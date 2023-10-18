import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { IGame, IPaddle } from "../interfaces";
import { HingeConstraint, Physics6DoFConstraint, PhysicsAggregate, PhysicsBody, PhysicsConstraintAxis, PhysicsMotionType, PhysicsShapeMesh } from "@babylonjs/core/Physics";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { Pointer } from "../helpers/pointer";

export class Paddle implements IPaddle{

  rootMesh: AbstractMesh;
  body: PhysicsBody;
  forcePoint: Vector3;

  public constructor( owner:IGame, mesh:AbstractMesh, side:string, floor:PhysicsAggregate){

    this.rootMesh = mesh
    const shape = new PhysicsShapeMesh(mesh as Mesh, owner.scene)
    const body  = new PhysicsBody(this.rootMesh, PhysicsMotionType.DYNAMIC, false, owner.scene)
    body.startAsleep = false
    body.shape= shape
    this.body = body
    body.setMassProperties({mass:2})


    const matrix = floor.transformNode.computeWorldMatrix(true)
    const pivotA = Vector3.TransformCoordinates(mesh.getAbsolutePosition(), matrix)
    
//const pivotA =  new Vector3(0.055 ,-0.08 ,0.52 )
    // floor.transformNode.getAbsolutePosition().subtractInPlace(mesh.getAbsolutePosition()) 
    const leftConstraint = new Physics6DoFConstraint(
      {pivotA: pivotA.multiplyByFloats(1,-1,1), pivotB: new Vector3(0,0,0) , perpAxisA:Vector3.Up(), perpAxisB:Vector3.Up()},
      [
        { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0},
        { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0},
        { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit:0, maxLimit:Math.PI *0.5 },
        { axis: PhysicsConstraintAxis.LINEAR_X, minLimit:0, maxLimit:0 },
        { axis: PhysicsConstraintAxis.LINEAR_Y, minLimit:0, maxLimit:0 },
        { axis: PhysicsConstraintAxis.LINEAR_Z, minLimit:0, maxLimit:0},
      ],
      owner.scene)

      const rightConstraint = new Physics6DoFConstraint(
        {pivotA: pivotA.multiplyByFloats(1,-1,1), pivotB: new Vector3(0,0,0) , perpAxisA:Vector3.Up(), perpAxisB:Vector3.Up()},
        [
          { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit:0, maxLimit:0},
          { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit:0, maxLimit:0},
          { axis: PhysicsConstraintAxis.ANGULAR_Y, minLimit:Math.PI *-0.5, maxLimit:0 },
          { axis: PhysicsConstraintAxis.LINEAR_X, minLimit:0, maxLimit:0 },
          { axis: PhysicsConstraintAxis.LINEAR_Y, minLimit:0, maxLimit:0 },
          { axis: PhysicsConstraintAxis.LINEAR_Z, minLimit:0, maxLimit:0},
        ],
        owner.scene)


      floor.body.addConstraint(body, side == "left" ? leftConstraint : rightConstraint) 
    body.setAngularDamping(10)



    this.forcePoint = this.rootMesh.getAbsolutePosition().addInPlace(new Vector3(side == "left" ? -0.06 : 0.06, 0,0))
    //new Pointer("paddle", owner.scene, Color3.Random(), 1, this.rootMesh.getAbsolutePosition(), new Vector3(0,0.1,0))
   // new Pointer("paddle", owner.scene, Color3.Random(), 1, this.rootMesh.getAbsolutePosition(), new Vector3(0,0,0.1))

    //new Pointer("paddle1", owner.scene, Color3.Random(), 1, this.forcePoint, new Vector3(0,0,-0.5))
  }

  activate(isActive: boolean, side: string): void {
    //this.body.setAngularVelocity(Vector3.Backward())
    this.body.applyImpulse(new Vector3(0,0,(isActive ? -10 : 10)), this.forcePoint)
  }

  update(dT: number): void {

  }



}