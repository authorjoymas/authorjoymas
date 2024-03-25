import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

import * as THREE from 'three'; 
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const canvasEl = document.querySelector('#canvas');

// Parameters ///////////////////////////////////////////////////////////////////////////////////////////////
let debug = false;
let renderer, scene, camera, physicsWorld, cannonDebugger;
let throwStrength = 2;
const objectParams = {
    segments: 40,
    edgeRadius: 0.142,
};

const StoneType = Object.freeze({
	WellSpring: Symbol("wellspring"),
	Bend1: Symbol("bend1"),
    Bend2: Symbol("bend2"),
    Bend3: Symbol("bend3"),
    Bend4: Symbol("bend4"),
	Mouth: Symbol("mouth"),
	Ember: Symbol("ember"),
    Ichor: Symbol("ichor"),
    Salt: Symbol("salt"),
    Guide: Symbol("guide")
});
let finishedStones;
const Stones = [StoneType.WellSpring, StoneType.Bend1, StoneType.Bend2, StoneType.Bend3, StoneType.Bend4, StoneType.Mouth, StoneType.Ember, StoneType.Ember,StoneType.Ember, StoneType.Ichor, StoneType.Ichor,StoneType.Salt, StoneType.Guide];
const stoneArray = [];

function getStoneTexture(stoneType) {
    const textureLoader = new THREE.TextureLoader();
    switch(stoneType) {
        case StoneType.WellSpring:
            return textureLoader.load('./textures/wellspring.png');
        case StoneType.Bend1:
            return textureLoader.load('./textures/bend1.png');
        case StoneType.Bend2:
            return textureLoader.load('./textures/bend2.png');
        case StoneType.Bend3:
            return textureLoader.load('./textures/bend3.png');
        case StoneType.Bend4:
            return textureLoader.load('./textures/bend4.png');
        case StoneType.Mouth:
            return textureLoader.load('./textures/rivermouth.png'); 
        case StoneType.Ember:
            return textureLoader.load('./textures/ember.png');
        case StoneType.Ichor:
            return textureLoader.load('./textures/ichor.png');
        case StoneType.Salt:
            return textureLoader.load('./textures/salt.png');
        case StoneType.Guide:
            return textureLoader.load('./textures/guide.png');
        default:
            throw new Error("stoneType does not exist");
    }
}

// Initialisation////////////////////////////////////////////////////////////////////////////////////////
let startPos = [0,0]
let endPos = [0,0];
let tempPosition;
initPhysics();
initScene();
if(debug) initDebugger();
throwStones();
render();


window.addEventListener('resize', updateSceneSize);
window.addEventListener('mousedown', (e) => {
    window.addEventListener('mousemove', wiggleEvent); 
    startPos = [e.pageX, e.pageY];
    liftStones();});
window.addEventListener('touchstart', (e) => {
    startPos = [e.touches[0].clientX, e.touches[0].clientY];
    liftStones();});
window.addEventListener('mouseup', (e) => {
    window.removeEventListener('mousemove', wiggleEvent); 
   
    throwStones();});
window.addEventListener('touchend', (e) => {
    throwStones();});

window.addEventListener('touchmove', (e) => {
    endPos = [e.touches[0].clientX, e.touches[0].clientY];
    wigglePositions();
});

function wiggleEvent(e) {
    endPos = [e.pageX, e.pageY];
    wigglePositions();
}


function initScene() {

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasEl
    });
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight-(0.1 * window.innerHeight)), .1, 300)
    camera.position.set(0, 10, -2)
    camera.rotateOnAxis(new THREE.Vector3(1,0,0), 180.5)

    updateSceneSize();

    const ambientLight = new THREE.AmbientLight(0xffffff, .5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, 600);
    topLight.position.set(10, 15, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;
    scene.add(topLight);
    
    createEnvironment();
    let stoneMeshes = {};
    for (let type of Object.values(StoneType)) {
        stoneMeshes[type] = createStoneMesh(type);
    }
    for (let i = 0; i < Stones.length; i++) {
        let stoneObject = createStone(stoneMeshes[Stones[i]]);
        let stone = {object:stoneObject, type:Stones[i]}
        stoneArray.push(stone);
        addStoneEvents(stone);
    }
}

function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -10, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = .01;

}

function initDebugger() {
    cannonDebugger = new CannonDebugger(scene, physicsWorld, {
        // options...
      })
}


