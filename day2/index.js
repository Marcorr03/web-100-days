const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function createCircularTexture(size = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}
const pointTexture = createCircularTexture();

function createPoints({ count, generator, color, size, opacity = 0.5 }) {
  const positions = [];
  const offsets = [];

  for (let i = 0; i < count; i++) {
    const { x, y, z } = generator();
    positions.push(x, y, z);
    offsets.push(Math.random(), Math.random(), Math.random());
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("offset", new THREE.Float32BufferAttribute(offsets, 3));

  const material = new THREE.PointsMaterial({
    color,
    size,
    opacity,
    map: pointTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    alphaTest: 0.01,
  });

  return new THREE.Points(geometry, material);
}

const saturn = createPoints({
  count: 5000,
  generator: () => {
    const phi = Math.random() * 2 * Math.PI;
    const costheta = Math.random() * 2 - 1;
    const theta = Math.acos(costheta);
    const r = 5 + Math.random();
    return {
      x: r * Math.sin(theta) * Math.cos(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(theta),
    };
  },
  color: 0xffcc66,
  size: 0.2,
  opacity: 0.8,
});

const ring = createPoints({
  count: 5000,
  generator: () => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 6.2 + Math.random() * (14 - 6.2);
    return {
      x: Math.cos(angle) * radius,
      y: (Math.random() - 0.5) * 0.05,
      z: Math.sin(angle) * radius,
    };
  },
  color: 0xaaaaff,
  size: 0.2,
  opacity: 0.9,
});
ring.rotation.y = Math.PI / 1.3;

const saturnGroup = new THREE.Group();
saturnGroup.add(saturn);
saturnGroup.add(ring);
saturnGroup.rotation.z = Math.PI / -8;
scene.add(saturnGroup);

const stars = createPoints({
  count: 5000,
  generator: () => ({
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    z: (Math.random() - 0.5) * 300,
  }),
  color: 0xffffff,
  size: 0.2,
  opacity: 6,
});
scene.add(stars);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(30, 30, 30);
scene.add(light);

let angle = 0;
function animate() {
  requestAnimationFrame(animate);
  angle += 0.005;
  saturnGroup.rotation.y -= 0.002;

  [saturn, ring].forEach((obj) => {
    const pos = obj.geometry.attributes.position;
    const offset = obj.geometry.attributes.offset;

    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      pos.array[ix] += Math.sin(angle + offset.array[ix] * 10) * 0.001;
      pos.array[ix + 1] += Math.cos(angle + offset.array[ix + 1] * 10) * 0.001;
      pos.array[ix + 2] += Math.sin(angle + offset.array[ix + 2] * 10) * 0.001;
    }

    pos.needsUpdate = true;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
