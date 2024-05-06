Shader "Unlit/NewUnlitShader"
{
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
        _Color ("Main Color", Color) = (1,1,1,1)

        _FirstBitsPosition ("FirstBitsPosition", Range(0,255)) = 0
        _FirstBitsSelectedPiece ("FirstBitsSelectedPiece", Range(0,255)) = 0
        _FirstBitsSelectedPieceShown ("FirstBitsSelectedPieceShown", Range(0,255)) = 0
        _IndexBitsPosition ("IndexBitsPosition", Range(0,15)) = 0
        _IndexBitsSelectedPiece ("IndexBitsSelectedPiece", Range(0,15)) = 0
        _IndexBitsSelectedPieceShown ("IndexBitsSelectedPieceShown", Range(0,15)) = 0
        _LastBitsPosition ("LastBitsPosition", Range(0,255)) = 0
        _LastBitsSelectedPiece ("LastBitsSelectedPiece", Range(0,255)) = 0
        _LastBitsSelectedPieceShown ("LastBitsSelectedPieceShown", Range(0,255)) = 0
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
        
        float _FirstBitsPosition;
        float _FirstBitsSelectedPiece;
        float _FirstBitsSelectedPieceShown;
        float _IndexBitsPosition;
        float _IndexBitsSelectedPiece;
        float _IndexBitsSelectedPieceShown;
        float _LastBitsPosition;
        float _LastBitsSelectedPiece;
        float _LastBitsSelectedPieceShown;
        
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
