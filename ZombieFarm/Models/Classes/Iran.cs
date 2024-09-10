namespace ZombieFarm;

public class Iran
{
    private readonly List<Tile> _foreground;
    private readonly List<Tile> _middleground;
    private readonly List<Tile> _background;
    private readonly List<Tile> _walls;


    public Iran(TextureHandler textureHandler)
    {
        _foreground = new List<Tile>();
        _middleground = new List<Tile>();
        _background = new List<Tile>();
        _walls = new List<Tile>();

        for (int i = 0; i < 10; i++)
        {
            for (int j = 0; j < 10; j++)
            {
                var a = new Tile
                {
                    Texture = textureHandler.GetTexture2D("Gonk"),
                    Position = new Rectangle(i * 100, j * 100, 100, 100),
                    Color = Color.White,
                    HasCollision = false,
                    clickable = new FarmTile()
                };

                _foreground.Add(a);
                _middleground.Add(a);
                _background.Add(a);
            }
        }

        for (int i = 0; i < 100; i++)
        {
            for (int j = 0; j < 100; j += 5)
            {
                var tex = textureHandler.GetTexture2D("Gonk");
                _walls.Add(new Tile
                {
                    Texture = tex,
                    Position = new Rectangle(i * 10, j * 10, 10, 10),
                    Color = Color.White,
                    HasCollision = true
                });
            }
        }
    }

    public void DrawBackground(SpriteBatch spriteBatch)
    {
        foreach (var item in _background)
        {
            spriteBatch.Draw(item.Texture, item.Position, item.Color);
        }
    }

    public void DrawForeground(SpriteBatch spriteBatch)
    {
        foreach (var item in _foreground)
        {
            spriteBatch.Draw(item.Texture, item.Position, item.Color);
        }

        foreach (var item in _walls)
        {
            spriteBatch.Draw(item.Texture, item.Position, item.Color);
        }
    }

    public void DrawMiddleground(SpriteBatch spriteBatch)
    {
        foreach (var item in _middleground)
        {
            spriteBatch.Draw(item.Texture, item.Position, item.Color);
        }
    }

    public void TileClick(GameTime gameTime, MouseState mouseState)
    {
        var a = _foreground.Find((m) => m.Position.Contains(mouseState.Position)) ??
        _middleground.Find((m) => m.Position.Contains(mouseState.Position)) ??
        _background.Find((m) => m.Position.Contains(mouseState.Position));

        if (a == null || a.clickable == null)
        {
            return;
        }

        a.clickable.OnClick(gameTime, MouseEventType.RightClick);
    }
}