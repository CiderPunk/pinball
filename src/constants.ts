
export const Constants = {
  tableTilt: 7,
  ballSize: 0.0135 ,
  paddleMass: 3,
  ballMass:1,
  ballFriction: 0.3  ,
  ballRestitution: 0.6,
  launchBase: 6,
  launchVariance: 4,
  ballTrack:false,
  paddleTravel:0.3*Math.PI,
  PaddleMaxForce:10,
  PaaddleMotorTarget:30,

} as const


export enum CollisionMask{
  Wall = 1 << 0,
  Paddle = 1 << 1,
  Ball = 1 << 2,
}