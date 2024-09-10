namespace ZombieFarm;

public class UserInterfaceHanlder
{

    public UserInterfaceHanlder()
    {
        _activePopups = new();
    }

    public void ShowElement()
    {

    }

    public void HideElement()
    {

    }

    public void RegisterElement(string name, UserintefaceElement popup) => _uiElements.Add(name, popup);
    public void UnRegisterElement(string name) => _uiElements.Remove(name);

    public void Update(GameTime gameTime)
    {

    }

    public void Draw(SpriteBatch spriteBatch)
    {
        foreach (UserintefaceElement item in _activePopups.Reverse())
        {
            item.Draw(spriteBatch);
        }
    }

    private Stack<UserintefaceElement> _activePopups;
    private Dictionary<string, UserintefaceElement> _uiElements;
}

public class UserintefaceElement
{
    public UserintefaceElement(List<Func<bool>> optionCallbacks, List<string> optionTexts)
    {
        if (optionCallbacks.Count != optionTexts.Count)
        {
            throw new Exception("Fucked up brother");
        }

        _optionCallbacks = optionCallbacks;
        _optionTexts = optionTexts;
    }

    public void Open(Rectangle position) => _position = position;
    public bool OnClick(GameTime gameTime, MouseEventType clickType, Vector2 position)
    {
        if (clickType != MouseEventType.LeftClick)
        {
            return false;
        }

        // Find which option has been selected based on the click on the background texture



        return false;
    }

    public void Draw(SpriteBatch spriteBatch)
    {
        spriteBatch.Draw(_background, _position, Color.White);
        foreach (var item in _optionTexts)
        {
            //spriteBatch.DrawString(new SpriteFont(null, null, null, null, null, null, null, null), item, new Vector2(100, 100), Color.White);
        }
    }

    private List<Func<bool>> _optionCallbacks;
    private List<string> _optionTexts;
    private Rectangle _position;
    private Texture2D _background;
    private SpriteFont _spriteFont;
}