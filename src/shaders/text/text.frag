uniform float uProgress;
uniform vec3 uColor;

varying vec2 vUv;


void main() {
    // Calculate the reveal threshold (bottom to top reveal)
    float reveal = 1.0 - vUv.y;
    
    // Discard fragments above the reveal threshold based on progress
    if (reveal > uProgress) discard;

    // Apply the color to the visible parts of the text
    gl_FragColor = vec4(uColor, 1.0);
}
