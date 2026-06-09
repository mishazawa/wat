uniform sampler2D uVatTexture;
uniform float uFrame;
uniform float uTotalFrames;
uniform float uNumBones;

uniform vec2 uTexDim;
uniform float uStride;

varying vec2 vUv;
varying vec3 vColor;

attribute float aVatBoneIndex;
attribute vec3 aVatBindPos;
attribute vec3 color;

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
    vColor = color;
    float posFlatX = aVatBoneIndex * 2.0;
    float rotFlatX = posFlatX + 1.0;
    
    float posStrideId = floor(posFlatX / uTexDim.x);
    float posX = mod(posFlatX, uTexDim.x);
    float posY = uFrame * uStride + posStrideId;

    float rotStrideId = floor(rotFlatX / uTexDim.x);
    float rotX = mod(rotFlatX, uTexDim.x);
    float rotY = uFrame * uStride + rotStrideId;

    vec2 coords_pos = vec2(posX + 0.5, posY + 0.5) / uTexDim;
    vec2 coords_rot = vec2(rotX + 0.5, rotY + 0.5) / uTexDim;

    vec3 pos = texture2D(uVatTexture, coords_pos).rgb;
    vec4 q = normalize(texture2D(uVatTexture, coords_rot));

    mat3 rotMatrix = getVatRotationMatrix(q);

    vec3 finalPosition = rotMatrix * (position - aVatBindPos) + pos;

    // recalculate normals
    mat3 normalMatrixFromBone = transpose(inverse(mat3(rotMatrix)));
    vec3 correctedNormal = normalize(normalMatrixFromBone * normal);

    csm_Normal = correctedNormal;
    csm_Position = finalPosition;
}