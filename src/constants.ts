
export const Constants = {
  tableTilt: 9,
  ballSize: 0.0135 ,
  paddleMass: 3,
  ballMass:2,
  ballFriction: 0.001,
  ballRestitution: 0.2,
  launchBase: 8,
  launchVariance: 4,
  ballTrack:false,
  paddleTravel:0.3*Math.PI,
  floorRestitution:0.2,
  floorFriction:0.1,
  PaddleMaxForce:10,
  PaaddleMotorTarget:30,
  wallFriction:0.1,
  wallRestitution:0.1,
  bumperFriction:0.1,
  bumperRestitution:0.2,
  bumperTriggerDelay:60,
  bumperImpulse:10,
} as const


export enum CollisionMask{
  Wall = 1 << 0,
  Paddle = 1 << 1,
  Ball = 1 << 2,
  Bumper = 1 << 3,
}