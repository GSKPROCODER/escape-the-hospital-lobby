import * as THREE from 'three';
import { Quality } from '../core/Settings';

export class Renderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;

  constructor(containerId: string) {
    this.scene = new THREE.Scene();

    // Dim, moody but clearly visible — a middle ground between clinical-bright
    // and pitch-black. Cool teal atmosphere with real light/shadow contrast.
    this.scene.background = new THREE.Color(0x0b1418);
    this.scene.fog = new THREE.FogExp2(0x0b1418, 0.024);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 300);

    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // Sky/ground hemisphere fill — soft base light so shadows aren't black.
    const hemi = new THREE.HemisphereLight(0x9fb4c0, 0x2a3238, 0.65);
    hemi.position.set(0, 20, 0);
    this.scene.add(hemi);

    // Ambient base so corners stay readable.
    const ambient = new THREE.AmbientLight(0x8296a0, 0.5);
    this.scene.add(ambient);

    // Cool key light for form + soft shadows (moonlight through windows).
    this.dirLight = new THREE.DirectionalLight(0xbcd2e8, 0.7);
    this.dirLight.position.set(8, 16, 6);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(2048, 2048);
    const cam = this.dirLight.shadow.camera;
    cam.near = 0.5; cam.far = 80;
    cam.left = -40; cam.right = 40; cam.top = 40; cam.bottom = -40;
    this.dirLight.shadow.bias = -0.0004;
    this.scene.add(this.dirLight);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /** Apply a quality preset (DPR, shadows, shadow map resolution). */
  setQuality(q: Quality) {
    switch (q) {
      case 'low':
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        break;
      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.dirLight.shadow.mapSize.set(1024, 1024);
        break;
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.dirLight.shadow.mapSize.set(2048, 2048);
        break;
    }
    this.renderer.shadowMap.needsUpdate = true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
