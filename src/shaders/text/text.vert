uniform float uProgress;
uniform float uHeight;

varying vec2 vUv;

void main() {
    vUv = uv;
    
    vec3 transformedPosition = position;
    
    transformedPosition.y -= uHeight * (1.0 - uProgress);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
}