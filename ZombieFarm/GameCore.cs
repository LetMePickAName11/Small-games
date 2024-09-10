namespace ZombieFarm;

public class GameCore : Game
{
    private SpriteBatch _spriteBatch;
    private TextureHandler _textureHandler;
    private InputHandler _inputHandler;
    private AudioHandler _audioHandler;
    private UserInterfaceHanlder _userInterfaceHanlder;
    private PersistenceHandler _persistenceHandler;
    private PlayerInformationHandler _playerInformationHandler;
    private WindowHandler _windowHandler;
    private Iran iran;

    public GameCore()
    {
        Content.RootDirectory = "Content";
    }

    protected override void Initialize()
    {
        _textureHandler = new(Content);
        _audioHandler = new(Content);
        _inputHandler = new(Window);
        _userInterfaceHanlder = new();
        _persistenceHandler = new();
        _playerInformationHandler = new();
        _windowHandler = new(this);
        // TODO Replace with a method that loads settings when save and loading works
        _windowHandler.UpdateSettings();

        base.Initialize();
    }

    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);

        iran = new(_textureHandler);
        _inputHandler.AddMouseListen(MouseEventType.RightClick, iran.TileClick);
    }

    protected override void Update(GameTime gameTime)
    {
        _inputHandler.Update(gameTime);

        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.CornflowerBlue);

        _spriteBatch.Begin();

        iran.DrawBackground(_spriteBatch);
        iran.DrawMiddleground(_spriteBatch);
        iran.DrawForeground(_spriteBatch);
        
        _spriteBatch.End();

        base.Draw(gameTime);
    }
}
