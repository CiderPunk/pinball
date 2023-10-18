import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Scene } from "@babylonjs/core/scene";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { IEntity, IGame, ITable } from "./interfaces";
import { Pointer } from "./helpers/pointer";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins"
import "@babylonjs/core/Physics/v2/physicsEngineComponent"
import { Constants } from "./constants";
import { PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core/Physics"

//spector start
import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent
import { InputManager } from "./input/InputManager";
import { Table } from "./table";
import { Ball } from "./ents/ball";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { TargetCamera } from "@babylonjs/core/Cameras/targetCamera";

export class Game implements IGame{
  readonly engine: Engine;
  readonly scene: Scene;
  ground: any;
  sphere: any;
  material: any;
  player?: IEntity;

  readonly ents = new Array<IEntity>()
  inputManager: InputManager;
  table?:ITable;
  readonly balls = new Array<IEntity>;


  ball: any;
  camera: TargetCamera;

  public constructor(element:string){

    // Get the canvas element from the DOM.
    const canvas = document.getElementById(element) as HTMLCanvasElement;

    // Associate a Babylon Engine to it.
    this.engine = new Engine(canvas);

    // Create our first scene.
    this.scene = new Scene(this.engine);

    // This creates and positions a free camera (non-mesh)
    const camera = new TargetCamera("camera1", new Vector3(0, 1.6, 1.8  ), this.scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());
    camera.fov = 0.5


    this.camera = camera
    // This attaches the camera to the canvas
    //camera.attachControl(canvas, true);

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

    //const axes = new AxesViewer(this.scene, 10)

    this.inputManager = new InputManager(this);

    this.inputManager.registerCommands([
      { name:"Shoot", action:"shoot", defaultControls:[" "] },
      { name:"Left Flipper", action:"lflip", defaultControls:["ArrowLeft", "z"] },
      { name:"Right Flipper", action:"rflip", defaultControls:["ArrowRight", "m"] },
    ])


    HavokPhysics().then((havok) => {
      const tableRad = Constants.tableTilt * (Math.PI / 180)
      this.scene.enablePhysics(new Vector3(0,-Math.cos(tableRad) * 0.98, Math.sin(tableRad) * 0.98), new HavokPlugin(true, havok));
     // const groundAggrergate = new PhysicsAggregate(this.ground, PhysicsShapeType.BOX, { mass:0 }, this.scene)
      this.initScene()
    });

    
    // Render every frame
    this.engine.runRenderLoop(() => {
      this.render()
    })


    //this.scene.debugLayer.show();
  }


  initScene(){
    this.table = new Table(this, "table.gltf")
  }


  startGame(){
    this.inputManager.getCommand("Shoot").Subscribe((isActive:boolean)=>{
      if (isActive){
        const ball = new Ball(this, this.table!.launchPosition())
        this.balls.push(ball)
        ball.launch(new Vector3(0,0,8+(Math.random() * 4)))
      }
    })

    this.inputManager.getCommand("Left Flipper").Subscribe((isActive:boolean)=>{
      this.table!.activatePaddles(isActive, "left")
    })
    this.inputManager.getCommand("Right Flipper").Subscribe((isActive:boolean)=>{
      this.table!.activatePaddles(isActive, "right")
    })


  }

  render(){
    

    if (this.balls.length > 0){
      const target = new Vector3(0,0,0)
      this.balls.forEach((b,i)=>{
        target.addInPlace(b.rootMesh.position)
      })
      target.divideInPlace(new Vector3(this.balls.length,this.balls.length,this.balls.length))
   //   this.camera.setTarget(target)
    }

  
    const dT = this.engine.getDeltaTime();
    this.ents.forEach(e=>{ e.update(dT)})
    this.scene.render()

  }
}