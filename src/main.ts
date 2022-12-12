import './style.css';
import * as THREE from "three";
import { GUI } from "lil-gui";
// @ts-ignore
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls"

const canvas = document.getElementById("canvas") as HTMLElement;
const scene = new THREE.Scene();
let clock = new THREE.Clock();
const gui = new GUI();
const params = {
    apply3d: false,
    n: 2,
    d: 29,
    animateD: false,
    animationSpeed: 0.125
};
gui.add(params, "apply3d").onChange(draw);
gui.add(params, "n").min(1).max(360).step(0.1).listen(true).onChange(draw);
gui.add(params, "d").min(1).max(360).step(0.1).listen(true).onChange(draw);
gui.add(params, "animationSpeed").min(0).max(2).step(0.001);
gui.add(params, "animateD").name("animate d").onChange(() => clock.elapsedTime = 0);

document.querySelectorAll(".presets > p").forEach((p) => {
    p.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        params.n = parseInt(target.dataset.n);
        params.d = parseInt(target.dataset.d);
        draw();
    })
})

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 10)
camera.position.set(0, 0, 2);
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)

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

const innerMaterial = new THREE.LineBasicMaterial({
    color: 0xFFFFFF
});

const outerMaterial = new THREE.LineBasicMaterial({
    color: 0xFF00FF
});

let geometry;
const innerLine = new THREE.Line(geometry, innerMaterial);
const outerLine = new THREE.Line(geometry, outerMaterial);
scene.add(innerLine);
scene.add(outerLine);

function drawInner() {
    const points = [];
    for (let i = 0; i < 361; i++) {
        // Inner
        const k = i * params.d * Math.PI / 180;
        const r = Math.sin(params.n * k);
        const x = r * Math.cos(k);
        const y = r * Math.sin(k);
        const z = params.apply3d ? r : 0;
        points.push(new THREE.Vector3(x, y, z));
    }
    innerLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

function drawOutline() {
    const points = [];
    for (let i = 0; i < 361; i++) {
        // Inner
        const k = i * Math.PI / 180;
        const r = Math.sin(params.n * k);
        const x = r * Math.cos(k);
        const y = r * Math.sin(k);
        const z = params.apply3d ? r : 0;
        points.push(new THREE.Vector3(x, y, z));
    }
    outerLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

function draw() {
    drawInner();
    drawOutline();
}
draw();

function animateSin(elapsedTime: number): number {
    return (Math.sin(elapsedTime * params.animationSpeed - Math.PI * 2) + 1) * 180;
}

function render() {
    const elapsedTime = clock.getElapsedTime();
    if (params.animateD) {
        const newD = animateSin(elapsedTime);
        params.d = newD;
        draw();
    }

    renderer.render(scene, camera);
    orbitControls.update();
    stats.update();

    window.requestAnimationFrame(render);
}
render()
