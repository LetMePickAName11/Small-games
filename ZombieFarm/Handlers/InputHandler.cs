namespace ZombieFarm;

public class InputHandler
{
    public InputHandler(GameWindow window)
    {
        _window = window;
        _inputHooks = new();
        _mouseHooks = new();
        _previousMouseState = Mouse.GetState();
    }

    public void Update(GameTime gameTime)
    {
        if (_update == null)
        {
            return;
        }

        _update(gameTime);
    }

    public void AddMouseListen(MouseEventType mouseEventType, MouseHook mouseHook)
    {
        if(_mouseHooks.ContainsKey(mouseEventType))
        {
            _mouseHooks[mouseEventType] += mouseHook;
            _mouseHookCount++;
            return;
        }

        _mouseHooks.Add(mouseEventType, mouseHook);
        _mouseHookCount++;

        if (_mouseHookCount != 1)
        {
            return;
        }

        _update += ListenForMouse;
    }

    public void RemoveMouse(MouseEventType mouseEventType, MouseHook mouseHook)
    {
        _mouseHooks[mouseEventType] -= mouseHook;

        if (_mouseHooks[mouseEventType] == null)
        {
            _mouseHooks.Remove(mouseEventType);
        }

        _mouseHookCount--;

        if(_mouseHookCount != 0)
        {
            return;
        }

        _update -= ListenForMouse;
    }

    public void AddInput(Keys inputName, InputHook inputHook)
    {
        if (_inputHooks.ContainsKey(inputName))
        {
            _inputHooks[inputName] += inputHook;
            _inputHookCount++;
            return;
        }

        _inputHooks.Add(inputName, inputHook);
        _inputHookCount++;

        if (_inputHookCount != 1)
        {
            return;
        }

        _update += ListenForInputs;
    }

    public void RemoveInput(Keys inputName, InputHook inputHook)
    {
        _inputHooks[inputName] -= inputHook;

        if (_inputHooks[inputName] == null)
        {
            _inputHooks.Remove(inputName);
        }

        _inputHookCount--;

        if (_inputHookCount != 0)
        {
            return;
        }

        _update -= ListenForInputs;
    }

    public void ClearAllListeners()
    {
        _update = null;
        _inputHookCount = 0;
        _mouseHookCount = 0;
        _mouseHooks = new();
        _inputHooks = new();
    }

    private void ListenForMouse(GameTime gameTime)
    {
        var currentMouseState = Mouse.GetState();

        if (currentMouseState.LeftButton == ButtonState.Pressed && _mouseHooks.ContainsKey(MouseEventType.LeftClickDown))
        {
            _mouseHooks[MouseEventType.LeftClickDown](gameTime, currentMouseState);
        }
        if (currentMouseState.LeftButton == ButtonState.Released && _previousMouseState.LeftButton == ButtonState.Pressed && _mouseHooks.ContainsKey(MouseEventType.LeftClick))
        {
            _mouseHooks[MouseEventType.LeftClick](gameTime, currentMouseState);
        }
        if (currentMouseState.RightButton == ButtonState.Pressed && _mouseHooks.ContainsKey(MouseEventType.RightClickDown))
        {
            _mouseHooks[MouseEventType.RightClickDown](gameTime, currentMouseState);
        }
        if (currentMouseState.RightButton == ButtonState.Released && _previousMouseState.RightButton == ButtonState.Pressed && _mouseHooks.ContainsKey(MouseEventType.RightClick))
        {
            _mouseHooks[MouseEventType.RightClick](gameTime, currentMouseState);
        }

        if (currentMouseState.ScrollWheelValue > _previousMouseState.ScrollWheelValue && _mouseHooks.ContainsKey(MouseEventType.ScrollUp))
        {
            _mouseHooks[MouseEventType.ScrollUp](gameTime, currentMouseState);
        }
        else if (currentMouseState.ScrollWheelValue < _previousMouseState.ScrollWheelValue && _mouseHooks.ContainsKey(MouseEventType.ScrollDown))
        {
            _mouseHooks[MouseEventType.ScrollDown](gameTime, currentMouseState);
        }

        _previousMouseState = currentMouseState;
    }

    private void ListenForInputs(GameTime gameTime)
    {
        foreach (var item in _inputHooks.Keys)
        {
            if (!Keyboard.GetState().IsKeyDown(item))
            {
                continue;
            }

            _inputHooks[item](gameTime);
        }
    }

    private readonly GameWindow _window;
    private UpdateDelegate _update;
    private Dictionary<MouseEventType, MouseHook> _mouseHooks;
    private Dictionary<Keys, InputHook> _inputHooks;
    private int _mouseHookCount = 0;
    private int _inputHookCount = 0;

    private MouseState _previousMouseState;
}