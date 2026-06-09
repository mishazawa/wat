# Web ~~vertex~~ Animated Textures

I wanted to try out Vertex Animation Textures (VAT) and make them work directly [in the browser](https://xr-paint.web.app/). I also wanted to see if I could figure out ways to use this technique for generative art. Previously, I worked on projects where we generated textures in GLSL shaders for displacement, and since VAT uses a very similar approach, it felt like a natural next step.

<img width="100%" height="auto" alt="image" src="https://github.com/user-attachments/assets/a22fab10-d940-42d6-a937-1e6b7746da2b" />

## The process

To achieve this, I needed a simulation that I could bake into a texture, and a custom shader to handle the texture lookup and vertex displacement on the web side.

<img width="100%" height="auto" alt="image" src="https://github.com/user-attachments/assets/56838f7f-125a-43f0-b871-646c1a30cd14" />

I generated an RBD simulation in Houdini using a classic setup of three materials and fractured it. Then, I converted the simulation into a KineFX rig. For optimization, I isolated the moving pieces and grouped all the non-moving (static) pieces under the root joint. Then, I deleted the internal fractured polygons to keep the mesh lightweight.

<img width="auto" height="300px" alt="image" src="https://github.com/user-attachments/assets/6badb68c-9bc5-417f-b9ed-8d5ccf436076" />
<img width="auto" height="300px" alt="image" src="https://github.com/user-attachments/assets/9bbf2c85-06f5-420a-a429-5039ecd8625e" />

With a clean, simplified rig ready, I needed to complete two steps:
- **bind position & lookup index:** I generated a bind position (rest) attribute for the exported skin and a lookup index so each vertex knows which bone it belongs to. This was straightforward: I just stored the position of each bone at the rest frame and its corresponding bone number (`ptnum`).
- **texture generation:** This part was a bit harder. For proper animation, I needed both `@P` (position) and `@orient` (orientation), which I extracted from the bone transforms. I stored these as RGBA values in texture pixels ($P = \text{vec3}$, $\text{orient} = \text{vec4}$), requiring 2 pixels per bone per frame.

### Texture generation

SideFX Labs tools export textures tailored for Unreal Engine or Unity, which didn't fit my goal of keeping the format custom, simple, and minimal. My first approach was mapping $X$ to the bone data (position/rotation) and $Y$ to the frame number. However, this generated an extremely wide texture that made Three.js suffer. To fix this, I needed to pack the pixels into a rectangular, 2^n shape.

<img width="auto" height="400px" alt="image" src="https://github.com/user-attachments/assets/12398328-96f7-4c75-9173-bc1ca71017e2" />
<img width="auto" height="295px" alt="image" src="https://github.com/user-attachments/assets/111365e6-9652-46cf-8bdf-d5144efaa3d4" />


I generated a grid with dimensions rounded to the nearest POT and calculated a stride to figure out how many rows were needed to pack all the bones. I assigned a custom attribute to each point on the grid and passed it to an OpenCL shader to rasterize the attributes into pixels. 
_(This part felt a bit hacky because I couldn't figure out how to generate everything cleanly in Copernicus, so I decided to go full SOPs for the time being)._

## Web

On the web side, the setup is very lightweight: just a static model with a custom shader. I chose to extend the standard Three.js PBR material by patching the vertex shader.

During the vertex shader stage, the shader reads the corresponding pixel value using the bone index attribute, generates the rotation matrix, and computes the final vertex position. 
```
M = @orient pixel converted to mat3
final_position = M * (vertex_position - bind_position) + animated_position;
```
<img width="auto" height="400px" alt="image" src="https://github.com/user-attachments/assets/d9b87e40-cb51-43eb-a78c-1d2c52c33e05" />

I also recalculated the **normals** in the shader, because standard lighting won't react correctly if the geometry is displaced on the GPU without updating its vectors.

## Technologies
- **Houdini:** RBD Simulation, KineFX, Copernicus
- **Web:** Three.js (R3F), GLSL

## Learning outcomes & results
At the beginning of the project, I thought this might not be possible due to certain design limitations in Three.js. However, I realized that success almost always depends on domain knowledge and how you approach the problem. I quickly figured out how to implement custom skinning, usage of the underlying matrix math, hit the physical limitations of textures, and craft workarounds to hack past them.

- **Performance:** The VAT setup plays incredibly smoothly. While it's driven by a shader, the animation can be easily rewound, paused, or have its FPS changed on the fly—even though the original simulation was baked at 24 FPS.
- **Scalability:** You can play several VATs simultaneously with a massive amount of joints. In theory, this approach is faster than standard skeletal animation.
- **Creative Flexibility:** Since the data is stored in textures, it allows for procedural, real-time modifications directly in the browser. This same pipeline can easily be adapted for character animation or complex UI motion graphics.
