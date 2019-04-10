import { TransformSystem } from "./modules/transformSystem";

const transfromSystem = new TransformSystem()
engine.addSystem(transfromSystem)

//class to simplify creating a new entity and adding GLTFShape and Transform components.
class StandardGLTFEntity extends Entity {
  readonly shape: GLTFShape
  readonly transform: Transform

  constructor(modelPath: string, position: Vector3 = Vector3.Zero(), rotation: Quaternion = Quaternion.Identity, scale: Vector3 = Vector3.One()){
    super()
    this.shape = new GLTFShape(modelPath)
    this.transform = new Transform({position: position, rotation: rotation, scale: scale})

    this.addComponent(this.shape)
    this.addComponent(this.transform)
  }
}

//Toggle component to manage only two states
@Component("toggle")
class Toggle {
  public enable: boolean = true

  private onValueChangedCallback : (value: boolean) => void
  private on: boolean = false

  constructor(startingValue: boolean = true){
    this.on = startingValue
  }

  public onValueChanged(onValueChangedCallback : (value: boolean) => void){
    this.onValueChangedCallback = onValueChangedCallback
  }

  public isOn(): boolean{
    return this.on
  }

  public toggle(){
    this.set(!this.on)
  }

  public set(value: boolean){
    this.on = value
    if (this.onValueChangedCallback)this.onValueChangedCallback(this.on)
  }
}

/**
 * ------------------------
 * BOOKSHELF
 * ------------------------
 */

const bookshelfDefaultPosition = new Vector3(7.86,-0.92,7)

//create entity with gltf model and transform
const bookshelf = new StandardGLTFEntity("models/bookshelf.gltf", bookshelfDefaultPosition, Quaternion.Euler(0,180,0), new Vector3(1,1.3,1))

//create toggle component for the entity
const bookshelfToggle = new Toggle()

//listen to changes on toggle state
bookshelfToggle.onValueChanged(value=>{
  if (!value){
    //move bookshelg using transformSystem module
    transfromSystem.move(bookshelf.transform, bookshelf.transform.position, bookshelfDefaultPosition.add(new Vector3(0,0,-1)), 1)
  }
  else{
    //move bookshelg using transformSystem module
    transfromSystem.move(bookshelf.transform, bookshelf.transform.position, bookshelfDefaultPosition, 1)
  }
})

//add toggle component to entity
bookshelf.addComponent(bookshelfToggle);

//add entity to engine
engine.addEntity(bookshelf)

/**
 * ------------------------
 * CHANDELIER
 * ------------------------
 */

const chandelierDefaultRotation = Quaternion.Euler(0,90,0)

//create entity with gltf model and transform
const chandelier = new StandardGLTFEntity("models/chandelier.glb", new Vector3(0,1.05,0), chandelierDefaultRotation)
//set chandelier as child of bookshelf
chandelier.setParent(bookshelf)

//create toggle component for the entity
const chandelierToggle = new Toggle()

//listen to changes on toggle state
chandelierToggle.onValueChanged(value=>{
  chandelierToggle.enable = false
  if (!value){
    //rotate chandelier using transformSystem module and toggle bookshelf state when rotation finish
    transfromSystem.rotate(chandelier.transform, chandelier.transform.rotation, chandelierDefaultRotation.multiply(Quaternion.Euler(0,0,35)), 0.5, ()=>{
      chandelierToggle.enable = true;
      bookshelfToggle.toggle()
    })
  }
  else{
    //rotate chandelier and toggle bookshelf state when rotation finish
    transfromSystem.rotate(chandelier.transform, chandelier.transform.rotation, chandelierDefaultRotation, 0.5, ()=>{
      chandelierToggle.enable = true;
      bookshelfToggle.toggle()
    })   
  }
})
//add toggle component to entity
chandelier.addComponent(chandelierToggle)

//listen to onclik event to change entity's toggle state
chandelier.addComponent(new OnClick(event =>{
  if (chandelierToggle.enable){
    chandelierToggle.toggle();
  }
}))

//add entity to engine
engine.addEntity(chandelier)


/**
 * ------------------------
 * TREASURE CHEST
 * ------------------------
 */

const chestTopDefaultRotation = Quaternion.Euler(0,180,0)

//create chest entity
const chestBase = new StandardGLTFEntity("models/chestBase.glb", new Vector3(1,0,7.5))
engine.addEntity(chestBase)

//create chest lid
const chestTop = new StandardGLTFEntity("models/chestTop.glb", new Vector3(0,0.36,0.33), chestTopDefaultRotation)

//set chest as parent
chestTop.setParent(chestBase)

//create toggle compnent
const chestTopToggle = new Toggle();

//listen toggle state to open or close chest lid
chestTopToggle.onValueChanged(value=>{
  chestTopToggle.enable = false
  if (value){
    transfromSystem.rotate(chestTop.transform, chestTop.transform.rotation, chestTopDefaultRotation, 0.2, ()=>{chestTopToggle.enable = true})
  }
  else{
    transfromSystem.rotate(chestTop.transform, chestTop.transform.rotation, chestTopDefaultRotation.multiply(Quaternion.Euler(-45,0,0)), 0.2, ()=>{chestTopToggle.enable = true})
  }
})

//add toggle component
chestTop.addComponent(chestTopToggle)

//create onclick component
chestTop.addComponent(new OnClick(event=>{
  if (chestTopToggle.enable){
    chestTopToggle.toggle()
  }
}))

//add entity to engine
engine.addEntity(chestBase)


/**
 * ------------------------
 * ROOM WALLS
 * ------------------------
 */
//room 1 far wall
CreateWall(new Vector3(4,2,8), Quaternion.Euler(0,0,0), new Vector3(8,4,1))

//room 1 right wall 1
CreateWall(new Vector3(8,2,3.35), Quaternion.Euler(0,90,0), new Vector3(6.7,4,1))

//room 1 right wall 2
CreateWall(new Vector3(8,2,7.9), Quaternion.Euler(0,90,0), new Vector3(0.2,4,1))

//room 1 right wall 3
CreateWall(new Vector3(8,3,7.2), Quaternion.Euler(0,90,0), new Vector3(1.2,2,1))

//big wall near
CreateWall(new Vector3(12,2,0), Quaternion.Euler(0,0,0), new Vector3(8,4,1))

//big wall far
CreateWall(new Vector3(8,2,16), Quaternion.Euler(0,0,0), new Vector3(16,4,1))

//big wall left
CreateWall(new Vector3(0,2,12), Quaternion.Euler(0,90,0), new Vector3(8,4,1))

//big wall right
CreateWall(new Vector3(16,2,8), Quaternion.Euler(0,90,0), new Vector3(16,4,1))


function CreateWall(position: Vector3, rotation: Quaternion, scale: Vector3){
  const wall = new Entity()
  const wallShape = new PlaneShape()
  wallShape.withCollisions = true
  wall.addComponent(wallShape)
  wall.addComponent(new Transform({
    position: position,
    rotation: rotation,
    scale: scale
  }))
  engine.addEntity(wall)
}

/*const d = new Entity()
const sh = new GLTFShape("models/door1.glb")
const t = new Transform({position: Vector3.One()})
const an = new Animator()
const cl = new AnimationClip("open")
d.addComponent(sh)
d.addComponent(t)
d.addComponent(an)
cl.looping = true
cl.play()
an.addClip(cl)

engine.addEntity(d)*/