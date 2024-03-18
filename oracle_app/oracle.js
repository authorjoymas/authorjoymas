import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const canvasEl = document.querySelector('#canvas');
const scoreResult = document.querySelector('#score-result');
const rollBtn = document.querySelector('#roll-btn');

// Parameters ///////////////////////////////////////////////////////////////////////////////////////////////
let debug = false;
let renderer, scene, camera, physicsWorld, cannonDebugger;
const objectParams = {
    segments: 40,
    edgeRadius: 0.2,
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

function getStoneColor(stoneType) {
    switch(stoneType) {
        case StoneType.WellSpring:
            return 0x2f2bff;
        case StoneType.Bend1:
            return 0x2b52ff;
        case StoneType.Bend2:
            return 0x2b75ff;
        case StoneType.Bend3:
            return 0x2b92ff;
        case StoneType.Bend4:
            return 0x2bb5ff;
        case StoneType.Mouth:
            return 0x2bd8ff; 
        case StoneType.Ember:
            return 0xbf541f;
        case StoneType.Ichor:
            return 0x1a6e1a;
        case StoneType.Salt:
            return 0xa3911c;
        case StoneType.Guide:
            return 0x21211e;
        default:
            return 0xffffff;
    }
}



// Initialisation////////////////////////////////////////////////////////////////////////////////////////
initPhysics();
initScene();
if(debug) initDebugger();
throwStones();
render();

window.addEventListener('resize', updateSceneSize);
window.addEventListener('dblclick', throwStones);
rollBtn.addEventListener('click', throwStones);

function initScene() {

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasEl
    });
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, .1, 300)
    camera.position.set(0, 10, -2)
    camera.rotateOnAxis(new THREE.Vector3(1,0,0), 180.5)

    updateSceneSize();

    const ambientLight = new THREE.AmbientLight(0xffffff, .5);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, .5);
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
            color: 0xffffff,
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
    }


    boxGeometry.deleteAttribute('normal');
    boxGeometry.deleteAttribute('uv');
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    boxGeometry.computeVertexNormals();

    return boxGeometry;
}

function createStoneMesh(stoneType) {
    let color = getStoneColor(stoneType);
    const boxMaterialOuter = new THREE.MeshStandardMaterial({
        color,
    })
    const stoneMesh = new THREE.Mesh(createBoxGeometry(), boxMaterialOuter);
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

function throwStones() {
    scoreResult.innerHTML = '';
    finishedStones = 0;
    let positions = generatePositions(Stones.length, 10);
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
            new CANNON.Vec3(0, force, 0),
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

    MakeReading(StoneType.WellSpring, StoneType.Bend1, StoneType.Bend2);
}

function MakeReading(river1, river2, river3) {
    let stone1 = stoneArray.filter(value => value.type == river1)[0];
    let stone2 = stoneArray.filter(value => value.type == river2)[0];
    let stone3 = stoneArray.filter(value => value.type == river3)[0];
    drawRiver(stone1,stone2,stone3);
    console.log("drawed");
    let guideStone = stoneArray.filter(value => value.type == StoneType.Guide)[0];
}


// Render ///////////////////////////////////////////////////////////////////////////////////////////////////
function drawRiver(riverStone1, riverStone2, riverStone3) {
    const geometry = new THREE.CircleGeometry( 5, 32 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const circle = new THREE.Mesh( geometry, material ); 
    scene.add( circle );
    renderer.render(scene, camera);
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
    camera.updateProjectionMatrix();
    let size = Math.min(window.innerHeight-(0.1 * window.innerHeight), window.innerWidth);
    renderer.setSize(size, size);
}
