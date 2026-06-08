uniform vec3 uDiffuse;
varying vec2 vUv;
varying vec3 vColor;

// #606c38
const vec3 color1 = vec3(0.37647, 0.42353, 0.21961);
// #bc6c25
const vec3 color5 = vec3(0.73725, 0.42353, 0.14510);
// #669bbc
vec3 color3      = vec3(0.40000, 0.60784, 0.73725);

void main() {

    float maskBrick   = vColor.r;
    float maskPlaster = vColor.g;
    float maskWood    = vColor.b;

    vec3 finalColor = vec3(0.);

    finalColor += color5 * maskBrick;
    finalColor += color1 * maskPlaster;
    finalColor += color3 * maskWood;

    csm_DiffuseColor = vec4(finalColor, 1.0);
}