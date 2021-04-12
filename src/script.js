import './style.scss'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
// const canvas = document.getElementById('world');

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Scene
 */
const colors = {
  blue: 0x68c3c0,
  brown: 0x59332e,
  brownDark: 0x23190f,
  wheat: 0xf7d9aa,
  red: 0xf25346,
  white: 0xffffff,
  pink: 0xf5986e

}
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(colors.wheat, 100, 950);

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  // canvas: canvas
  alpha: true,
  antialias: true,
})

renderer.shadowMap.enabled = true;

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const container = document.getElementById('world');
container.appendChild(renderer.domElement);

/**
 * Perspective Camera
 */
const fieldOfView = 60;
const aspectRatio = sizes.width / sizes.height;
const nearPlane = 1;
const farPlane = 10000;

const camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
);
camera.position.set(0, 100, 70);

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true


/**
 * Lights
 */

// PointLight
// const light = new THREE.PointLight(0xffffff, 1, 100, 2)
// light.position.set(4,4,6);
// scene.add(light);

// HemisphereLight
const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
scene.add(hemisphereLight)

// AmbientLight
const ambientLight = new THREE.AmbientLight(0xdc8874, .5);
scene.add(ambientLight)

// shadowLight
const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
shadowLight.position.set(150, 350, 350);
shadowLight.castShadow = true;
shadowLight.shadow.camera.left = -400;
shadowLight.shadow.camera.right = 400;
shadowLight.shadow.camera.top = 400;
shadowLight.shadow.camera.bottom = -400;
shadowLight.shadow.camera.near = 1;
shadowLight.shadow.camera.far = 1000;
shadowLight.shadow.mapSize.width = 2048;
shadowLight.shadow.mapSize.height = 2048;
scene.add(shadowLight);

// shadowLight(Helper)
const shadowLightHelper = new THREE.DirectionalLightHelper(shadowLight, 1);
scene.add(shadowLightHelper)

/**
 * Sea
 */

class Sea {
  constructor() {
    const geom = new THREE.CylinderBufferGeometry(600, 600, 800, 40, 10);
    geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const material = new THREE.MeshPhongMaterial({
      color: colors.blue,
      transparent: true,
      opacity: .8,
      flatShading: true,
    })
    this.mesh = new THREE.Mesh(geom, material);
    this.mesh.receiveShadow = true;
  }

}

const sea = new Sea();
sea.mesh.position.y = -600;
scene.add(sea.mesh)

/**
 * Sky and Clouds
 */
// Cloud
class Cloud {
  constructor() {
    this.mesh = new THREE.Object3D();

    const geom = new THREE.BoxBufferGeometry(20, 20, 20);
    const mat = new THREE.MeshPhongMaterial({
      color: colors.wheat
    });

    const nBlocs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < nBlocs; i++) {
      const m = new THREE.Mesh(geom.clone(), mat);

      m.position.x = i * 15;
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;

      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;

      const s = .1 + Math.random() * .9;
      m.scale.set(s, s, s);

      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }
}

// Sky
class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();

    this.nClouds = 20;
    this.clouds = [];

    const stepAngle = Math.PI * 2 / this.nClouds;

    for (let i = 0; i < this.nClouds; i++) {
      const c = new Cloud();
      this.clouds.push(c);
      this.mesh.add(c.mesh)

      const a = stepAngle * i;
      const h = 750 + Math.random() * 200;

      c.mesh.position.x = Math.cos(a) * h;
      c.mesh.position.y = Math.sin(a) * h;
      c.mesh.position.z = -400 - Math.random() * 400;
      c.mesh.rotation.z = a + Math.PI / 2;
      const s = 1 + Math.random() * 2;
      c.mesh.scale.set(s, s, s);

    }
  }
}

const sky = new Sky();
sky.mesh.position.y = -600;
scene.add(sky.mesh);

/**
 * Pilot
 */