// Object Creation //////////////////////////////////////////////////////////////////////////////////////////////
function createEnvironment() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.ShadowMaterial({
            color: 0x00000,
            opacity: .1
        })
    )
    floor.receiveShadow = true;
    floor.position.y = -7;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);

    const wall1 = new CANNON.Body({
        type:CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(10, 20, 1)),
        position: new CANNON.Vec3(0,10,-8)
    });
    physicsWorld.addBody(wall1);

    const wall2 = new CANNON.Body({
        type:CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(0.1, 20, 10)),
        position: new CANNON.Vec3(-8,10,0)
    });
    physicsWorld.addBody(wall2);

    const wall3 = new CANNON.Body({
        type:CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(10, 20, 1)),
        position: new CANNON.Vec3(0,10,8)
    });
    physicsWorld.addBody(wall3);

    const wall4 = new CANNON.Body({
        type:CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(1, 20, 10)),
        position: new CANNON.Vec3(8,10,0)
    });
    physicsWorld.addBody(wall4);
}

function createBoxGeometry() {

    let boxGeometry = new THREE.BoxGeometry(1, 0.2, 1, objectParams.segments, objectParams.segments, objectParams.segments);
    const positionAttr = boxGeometry.attributes.position;
    const subCubeHalfSize = .5 - objectParams.edgeRadius;

    const uvAttr = boxGeometry.getAttribute('uv');

    for (let i = 0; i < positionAttr.count; i++) {

        let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);

        const subCube = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition = new THREE.Vector3().subVectors(position, subCube);

        if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.normalize().multiplyScalar(objectParams.edgeRadius);
            position = subCube.add(addition);
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
            addition.z = 0;
            addition.normalize().multiplyScalar(objectParams.edgeRadius);
            position.x = subCube.x + addition.x;
            position.y = subCube.y + addition.y;
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.y = 0;
            addition.normalize().multiplyScalar(objectParams.edgeRadius);
            position.x = subCube.x + addition.x;
            position.z = subCube.z + addition.z;
        } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.x = 0;
            addition.normalize().multiplyScalar(objectParams.edgeRadius);
            position.y = subCube.y + addition.y;
            position.z = subCube.z + addition.z;
        }
        
        positionAttr.setXYZ(i, position.x, position.y, position.z);
        // Set UV coordinates
        // Set UV coordinates based on the face
    if (position.y === subCubeHalfSize) { // Top face
        uvAttr.setX(i * 2, topUVs[0].x, topUVs[0].y);
        uvAttr.setY(i * 2 + 1, topUVs[1].x, topUVs[1].y);
    } else if (position.y === -subCubeHalfSize) { // Bottom face
        uvAttr.setX(i * 2, bottomUVs[0].x, bottomUVs[0].y);
        uvAttr.setY(i * 2 + 1, bottomUVs[1].x, bottomUVs[1].y);
    } else { // Side faces
        // Modify UVs if needed for side faces
    }
    }

    // boxGeometry.deleteAttribute('normal');
    // boxGeometry.deleteAttribute('uv');
    // console.log(uv);
    // boxGeometry.attributes.uv = uv;
    //boxGeometry.attributes.uv.needsUpdate = true;
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    boxGeometry.computeVertexNormals();

    return boxGeometry;
}


function createStoneMesh(stoneType) {
    let texture = getStoneTexture(stoneType);
    const textureLoader = new THREE.TextureLoader();
    const stoneTexture = textureLoader.load("./textures/stonetexture.png");
    const textureMaterial = new THREE.MeshLambertMaterial({
        map: texture,
    });

    const stoneMaterial = new THREE.MeshLambertMaterial({
        map: stoneTexture
    })

    const materials = [
        stoneMaterial, // Right side
        stoneMaterial, // Left side
        textureMaterial, // Top side
        textureMaterial, // Bottom side
        stoneMaterial, // Front side
        stoneMaterial // Back side
    ];
    const stoneMesh = new THREE.Mesh(createBoxGeometry(), materials);
    stoneMesh.castShadow = true;

    return stoneMesh;
}

function createStone(stoneMesh) {
    const mesh = stoneMesh.clone();
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, 0.01, .5)),
        sleepTimeLimit: .1
    });
    physicsWorld.addBody(body);

    return {mesh, body};
}


