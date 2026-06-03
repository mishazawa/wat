uniform sampler2D uVatTexture;
uniform float uFrame;
uniform float uTotalFrames;
uniform float uNumBones;

varying vec2 vUv;

attribute float aVatBoneIndex;
attribute vec3 aVatBindPos;

mat3 getVatRotationMatrix(vec4 q) {
    float x2 = q.x + q.x;  float y2 = q.y + q.y;  float z2 = q.z + q.z;
    float xx = q.x * x2;   float xy = q.x * y2;   float xz = q.x * z2;
    float yy = q.y * y2;   float yz = q.y * z2;   float zz = q.z * z2;
    float wx = q.w * x2;   float wy = q.w * y2;   float wz = q.w * z2;

    return mat3(
        vec3(1.0 - (yy + zz),        xy + wz,        xz - wy),
        vec3(        xy - wz, 1.0 - (xx + zz),        yz + wx),
        vec3(        xz + wy,        yz - wx, 1.0 - (xx + yy))
    );
}

void main() {
    vUv = uv;
    
    float v = (uFrame + 0.5) / uTotalFrames;

    float totalPackedPixels = uNumBones * 2.0;
    
    // packing [t,q][t,q][t,q][t,q]...
    float idx = aVatBoneIndex * 2.0 + .5;

    float u_pos = idx / totalPackedPixels;
    float u_rot = (idx + 1.0) / totalPackedPixels;
    vec2 coords_pos = vec2(u_pos, v);
    vec2 coords_rot = vec2(u_rot, v);
    
    vec3 pos = texture2D(uVatTexture, coords_pos).rgb;
    vec4 q = normalize(texture2D(uVatTexture, coords_rot));

    mat3 rotMatrix = getVatRotationMatrix(q);

    vec3 rotatedVertex = rotMatrix * position;
    vec3 rotatedBindPos = rotMatrix * aVatBindPos;
    vec3 motionBridge = pos - rotatedBindPos;
    vec3 finalPosition = rotatedVertex + motionBridge;

    csm_Position = finalPosition;
}