
export const Constants = {
  tableTilt: 7,
  ballSize: 0.0135 ,
  paddleMass: 3,
  ballMass:1,
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

} as const


export enum CollisionMask{
  Wall = 1 << 0,
  Paddle = 1 << 1,
  Ball = 1 << 2,
}