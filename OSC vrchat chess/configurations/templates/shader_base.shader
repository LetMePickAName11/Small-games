Shader "Unlit/NewUnlitShader"
{
    Properties {
        _MainTex ("Texture", 2D) = "white" {}
        _startEightBitChunk ("Start 8-bit Chunk", Range(0,255)) = 0
        _potentialOverFlowEightBitChunk ("Potential Overflow 8-bit Chunk", Range(0,255)) = 0
        _bitStartIndex ("Bit Start Index", Range(0, 10)) = 0
        _Color ("Main Color", Color) = (1,1,1,1)
    }
    SubShader {
        Tags { "RenderType"="Opaque" }

        CGPROGRAM
        #pragma surface surf Lambert vertex:vert

        struct Input {
            float2 uv_MainTex;
        };

        sampler2D _MainTex;

        float _startEightBitChunk, _potentialOverFlowEightBitChunk, _bitStartIndex;
        fixed4 _Color;

        uint ExtractBits() {
            uint startChunk = (uint)(_startEightBitChunk + 0.1f);
            uint potentialOverflowChunk = (uint)(_potentialOverFlowEightBitChunk + 0.1f);
            uint bitStart = (uint)(_bitStartIndex + 0.1f);

            uint combinedChunks = (startChunk << 8) | potentialOverflowChunk;
            uint shiftedForExtraction = combinedChunks >> bitStart;
            uint mask = 63; // 0b111111 for 6 bits

            return shiftedForExtraction & mask;
        }

        void vert (inout appdata_full v, out Input o) {
            uint chunkValue = ExtractBits();

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
