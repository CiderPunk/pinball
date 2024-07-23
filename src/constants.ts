
export const Constants = {
  tableTilt: 9,
  ballSize: 0.0135 ,
  paddleMass: 3,
  ballMass:3,
  ballFriction: 0.0001,
  ballRestitution: 0.2,
  launchBase: 12,
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
  bumperStrength:1.2,
  KickerInfluence:0.4,
  KickerStrength:1.1,
  KickerTriggerDelay:60,


} as const


export enum CollisionMask{
  Wall = 1 << 0,
  Paddle = 1 << 1,
  Ball = 1 << 2,
  Bumper = 1 << 3,
  Kicker = 1 << 4,
  Trigger = 1 << 5,
  BallMask = Ball | Wall | Paddle | Bumper | Kicker | Trigger,
}