import Commons from "./Commons";
import * as THREE from "three";

import fragmentShader from "../../shaders/text/text.frag";
import vertexShader from "../../shaders/text/text.vert";

// @ts-ignore
import { Text } from "troika-three-text";

import { inView, animate } from "motion";

interface Props {
  scene: THREE.Scene;
  element: HTMLElement;
}
export default class WebGLText {
  private commons: Commons;

  private scene: THREE.Scene;
  private element: HTMLElement;

  private computedStyle: CSSStyleDeclaration;
  private font!: string; // Path to our .ttf font file.
  private bounds!: DOMRect;
  private color!: THREE.Color;
  private material!: THREE.ShaderMaterial;
  private mesh!: Text;

  // We assign the correct font bard on our element's font weight from here
  private weightToFontMap: Record<string, string> = {
    "900": "/fonts/Humane-Black.ttf",
    "800": "/fonts/Humane-ExtraBold.ttf",
    "700": "/fonts/Humane-Bold.ttf",
    "600": "/fonts/Humane-SemiBold.ttf",
    "500": "/fonts/Humane-Medium.ttf",
    "400": "/fonts/Humane-Regular.ttf",
    "300": "/fonts/Humane-Light.ttf",
    "200": "/fonts/Humane-ExtraLight.ttf",
    "100": "/fonts/Humane-Thin.ttf",
  };

  private y: number = 0; // Scroll-adjusted bounds.top

  private isVisible: boolean = false;

  constructor({ scene, element }: Props) {
    this.commons = Commons.getInstance();

    this.scene = scene;
    this.element = element;

    this.computedStyle = window.getComputedStyle(this.element); // Saving initial computed style.

    this.createFont();
    this.createColor();
    this.createBounds();
    this.createMaterial();
    this.createMesh();
    this.setStaticValues();

    this.scene.add(this.mesh);

    this.element.style.color = "transparent"; // Setting the DOM Element to invisible, so that only WebGLText remains.

    this.addEventListeners(); // Inits visibility tracking for show() and hide()
  }

  private createFont() {
    this.font =
      this.weightToFontMap[this.computedStyle.fontWeight] ||
      "/fonts/Humane-Regular.ttf";
  }

  private createBounds() {
    this.bounds = this.element.getBoundingClientRect();
    this.y = this.bounds.top + this.commons.lenis.actualScroll;
  }

  private createColor() {
    this.color = new THREE.Color(this.computedStyle.color);
  }

  private createMaterial() {
    this.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uProgress: new THREE.Uniform(0),
        uHeight: new THREE.Uniform(this.bounds.height),
        uColor: new THREE.Uniform(this.color),
      },
    });
  }

  private createMesh() {
    this.mesh = new Text();

    this.mesh.text = this.element.innerText; // Always use innerText (not innerHTML or textContent).
    this.mesh.font = this.font;

    this.mesh.anchorX = "0%"; // We set to position it from the left, instead of the center as in traditional ThreeJS/WebGL
    this.mesh.anchorY = "50%";

    this.mesh.material = this.material;
  }

  /**
   * Sets static values that don't have to be updated on every frame.
   * This is called at initialization and resize.
   */
  private setStaticValues() {
    const { fontSize, letterSpacing, lineHeight, whiteSpace, textAlign } =
      this.computedStyle;

    const fontSizeNum = window.parseFloat(fontSize);

    this.mesh.fontSize = fontSizeNum;

    this.mesh.textAlign = textAlign;

    // Troika defines letter spacing in em's, so we convert to them
    this.mesh.letterSpacing = parseFloat(letterSpacing) / fontSizeNum;

    // Same with line height
    this.mesh.lineHeight = parseFloat(lineHeight) / fontSizeNum;

    // Important to define maxWidth for the mesh, so that our text doesn't overflow
    this.mesh.maxWidth = this.bounds.width;

    this.mesh.whiteSpace = whiteSpace;
  }

  show() {
    this.isVisible = true;

    animate(
      this.material.uniforms.uProgress,
      { value: 1 },
      { duration: 1.8, ease: [0.25, 1, 0.5, 1] }
    );
  }

  hide() {
    animate(
      this.material.uniforms.uProgress,
      { value: 0 },
      { duration: 1.8, onComplete: () => (this.isVisible = false) }
    );
  }

  onResize() {
    this.computedStyle = window.getComputedStyle(this.element);
    this.createBounds();
    this.setStaticValues();
    this.material.uniforms.uHeight.value = this.bounds.height;
  }

  update() {
    if (this.isVisible) {
      this.mesh.position.y =
        -this.y +
        this.commons.lenis.animatedScroll +
        this.commons.sizes.screen.height / 2 -
        this.bounds.height / 2;

      this.mesh.position.x =
        this.bounds.left - this.commons.sizes.screen.width / 2;
    }
  }

  /**
   * Inits visibility tracking using motion.
   */
  private addEventListeners() {
    inView(this.element, () => {
      this.show();

      return () => this.hide();
    });
  }
}
