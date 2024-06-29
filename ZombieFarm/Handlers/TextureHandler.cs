using System.Collections.Generic;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content;
namespace ZombieFarm;

public class TextureHandler
{
    private Dictionary<string, TextureMeta> _loadedTextures;
    private ContentManager _contentManager;


    public TextureHandler(ContentManager contentManager)
    {
        _loadedTextures = new();
        _contentManager = contentManager;
    }

    public Texture2D GetTexture(string textureName)
    {
        if(_loadedTextures.ContainsKey(textureName))
        {
            _loadedTextures[textureName].Count += 1;
            return _loadedTextures[textureName].Texture;
        }

        Texture2D texture = _contentManager.Load<Texture2D>(textureName);
        TextureMeta textureMeta = new(texture, false);
        _loadedTextures.Add(textureName, textureMeta);

        return texture;
    }

    public void ClearScene(string nesceneName)
    {
        _loadedTextures = new();
    }

}
