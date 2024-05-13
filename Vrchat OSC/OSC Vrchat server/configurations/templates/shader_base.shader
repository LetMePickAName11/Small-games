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
        
        uint ExtractBits(float msb, float lsb, float index, uint bitSize) {
            // Convert floats to uints to avoid float imprecision problems
            uint msbChunk = (uint)(msb + 0.1f);
            uint lsbChunk = (uint)(lsb + 0.1f);
            uint bitStart = (uint)(index + 0.1f);

            // Combine the two chunks into one 16-bit number
            uint combinedChunks = (msbChunk << 8) | lsbChunk;

            // Calculate the actual start bit position from MSB (index 0)
            uint shiftAmount = 16 - bitStart - bitSize;

            // Shift right to the start bit position
            uint shiftedForExtraction = combinedChunks >> shiftAmount;

            // Create a mask with the correct bit size
            uint mask = (1u << bitSize) - 1u;

            // Return the extracted bits
            return shiftedForExtraction & mask;
        }

        void vert (inout appdata_full v, out Input o) {
            o.uv_MainTex = v.texcoord.xy;
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
