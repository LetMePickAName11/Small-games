using Microsoft.Xna.Framework.Graphics;
using System;
namespace ZombieFarm;

public class TextureMeta
{
    public Texture2D Texture { get; private set; }
    public int Count { get; set; }
    public DateTime Initialized { get; private set; }
    public bool AlwaysLoaded { get; private set; }
    public string[] SceneName { get; set; }

    public TextureMeta(Texture2D texture, bool alwaysLoaded)
    {
        Texture = texture;
        AlwaysLoaded = alwaysLoaded;
        Initialized = DateTime.Now;
    }

    public static class TextureName 
    {
        public const string Gonk = "Gonk";
    }

    public static class TextureScene 
    {
        public readonly static string[] Gonk = { "Gonk" };
    }
}