class Pilot {
  constructor() {
    this.mesh = new THREE.Object3D();
    /**
     * Body
     */
    const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: colors.brown,
      flatShading: true
    })
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(-2, -12, 0)
    this.mesh.add(body)

    /**
     * Face
     */

    const faceGeom = new THREE.BoxGeometry(10, 10, 10);
    const faceMat = new THREE.MeshLambertMaterial({
      color: colors.pink
    })

    const face = new THREE.Mesh(faceGeom, faceMat)
    this.mesh.add(face)

    /**
     * Hairs - Top
     */
    const hairGeom = new THREE.BoxGeometry(4, 4, 4);
    const hairMat = new THREE.MeshLambertMaterial({
      color: colors.brown
    })

    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

    const hairs = new THREE.Object3D();
    this.hairsTop = new THREE.Object3D();

    for (let i = 0; i < 12; i++) {
      const h = hair.clone();
      const col = i % 3;
      const row = Math.floor(i / 3)
      // console.log(Math.floor(i/3))
      const startPosZ = -4;
      const startPosX = -4;
      h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
      this.hairsTop.add(h)
    }
    hairs.add(this.hairsTop);
    hairs.position.set(-5, 5, 0)

    this.mesh.add(hairs)

    /**
     * Hairs - Side
     */
    const hairSideGeom = new THREE.BoxGeometry(12,4,2);
    hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6,0,0));
    const hairSideR = new THREE.Mesh(hairSideGeom,hairMat);
    const hairSideL = hairSideR.clone();
    hairSideR.position.set(8, -2, 6);
    hairSideL.position.set(8, -2, -6);
    hairs.add(hairSideR)
    hairs.add(hairSideL)

    /**
     * Hairs - Back
     */
    const hairBackGeom = new THREE.BoxGeometry(2,8,10);
    const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
    hairBack.position.set(-1,-4,0);
    hairs.add(hairBack)
  }
}

/**
 * Plane
 */

class AirPlane {
  constructor() {
    this.mesh = new THREE.Object3D();

    /**
     * Cockpit
     */
    let geomCockpit = new THREE.BoxGeometry(80, 50, 50)
    // var geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );

    const matCockpit = new THREE.MeshPhongMaterial({
      color: colors.red,
      flatShading: true,
    });
    console.log(geomCockpit.vertices)

    geomCockpit.vertices[4].y -= 10;
    geomCockpit.vertices[4].z += 20;
    geomCockpit.vertices[5].y -= 10;
    geomCockpit.vertices[5].z -= 20;
    geomCockpit.vertices[6].y += 30;
    geomCockpit.vertices[6].z += 20;
    geomCockpit.vertices[7].y += 30;
    geomCockpit.vertices[7].z -= 20;

    const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true
    cockpit.receiveShadow = true
    this.mesh.add(cockpit);

    /**
     * Engine
     */

    const geomEngine = new THREE.BoxGeometry(20, 50, 50);
    const matEngine = new THREE.MeshPhongMaterial({
      color: colors.white,
      flatShading: true,
    })

    const engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 50;
    engine.castShadow = true
    engine.receiveShadow = true
    this.mesh.add(engine);

    /**
     * Tail plane
     */
    const geomTailPlane = new THREE.BoxGeometry(15, 20, 5)
    const matTailPlane = new THREE.MeshPhongMaterial({
      color: colors.red,
      flatShading: true,
    })
    const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane)
    tailPlane.position.set(-40, 20, 0)
    tailPlane.castShadow = true
    tailPlane.receiveShadow = true
    this.mesh.add(tailPlane);

    /**
     * Wings
     */

    const geomSideWing = new THREE.BoxGeometry(30, 5, 120);
    const matSideWing = new THREE.MeshPhongMaterial({
      color: colors.red,
      flatShading: true,
    });
    const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.y = 15;
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    /**
     * Wind Shield
     */

    const geomWindShield = new THREE.BoxGeometry(3, 15, 20);
    const matWindShield = new THREE.MeshPhongMaterial({
      color: colors.white,
      transparent: true,
      opacity: .3,
      flatShading: true,
    })
    const windShield = new THREE.Mesh(geomWindShield, matWindShield);
    windShield.position.set(5, 27, 0);
    windShield.castShadow = true;
    windShield.receiveShadow = true;
    this.mesh.add(windShield)

