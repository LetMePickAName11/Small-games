Shader "Unlit/NewUnlitShader"
{
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
        _Color ("Main Color", Color) = (1,1,1,1)

        __[REPLACEME_PROPERTIES]__
        }
    SubShader {
        Tags { "RenderType"="Opaque" }

        CGPROGRAM
        #pragma surface surf Lambert vertex:vert

        struct Input {
            float2 uv_MainTex;
        };

        sampler2D _MainTex;
        fixed4 _Color;
        
        __[REPLACEME_VARIABLES]__
        // TODO replace ExtractBits with a Common_Functions.hlsl that is reference in each file via #include "Common_Functions.hlsl"
        uint ExtractBits(uint4 chunks, uint arraySize, uint startIndex, uint bitSize) {
            // Combine all chunks into a single integer
            uint combinedChunks = 0; 
            for (uint i = 0; i < arraySize; i++) {
                combinedChunks |= (chunks[i] << (8 * (arraySize - 1 - i)));
            }

            // Calculate the actual start bit position from MSB (index 0)
            uint shiftAmount = 8 * arraySize - startIndex - bitSize;

            // Shift right to the start bit position
            uint shiftedForExtraction = combinedChunks >> shiftAmount;

            // Create a mask with the correct bit size
            uint mask = (1u << bitSize) - 1u;

            // Return the extracted bits
            return shiftedForExtraction & mask;
        }

        void vert (inout appdata_full v, out Input o) {
            o.uv_MainTex = v.texcoord.xy;
            // Example with 2 chunks
            //ExtractBits(uint4(chunk0 + 0.1, chunk1 + 0.1, 0, 0), 2, StartIndex, BitsSize);
        }

        void surf (Input IN, inout SurfaceOutput o) {
            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = c.rgb;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
