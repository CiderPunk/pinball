
//import "@babylonjs/core/Gamepads/gamepadSceneComponent";
import { GamepadManager, Xbox360Pad,Xbox360Button, DualShockPad, DualShockButton, GenericPad  } from "@babylonjs/core/Gamepads";
import { CommandAction, IAxisBase, ICommandAxisSpec, ICommandSepc, IGame,  IInputBase, IInputCommand, IInputManager } from "../interfaces";


abstract class InputBase implements IInputBase{
  constructor(readonly spec:IInputBase){
  }

  get name():string{
    return this.spec.name
  }

  get action():string{
    return this.spec.action
  }
} 

/**
 * InputAxis 
 * 
 */
class HardwareAxis  implements IAxisBase{
  update(v: number) {
    this.value = v
  }
  readonly action:string
  
  constructor(readonly name:string,readonly single:boolean ){
    this.action = name
  }

  value: number = 0;


}

class InputCommandAxis extends InputBase implements IAxisBase{
  constructor(readonly spec:ICommandAxisSpec){
    super(spec)
  }
  get value():number{
    return 0
  }
  get single():boolean{
    return this.spec.single
  }

}

class InputCommand implements IInputCommand{

  constructor(readonly spec:ICommandSepc){
  }

  get name():string{
    return this.spec.name
  }

  get action():string{
    return this.spec.action
  }


  private actions = new Array<CommandAction>();
  private active:boolean = false
  //default key code of command
  getDefaultControls():Readonly<Array<string>>{
    return this.spec.defaultControls
  }

  //is active
  get isActive():boolean{
    return this.active
  }

  public Subscribe(act:CommandAction){
    if (this.actions.indexOf(act) == -1){
      this.actions.push(act)
    }
  }

  public Unsubscribe(act:CommandAction){
    let index = this.actions.indexOf(act)
    if (index > -1){
      this.actions.splice(index, 1)
    }
  }

  public Start(){
    if (!this.active){
      this.actions.forEach((act)=>act(true, this.action))
      this.active = true
    }
  }

  public Stop(){
    this.active = false
    this.actions.forEach((act)=>act(false, this.action))
  }
}


export class InputManager implements IInputManager {

  readonly axisMap = new Map<string, IAxisBase>()
  readonly commandMap = new Map<string,InputCommand>()
  readonly keyMap = new Map<string, InputCommand[]>()
  downKeys = new Set<string>()