    /**
     * Propeller
     */

        // body
    const geomPropeller = new THREE.BoxGeometry(20, 10, 10);
    const matPropeller = new THREE.MeshPhongMaterial({
      color: colors.brown,
    })
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.position.set(60, 0, 0);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;
    this.mesh.add(this.propeller);

    // blade 1
    const geomBlade = new THREE.BoxGeometry(1, 80, 10);
    const matBlade = new THREE.MeshPhongMaterial({
      color: colors.brownDark,
      flatShading: true
    })
    const blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;
    this.propeller.add(blade1);

    // blade 2
    const blade2 = blade1.clone();
    blade2.rotation.x = Math.PI / 2;
    blade2.castShadow = true;
    blade2.receiveShadow = true;
    this.propeller.add(blade2);

    /**
     * Wheels
     */

    const wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10);
    const wheelProtectMat = new THREE.MeshPhongMaterial({
      color: colors.red,
      flatShading: true
    })
    const wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtectMat);
    wheelProtecR.position.set(25, -20, 25);
    this.mesh.add(wheelProtecR)

    const wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z;
    this.mesh.add(wheelProtecL);

    const wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    const wheelTireMat = new THREE.MeshPhongMaterial({
      color: colors.brownDark,
      flatShading: true
    })
    const wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
    wheelTireR.position.set(25, -28, 25)
    this.mesh.add(wheelTireR)

    const wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL)

    const wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5, .5, .5)
    wheelTireB.position.set(-35, -5, 0)
    this.mesh.add(wheelTireB);

    const wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    const wheelAxisMat = new THREE.MeshPhongMaterial({
      color: colors.brown,
      flatShading: true
    })
    const wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
    wheelTireR.add(wheelAxis)


    const suspensionGeom = new THREE.BoxGeometry(4, 10, 4)
    suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))
    const suspensionMat = new THREE.MeshPhongMaterial({
      color: colors.red,
      flatShading: true
    })

    const suspension = new THREE.Mesh(suspensionGeom, suspensionMat)
    suspension.position.set(-35, -5, 0);
    suspension.position.z = -.3;
    this.mesh.add(suspension);

    this.pilot = new Pilot();
    this.pilot.mesh.position.set(-10, 27, 0)
    this.mesh.add(this.pilot.mesh)

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }


}


const airplane = new AirPlane();
airplane.mesh.scale.set(.25, .25, .25);
airplane.mesh.position.y = 100;
scene.add(airplane.mesh)
/**
 * Tick
 */
const tick = () => {
  // mesh sky
  sky.mesh.rotation.z += .005;

  // mesh airplane
  airplane.mesh.rotation.y += .01;
  airplane.mesh.rotation.z += .01;
  airplane.propeller.rotation.x += .3;

  // mesh sea
  sea.mesh.rotation.z += .005;

  // renderer

  renderer.render(scene, camera);
  requestAnimationFrame(tick)
}

tick();
// window.addEventListener('load', init)

// /**
//  * Debug
//  */
// const gui = new dat.GUI()
//
// /**
//  * Base
//  */
// // Canvas
// const canvas = document.querySelector('canvas.webgl')
//
// // Scene
// const scene = new THREE.Scene()
//
// /**
//  * Textures
//  */
//
//
// /**
//  * Test sphere
//  */
//
//
// /**
//  * Floor
//  */
//
//
// /**
//  * Lights
//  */
//
//
// /**
//  * Sizes
//  */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }
//
// window.addEventListener('resize', () =>
// {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight
//
//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()
//
//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })
//
// /**
//  * Camera
//  */
//
//
// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas
// })
//
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//
// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
//
// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//
//     // Update controls
//     controls.update()
//
//     // Render
//     renderer.render(scene, camera)
//
//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }
//
// tick()