
export const Constants = {
  tableTilt: 8.5,
  ballSize: 0.015,
  paddleMass: 3,
  ballMass: 1,
  ballFriction: 0.2,
  ballRestitution: 0.2,
  launchBase: 8,
  launchVariance: 4,
  ballTrack:false,
  paddleTravel:0.3*Math.PI

} as const


export enum CollisionMask{
  Wall = 1 << 0,
  Paddle = 1 << 1,
  Ball = 1 << 2,
}