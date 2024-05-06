Shader "Unlit/NewUnlitShader"
{
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
        _Color ("Main Color", Color) = (1,1,1,1)

        _FirstBitsSelectedPosition ("FirstBitsSelectedPosition", Range(0,255)) = 0
        _FirstBitsSelectedPositionShown ("FirstBitsSelectedPositionShown", Range(0,255)) = 0
        _IndexBitsSelectedPosition ("IndexBitsSelectedPosition", Range(0,15)) = 0
        _IndexBitsSelectedPositionShown ("IndexBitsSelectedPositionShown", Range(0,15)) = 0
        _LastBitsSelectedPosition ("LastBitsSelectedPosition", Range(0,255)) = 0
        _LastBitsSelectedPositionShown ("LastBitsSelectedPositionShown", Range(0,255)) = 0
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
        
        float _FirstBitsSelectedPosition;
        float _FirstBitsSelectedPositionShown;
        float _IndexBitsSelectedPosition;
        float _IndexBitsSelectedPositionShown;
        float _LastBitsSelectedPosition;
        float _LastBitsSelectedPositionShown;
        
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
