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
        
        uint ExtractBits(float stChunk, float poChunk, float index) {
            uint startChunk = (uint)(stChunk + 0.1f); // + 0.1f to avoid float imprecission problems
            uint potentialOverflowChunk = (uint)(poChunk + 0.1f); // + 0.1f to avoid float imprecission problems
            uint bitStart = (uint)(index + 0.1f); // + 0.1f to avoid float imprecission problems

            uint combinedChunks = (startChunk << 8) | potentialOverflowChunk;
            uint shiftedForExtraction = combinedChunks >> bitStart;
            uint mask = 63; // 0b111111 for 6 bits

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
