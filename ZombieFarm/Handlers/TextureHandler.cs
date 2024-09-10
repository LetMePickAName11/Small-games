namespace ZombieFarm;

public class TextureHandler
{
    public TextureHandler(ContentManager contentManager)
    {
        _loadedTextures = new();
        _spriteFonts = new();
        _contentManager = contentManager;
    }

    public Texture2D GetTexture2D(string textureName)
    {
        if (_loadedTextures.ContainsKey(textureName))
        {
            _loadedTextures[textureName].Count += 1;
            return _loadedTextures[textureName].Texture;
        }

        Texture2D texture = _contentManager.Load<Texture2D>(textureName);
        TextureMeta textureMeta = new(texture, false);
        _loadedTextures.Add(textureName, textureMeta);

        return texture;
    }

    public SpriteFont GetSpriteFont(string fontName)
    {
        if (_spriteFonts.ContainsKey(fontName))
        {
            return _spriteFonts[fontName];
        }

        Texture2D texture = GetTexture2D(fontName);
        List<Rectangle> glyphBounds = new() { new(0, 0, 10, 10), new(0, 0, 10, 10) };
        List<Rectangle> cropping = new() { new(0, 0, 10, 10), new(0, 0, 10, 10) };
        List<char> characters = "1?".ToList();
        int lineSpacing = 10;
        float spacing = 10f;
        List<Vector3> kerning = new() { new(0, 10, 0), new(0, 10, 0) };
        char? defaultCharacter = '?';

        SpriteFont spriteFont = new(texture, glyphBounds, cropping, characters, lineSpacing, spacing, kerning, defaultCharacter);
        _spriteFonts.Add(fontName, spriteFont);

        return spriteFont;
    }


    private Dictionary<string, TextureMeta> _loadedTextures;
    private Dictionary<string, SpriteFont> _spriteFonts;
    private ContentManager _contentManager;
}
