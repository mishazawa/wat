uniform vec3 uDiffuse;
varying vec2 vUv;

void main() {
    csm_DiffuseColor = vec4(uDiffuse, 1.0);
}