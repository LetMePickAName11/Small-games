public class WindowHandler
{
    public WindowHandler(Game gameRoot)
    {
        _gameRoot = gameRoot;
        _graphics = new GraphicsDeviceManager(gameRoot);
    }

    public void UpdateSettings()
    {
        _gameRoot.IsMouseVisible = true;
        _graphics.PreferredBackBufferWidth = 1024;
        _graphics.PreferredBackBufferHeight = 1024;
        _graphics.ApplyChanges();
    }

    private GraphicsDeviceManager _graphics;
    private Game _gameRoot;
}