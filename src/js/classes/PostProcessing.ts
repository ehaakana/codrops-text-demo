import {
  EffectComposer,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";

import Commons from "./Commons";
import * as THREE from "three";

import fragmentShader from "../../shaders/postprocessing/postprocessing.frag";
import vertexShader from "../../shaders/postprocessing/postprocessing.vert";

interface Props {
  scene: THREE.Scene;
}

export default class PostProcessing {
  // Scene and utility references
  private commons: Commons;
  private scene: THREE.Scene;

  // EffectComposer and passes
  private composer!: EffectComposer;
  private renderPass!: RenderPass;
  private shiftPass!: ShaderPass;

  // Scroll velocity
  private lerpedVelocity = 0; // Smoothed scroll velocity to be used in postprocessing.
  private lerpFactor = 0.15; // Smoothing factor for lerping the velocity.

  constructor({ scene }: Props) {
    this.commons = Commons.getInstance();

    this.scene = scene;

    this.createComposer();
    this.createPasses(); // Add our render and post-process passes
  }

  /**
   * Creates EffectComposer instance and sets pixel ratio and size.
   */
  private createComposer() {
    this.composer = new EffectComposer(this.commons.renderer);
    this.composer.setPixelRatio(this.commons.sizes.pixelRatio);
    this.composer.setSize(
      this.commons.sizes.screen.width,
      this.commons.sizes.screen.height
    );
  }

  private createPasses() {
    // Creating Render Pass (final output) first
    this.renderPass = new RenderPass(this.scene, this.commons.camera);
    this.composer.addPass(this.renderPass);

    // Creating Post-processing shader for wave and RGB-shift effect
    const shiftShader = {
      uniforms: {
        tDiffuse: { value: null }, // Default input from previous pass
        uVelocity: { value: 0 }, // Scroll velocity input
        uTime: { value: 0 }, // Elapsed time for animated distortion
      },
      vertexShader,
      fragmentShader,
    };

    // Creating the ShaderPass and adding it to the composer
    this.shiftPass = new ShaderPass(shiftShader);
    this.composer.addPass(this.shiftPass);
  }

  /**
   * Resize handler for EffectComposer, called from entry-point.
   */
  onResize() {
    this.composer.setPixelRatio(this.commons.sizes.pixelRatio);
    this.composer.setSize(
      this.commons.sizes.screen.width,
      this.commons.sizes.screen.height
    );
  }

  update() {
    this.shiftPass.uniforms.uTime.value = this.commons.elapsedTime;

    // Reading current velocity form lenis instance.
    const targetVelocity = this.commons.lenis.velocity;

    // We use the lerped velocity as the actual velocity for the shader, just for a smoother experience.
    this.lerpedVelocity +=
      (targetVelocity - this.lerpedVelocity) * this.lerpFactor;

    this.shiftPass.uniforms.uVelocity.value = this.lerpedVelocity;

    this.composer.render();
  }
}