// Game Logic  /////////////////////////////////////////////////////////////////////////////////////////////////
function generatePositions(numPositions, gridSize) {
    let positions = [];
    while (positions.length < numPositions) {
        let x = Math.floor(Math.random() * gridSize - gridSize/2);
        let y = Math.floor(Math.random() * gridSize - gridSize/2);
        // Check if the new position is not adjacent to any existing positions
        if (positions.every(([px, py]) => Math.abs(x - px) > 1 || Math.abs(y - py) > 1)) {
            positions.push([x, y]);
        }
    }
    return positions;
}

function wigglePositions() {
    let dirX = Math.abs(startPos[0] - endPos[0]) < 10 ? 0 :  (startPos[0] - endPos[0]) / window.innerWidth;
    let dirY = Math.abs(startPos[1] - endPos[1]) < 10 ? 0 :  (startPos[1] - endPos[1]) /(window.innerHeight-(0.1 * window.innerHeight));
  
    stoneArray.forEach((stone, sIDx) => {
        let s = stone.object;

        s.body.velocity.setZero();
        s.body.angularVelocity.setZero();
        s.body.position = new CANNON.Vec3(tempPosition[sIDx][0]-dirX, 0, tempPosition[sIDx][1]-dirY);
        s.mesh.position.copy(s.body.position);
    });
}

function liftStones() {
    let positions = generatePositions(Stones.length, 10);
    tempPosition = positions;
    physicsWorld.gravity = new CANNON.Vec3(0, 0, 0),
    stoneArray.forEach((stone, sIDx) => {
        let s = stone.object;

        s.body.velocity.setZero();
        s.body.angularVelocity.setZero();
        s.body.position = new CANNON.Vec3(positions[sIDx][0], 0, positions[sIDx][1]);
        s.mesh.position.copy(s.body.position);

        s.mesh.rotation.set(0, Math.random(), 0)
        s.body.quaternion.copy(s.mesh.quaternion);
    });
}

function throwStones() {
    
    let dirX = Math.abs(startPos[0] - endPos[0]) < 10 ? 0 :  (startPos[0] - endPos[0]) / window.innerWidth;
    let dirY = Math.abs(startPos[1] - endPos[1]) < 10 ? 0 :  (startPos[1] - endPos[1]) /(window.innerHeight-(0.1 * window.innerHeight));
    finishedStones = 0;
    let positions = generatePositions(Stones.length, 10);
    physicsWorld.gravity = new CANNON.Vec3(0, -10, 0),
    stoneArray.forEach((stone, sIDx) => {
        let s = stone.object;

        s.body.velocity.setZero();
        s.body.angularVelocity.setZero();
        s.body.position = new CANNON.Vec3(positions[sIDx][0], 0, positions[sIDx][1]);
        s.mesh.position.copy(s.body.position);

        s.mesh.rotation.set(0, Math.random(), 0)
        s.body.quaternion.copy(s.mesh.quaternion);

        const force = 3 + 1 * Math.random();
        s.body.applyImpulse(
            new CANNON.Vec3(-dirX*throwStrength, force, -dirY*throwStrength),
            new CANNON.Vec3(Math.random() * 0.05 -0.005,Math.random() * 0.05 -0.005,Math.random() * 0.05 - 0.005)
        );

        s.body.allowSleep = true;
    });
}

function addStoneEvents(stone) {
    let stoneObject = stone.object;
    stoneObject.body.addEventListener('sleep', (e) => {
        stoneObject.body.allowSleep = false;
        stone.x = stoneObject.body.position.x;
        stone.z = stoneObject.body.position.z;
        finishedStones +=1;
        handleResults();
    });
}

function handleResults() {
    if(finishedStones < Stones.length) {
        return;
    }
}

function render() {
    physicsWorld.fixedStep();

    for (const stone of stoneArray) {
        stone.object.mesh.position.copy(stone.object.body.position)
        stone.object.mesh.quaternion.copy(stone.object.body.quaternion)
    }
    if(debug) cannonDebugger.update(); // Update the CannonDebugger meshes
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function updateSceneSize() {
    let initialAspect = window.innerWidth / (window.innerHeight-(0.1 * window.innerHeight));
    let [height, aspect] = initialAspect < 1? [window.innerWidth, 1] : [window.innerHeight-(0.1 * window.innerHeight), initialAspect];
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, height);
    
}
