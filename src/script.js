import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TweenMax } from "gsap";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.075);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 7, -15);
camera.rotation.x = -Math.PI / 2;
scene.add(camera);

// Loaders
const gltfLoader = new GLTFLoader();

// Load GLB model
gltfLoader.load(
  "models/map.glb",
  (gltf) => {
    console.log("Map model loaded", gltf);
    const model = gltf.scene;

    // 90° rotation
    model.rotation.y = Math.PI / -2;

    // Center the model in the scene
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    // Render
    renderer.render(scene, camera);
  },
  undefined,
  (error) => {
    console.error("Error loading Map model", error);
  }
);

// Add a directional light (simulating sunlight)
const sunLight = new THREE.DirectionalLight(0xFFEA73, 1);
scene.add(sunLight);

// Add a second directional light (simulating moonlight)
const moonLight = new THREE.DirectionalLight(0xCCCCCC, 1);
scene.add(moonLight);

// Add points material (simulating stars)
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0 });

const starVertices = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 50;
  const y = Math.random() * 20;
  const z = (Math.random() - 0.5) * 50;
  starVertices.push(x, y, z);
}

starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Variables for simulating daytime
let timeOfDay = 0;
const dayDuration = 15;
const orbitRadius = 3;

// Animate
const animate = () => {
  timeOfDay += 1 / 60;
  if (timeOfDay > dayDuration * 2) {
    timeOfDay = 0;
  }

  // Sun cycle
  if (timeOfDay <= dayDuration) {
    const angle = (timeOfDay / dayDuration) * Math.PI * 2;
    const sunX = Math.sin(angle) * orbitRadius;
    const sunY = Math.cos(angle) * orbitRadius;
    sunLight.position.set(sunX, sunY, 0);

    const sunIntensity = Math.abs(Math.cos((timeOfDay / dayDuration) * Math.PI)) * 3;
    sunLight.intensity = sunIntensity;

    // Fade in stars
    TweenMax.to(stars.material, 1, { opacity: 1 });
  }
  // Moon cycle
  else {
    const angle = ((timeOfDay - dayDuration) / dayDuration) * Math.PI * 2;
    const moonX = Math.sin(angle) * orbitRadius;
    const moonY = Math.cos(angle) * orbitRadius;
    moonLight.position.set(moonX, moonY, 0);

    const moonIntensity = Math.abs(Math.cos(((timeOfDay - dayDuration) / dayDuration) * Math.PI)) * 1;
    moonLight.intensity = moonIntensity;

    // Fade out stars
    TweenMax.to(stars.material, 1, { opacity: 0 });
  }

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};
animate();

// Disable controls for pan and zoom
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;

// Resize handling
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onWindowResize);
