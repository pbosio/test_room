import { TransformSystem } from "./modules/transformSystem";

const transfromSystem = new TransformSystem()
engine.addSystem(transfromSystem)

//class to simplify creating a new entity and adding GLTFShape and Transform components.
class StandardGLTFEntity extends Entity {
  readonly shape: GLTFShape
  readonly transform: Transform

  constructor(shape: GLTFShape, position: Vector3 = Vector3.Zero(), rotation: Quaternion = Quaternion.Identity, scale: Vector3 = Vector3.One()){
    super()
    this.shape = shape
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

const bookshelfDefaultPosition = new Vector3(7.76,-0.92,7)

//create entity with gltf model and transform
const bookshelf = new StandardGLTFEntity(new GLTFShape("models/bookshelf.gltf"), bookshelfDefaultPosition, Quaternion.Euler(0,180,0), new Vector3(1,1.3,1))

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
const chandelier = new StandardGLTFEntity(new GLTFShape("models/chandelier.glb"), new Vector3(0,1.05,0), chandelierDefaultRotation)
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
const chestBase = new StandardGLTFEntity(new GLTFShape("models/chestBase.glb"), new Vector3(1,0,7.5))
engine.addEntity(chestBase)

//create chest lid
const chestTop = new StandardGLTFEntity(new GLTFShape("models/chestTop.glb"), new Vector3(0,0.36,0.33), chestTopDefaultRotation)

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
 * DOORS
 * ------------------------
 */

//door gltf shape
const doorShape = new GLTFShape("models/Door.gltf")
//we don't need collisions
doorShape.withCollisions = false

//define door's default rotation
const doorDefaultRotation = Quaternion.Euler(0,0,0)

//door entity
const door = new StandardGLTFEntity(doorShape, new Vector3(13,0,7.9), doorDefaultRotation)

//create door's toggle component
const doorToggle = new Toggle()
doorToggle.onValueChanged(value=>{
  if (value){
    transfromSystem.rotate(door.transform, door.transform.rotation, doorDefaultRotation.multiply(Quaternion.Euler(0,-110,0)), 0.8)
  }
  else{
    transfromSystem.rotate(door.transform, door.transform.rotation, doorDefaultRotation, 0.8)
  }
})
//add toggle component to entity
door.addComponent(doorToggle)

//listen to click on door
door.addComponent(new OnClick(event =>{
  doorToggle.toggle()
}))

//add entity to the engine
engine.addEntity(door)


//this won't work until issue with animations always looping is fixed
/*const door1 = new StandardGLTFEntity(doorShape, new Vector3(11,0,8), Quaternion.Euler(0,-90,0))
const door1Animator = new Animator()
door1.addComponent(door1Animator)
const door1ClipOpen = new AnimationClip("Open")
const door1ClipClose = new AnimationClip("Close")
door1Animator.addClip(door1ClipOpen)
door1Animator.addClip(door1ClipClose)
const door1Toggle = new Toggle(false);
door1Toggle.onValueChanged(value=>{
  if (value){
    door1ClipOpen.play()
  }
  else{
    door1ClipClose.play()
  }
})
door1.addComponent(door1Toggle)
door1.addComponent(new OnClick(event=>{
  door1Toggle.toggle()
}))
engine.addEntity(door1);
*/

/**
 * ------------------------
 * COUCH
 * ------------------------
 */

//define couch default position
const couchDefaultPosition = new Vector3(7, 0, 3)
//create couch entity
const couch = new StandardGLTFEntity(new GLTFShape("models/couch.glb"), couchDefaultPosition)

//create toggle component for couch
const couchToggle = new Toggle();
couchToggle.onValueChanged(value=>{
  if (value){
    transfromSystem.move(couch.transform, couch.transform.position, couchDefaultPosition.add(new Vector3(0,0,-1)), 0.3)
  }
  else{
    transfromSystem.move(couch.transform, couch.transform.position, couchDefaultPosition, 0.3)
  }
})
//add toggle component to couch
couch.addComponent(couchToggle)

//listen to click event
couch.addComponent(new OnClick(event=>{
  couchToggle.toggle()
}))

//add couch entity to the engine
engine.addEntity(couch)

/**
 * ------------------------
 * FAKE WALL
 * ------------------------
 */

//create fake wall that will open at the end of the level
const fakeWall = new Entity()

//create shape for the fake wall
const fakeWallShape = new BoxShape()
//enable collision
fakeWallShape.withCollisions = true
//add shape component to entity
fakeWall.addComponent(fakeWallShape)

//set transform for the fake wall
fakeWall.addComponent(new Transform({
  position: new Vector3(15.9,2,7),
  rotation: Quaternion.Euler(0,90,0),
  scale: new Vector3(2,4,0.2)
}))

//create toggle component
const fakeWallToggle = new Toggle(false)
fakeWallToggle.onValueChanged(value=>{
  if (value){
    let fakeWallTransform = fakeWall.getComponent(Transform)
    transfromSystem.move(fakeWallTransform, fakeWallTransform.position, fakeWallTransform.position.add(new Vector3(0,3,0)), 3)
  }
})

//add fake wall to the engine
engine.addEntity(fakeWall)

/**
 * ------------------------
 * COINS
 * ------------------------
 */

//declare the variable for the amount of coins user pick up
let amountOfCoinPickedUp: number = 0

//create array to contain coins
const coins: StandardGLTFEntity[] = []
//coin gltf shape
const coinShape = new GLTFShape("models/coin.glb")

//create coins entities
coins.push(new StandardGLTFEntity(coinShape, new Vector3(7,0,4.17)))
coins.push(new StandardGLTFEntity(coinShape, new Vector3(0,0.4,0)))
//set coin as a child of the chest cause this coin is inside of it
coins[coins.length-1].setParent(chestBase)
coins.push(new StandardGLTFEntity(coinShape, new Vector3(12,0.05,7.89), Quaternion.Euler(-90,0,0)))

//iterate through coin array
coins.forEach(coin => {
  //listen for click on this coin
  coin.addComponent(new OnClick(event=>{
    amountOfCoinPickedUp++
    signTextShape.value = amountOfCoinPickedUp + "/" + coins.length
    if (amountOfCoinPickedUp >= coins.length){
      fakeWallToggle.set(true)
    }
    engine.removeEntity(coin)
  }))
  //add coin to the engine
  engine.addEntity(coin)  
});

/**
 * ------------------------
 * COINS SIGN
 * ------------------------
 */

//coin sign that will appear over the fake wall
const sign = new Entity()
//create the shape of the sign
const signShape = new PlaneShape()
//create material for the sign
let signMaterial = new Material()
//add texture to material
signMaterial.albedoTexture = new Texture("images/coin.png")
//set it transoarency
signMaterial.transparencyMode = 3

//add shape component to the sign
sign.addComponent(signShape)
//add material to the sign
sign.addComponent(signMaterial)
//set sign position through transform component
sign.addComponent(new Transform({position: new Vector3(0,0,-0.51), scale: new Vector3(0.3,0.2,1)}))
//set fake wall as parent of the sign
sign.setParent(fakeWall)

//add entity to the engine
engine.addEntity(sign)


//create text for the sign
const signText = new Entity()
//create text shape comnponent
const signTextShape = new TextShape("0/"+coins.length)
//add shape component to the entity
signText.addComponent(signTextShape)
//set transform component
signText.addComponent(new Transform({position: new Vector3(0,-0.2,-0.51)}))
//set text as child of the fake wall
signText.setParent(fakeWall)

//add entity to the engine
engine.addEntity(signText)

/**
 * ------------------------
 * ROOM WALLS
 * ------------------------
 */
//room 1 far wall
CreateWall(new Vector3(8,2,8), Quaternion.Euler(0,0,0), new Vector3(16,4,0.2))

//room 1 right wall 1
CreateWall(new Vector3(8,2,3.35), Quaternion.Euler(0,90,0), new Vector3(6.7,4,0.2))

//room 1 right wall 2
CreateWall(new Vector3(8,2,7.95), Quaternion.Euler(0,90,0), new Vector3(0.3,4,0.2))

//room 1 right wall 3
CreateWall(new Vector3(8,3,7.2), Quaternion.Euler(0,90,0), new Vector3(1.2,2,0.2))

//big wall near
CreateWall(new Vector3(12,2,0.1), Quaternion.Euler(0,0,0), new Vector3(8,4,0.2))

//big wall far
CreateWall(new Vector3(8,2,15.9), Quaternion.Euler(0,0,0), new Vector3(16,4,0.2))

//big wall left
CreateWall(new Vector3(0.1,2,12), Quaternion.Euler(0,90,0), new Vector3(8,4,0.2))

//big wall right 1
CreateWall(new Vector3(15.9,2,3), Quaternion.Euler(0,90,0), new Vector3(6,4,0.2))

//big wall right 2
CreateWall(new Vector3(15.9,2,12), Quaternion.Euler(0,90,0), new Vector3(8,4,0.2))

function CreateWall(position: Vector3, rotation: Quaternion, scale: Vector3){
  const wall = new Entity()
  const wallShape = new BoxShape()
  wallShape.withCollisions = true
  wall.addComponent(wallShape)
  wall.addComponent(new Transform({
    position: position,
    rotation: rotation,
    scale: scale
  }))
  engine.addEntity(wall)
}