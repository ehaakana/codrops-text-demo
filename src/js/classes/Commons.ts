import { PerspectiveCamera, WebGLRenderer, Clock } from "three";

import Lenis from "lenis";

export interface Screen {
  width: number;
  height: number;
  aspect: number;
}

export interface Sizes {
  screen: Screen;
  pixelRatio: number;
}

/**
 * Singleton class for Common stuff.
 * Camera
 * Renderer
 * Lenis
 * Time
 */
export default class Commons {
  private constructor() {}

  private static instance: Commons;

  lenis!: Lenis;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;

  private time: Clock = new Clock();
  elapsedTime!: number;

  sizes: Sizes = {
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      aspect: window.innerWidth / window.innerHeight,
    },
    pixelRatio: this.getPixelRatio(),
  };

  private distanceFromCamera: number = 1000;

  /**
   * Function to be called to either create Commons Singleton instance, or to return existing one.
   * TODO AFTER: Call instances init() function.
   * @returns Commons Singleton Instance.
   */
  static getInstance() {
    if (this.instance) return this.instance;

    this.instance = new Commons();
    return this.instance;
  }

  /**
   * Initializes all-things Commons. To be called after instance is set.
   */
  init() {
    this.createLenis();
    this.createCamera();
    this.createRenderer();
  }

  /**
   * Creates Lenis instance.
   * Sets autoRaf to true so we don't have to manually update Lenis on every frame.
   */
  private createLenis() {
    this.lenis = new Lenis({
      autoRaf: true,
      duration: 2,
    });
  }

  /**
   * Creates global camera.
   */
  private createCamera() {
    this.camera = new PerspectiveCamera(
      70,
      this.sizes.screen.aspect,
      200,
      2000
    );
    this.camera.position.z = this.distanceFromCamera;
    this.syncDimensions();
    this.camera.updateProjectionMatrix();
  }

  /**
   * Creates the common WebGLRenderer to be used across the app.
   */
  private createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true, // Sets scene background to transparent, so our html body background defines the background color
      antialias: true,
    });

    this.renderer.setSize(this.sizes.screen.width, this.sizes.screen.height);

    this.renderer.setPixelRatio(this.sizes.pixelRatio);

    document.body.appendChild(this.renderer.domElement); // Creating canvas element and appending to body element.
  }

  /**
   * Single source of tbruth to get pixelRatio.
   */
  getPixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
  }

  /**
   * Resize handler function is called from the entry-point (main.ts)
   * Updates the Common screen dimensions.
   * Updates the renderer.
   * Updates the camera.
   */
  onResize() {
    // Updating screen info
    this.sizes.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspect: window.innerWidth / window.innerHeight,
    };
    this.sizes.pixelRatio = this.getPixelRatio();

    // Updating renderer
    this.renderer.setSize(this.sizes.screen.width, this.sizes.screen.height);
    this.renderer.setPixelRatio(this.sizes.pixelRatio);

    //Updating camera
    this.onResizeCamera();
  }

  /**
   * Handler function that is called from onResize handler.
   * Updates the perspective camera with the new adjusted screen dimensions
   */
  private onResizeCamera() {
    this.syncDimensions();
    this.camera.aspect = this.sizes.screen.aspect;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Helper function that is called upon initialization and resize
   * Updates the camera's fov according to the new dimensions such that the window's pixels match with that of WebGL scene
   */
  private syncDimensions() {
    this.camera.fov =
      2 *
      Math.atan(this.sizes.screen.height / 2 / this.distanceFromCamera) *
      (180 / Math.PI);
  }

  /**
   * Update function to be called from entry-point (main.ts)
   */
  update() {
    this.elapsedTime = this.time.getElapsedTime();
  }
}