  public constructor(readonly owner: IGame) {
    //joypad
    const gpm = new GamepadManager();
    gpm.onGamepadConnectedObservable.add((gamepad, state) => {
      const id = gamepad.index;
       
      console.log(`gamepad connected ${id}`)

      const [leftVert, leftHoriz, rightVert,rightHoriz] = this.registerHardwareAxis([
        new HardwareAxis(`${id}_left_vert`, false),
        new HardwareAxis(`${id}_left_horiz`, false), 
        new HardwareAxis(`${id}_right_vert`, false), 
        new HardwareAxis(`${id}_right_horiz`, false)])

      //Stick events
      gamepad.onleftstickchanged((values)=>{
        leftHoriz.update(values.x)
        leftVert.update(values.y)
      })
      
      gamepad.onrightstickchanged((values)=>{
        rightHoriz.update(values.x)
        rightVert.update(values.y)
      })

      //Handle gamepad types
      if (gamepad instanceof Xbox360Pad || gamepad instanceof DualShockPad ) {
        const [leftTrigger, rightTrigger] =  this.registerHardwareAxis([
          new HardwareAxis(`${id}_trigger_left`, true),
          new HardwareAxis(`${id}_trigger_right`, true)])

        gamepad.onlefttriggerchanged((value:number)=>{ leftTrigger.update(value) });
        gamepad.onrighttriggerchanged((value:number)=>{ rightTrigger.update(value) });
      }

      //Handle gamepad types
      if (gamepad instanceof Xbox360Pad ) {
        //Xbox button down/up events
        gamepad.onButtonDownObservable.add((button, state)=>{
          this.keyDown(`${id}_XB_${Xbox360Button[button]}`)
        })
        gamepad.onButtonUpObservable.add((button, state)=>{
          this.keyUp(`${id}_XB_${Xbox360Button[button]}`)
        })
      } 
      else if (gamepad instanceof DualShockPad) {
        //Dual shock button down/up events
        gamepad.onButtonDownObservable.add((button, state)=>{
          this.keyDown(`${id}_DS_${Xbox360Button[button]}`)
        })
        gamepad.onButtonUpObservable.add((button, state)=>{
          this.keyUp(`${id}_DS_${Xbox360Button[button]}`)
        })
      }
      else if (gamepad instanceof GenericPad) {
        gamepad.onButtonDownObservable.add((button, state)=>{
          this.keyDown(`${id}_GP_${Xbox360Button[button]}`)
        })
        gamepad.onButtonUpObservable.add((button, state)=>{
          this.keyUp(`${id}_GP_${Xbox360Button[button]}`)
        })
      } 
    })

    gpm.onGamepadDisconnectedObservable.add((gp, state)=>{
      console.log(`gamepad disconnected ${gp.id}`)
    })

    if (document){
      document.addEventListener("keydown", (e:KeyboardEvent) =>{  
        if (!e.repeat) { 
          if (this.keyDown(e.key)){
            //e.preventDefault()
            e.stopImmediatePropagation()
          }
        }

      })
      document.addEventListener("keyup", (e:KeyboardEvent) =>{ 
        this.keyUp(e.key)
      })
    }
  }


  registerHardwareAxis(axis:Array<HardwareAxis>):Array<HardwareAxis>{
    axis.forEach(a=>{this.axisMap.set(a.name, a)})
    return axis
  }

  bind(key:string, commandName:string):void{
    let command = this.commandMap.get(commandName) as InputCommand
    if (command){
      if (!this.keyMap.has(key)){
        this.keyMap.set(key, [])
      }
      this.keyMap.get(key)?.push(command)
      this.saveKey(command.name, key)
    }
  }

  getSavedKeys(name:string):string[]{
    return localStorage.getItem(`input.${name}`)?.split(',') ?? []
  }

  saveKey(name: string, key: string) {
    const keys = this.getSavedKeys(name) ?? new Array<string>()
    if (keys.findIndex(k=>key == k) === -1){
      keys.push(key)
      localStorage.setItem(`input.${name}`, keys.join(","))
    }
  }

  removeKey(name: string, key: string) {
    let keys = this.getSavedKeys(name)
    if (keys){
      keys = keys.filter((v=>v!=key))
      localStorage.setItem(`input.${name}`, keys.join(","))
    }
  }

  getCommand = (name:string) => this.commandMap.get(name) as IInputCommand
  
  registerCommands(commandSpecs: ICommandSepc[]):IInputCommand[]{
    return commandSpecs.map(c=>this.registerCommand(c));
  }

  registerCommand(spec: ICommandSepc):IInputCommand{
    if (!this.commandMap.has(spec.name)){
      const command = new InputCommand(spec)
      this.commandMap.set(command.name, command)
      this.getSavedKeys(command.name)
      command.getDefaultControls().forEach(code=>{ this.bind(code, command.name)})
      return command
    }
    else{
      throw new Error("Duplicate command registered: " + spec.name)
    }
  }

  keyDown(code: string):boolean {
    if (this.downKeys.has(code)){
      return false
    }
    this.downKeys.add(code)  
    this.keyMap.get(code)?.forEach(c=>c.Start())
    return true
  }  
  
  keyUp(code: string):void {
    if (!this.downKeys.has(code)){
      return
    }
    this.downKeys.delete(code)
    this.keyMap.get(code)?.forEach(c=>c.Stop())
    console.log(`keyup ${code}`)
  }

}
