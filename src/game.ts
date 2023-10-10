import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Scene } from "@babylonjs/core/scene";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { IEntity, IGame } from "./interfaces";
import { Pointer } from "./helpers/pointer";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins"
import "@babylonjs/core/Physics/v2/physicsEngineComponent"

import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics"

//spector start
import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent
import { InputManager } from "./input/InputManager";

export class Game implements IGame{
  readonly engine: Engine;
  readonly scene: Scene;
  ground: any;
  sphere: any;
  material: any;
  camera: FreeCamera;
  player?: IEntity;

  readonly ents = new Array<IEntity>()
  inputManager: InputManager;
  public constructor(element:string){

    // Get the canvas element from the DOM.
    const canvas = document.getElementById(element) as HTMLCanvasElement;

    // Associate a Babylon Engine to it.
    this.engine = new Engine(canvas);

    // Create our first scene.
    this.scene = new Scene(this.engine);

    // This creates and positions a free camera (non-mesh)
    this.camera = new FreeCamera("camera1", new Vector3(0, 20, -30), this.scene);

    // This targets the camera to scene origin
    this.camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    this.camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Create a grid material
    this.material = new GridMaterial("grid", this.scene);
    this.material.gridRatio = 0.1
    
    // Our built-in 'ground' shape.
    this.ground = CreateGround('ground1', { width: 100, height: 100, subdivisions: 10 }, this.scene);
    this.ground.material = this.material;

    const axes = new AxesViewer(this.scene, 10)

    this.inputManager = new InputManager(this);

    HavokPhysics().then((havok) => {
      this.scene.enablePhysics(new Vector3(0,-9.81, 0), new HavokPlugin(true, havok));
      const groundAggrergate = new PhysicsAggregate(this.ground, PhysicsShapeType.BOX, { mass:0}, this.scene)
    });

    
    // Render every frame
    this.engine.runRenderLoop(() => {
      this.render()
    })


    new Pointer("X", this.scene, Color3.Red(), 1 ,new Vector3(0,0,0), new Vector3(5,0,0))
    new Pointer("Y", this.scene, Color3.Green(), 1 ,new Vector3(5,0,0), new Vector3(0,5,0))
    new Pointer("Z", this.scene, Color3.Blue(), 1 ,new Vector3(5,5,0), new Vector3(0,0,5))
    new Pointer("xyz", this.scene, Color3.Purple(), 1 ,new Vector3(0,0,0), new Vector3(5,5,5))
    this.scene.debugLayer.show();


  }

  render(){

    if (this.player){
    //  this.camera.setTarget(this.player.rootMesh.position)
    }
    
    const dT = this.engine.getDeltaTime();
    this.ents.forEach(e=>{ e.update(dT)})
    this.scene.render()

  }
}