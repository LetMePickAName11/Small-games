using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
namespace ZombieFarm;

public class InputHandler
{
    public InputHandler(GameWindow window)
    {
        _window = window;
        _inputHooks = new();
    }

    public void Update(GameTime gameTime)
    {
        if (_update == null)
        {
            return;
        }

        _update(gameTime);
    }

    public void AddMouseListen(MouseHook mouseHook)
    {
        _mouseHook += mouseHook;
        _mouseHookCount++;

        if (_mouseHookCount != 1)
        {
            return;
        }

        _update += ListenForMouse;
    }

    public void RemoveMouse(MouseHook mouseHook)
    {
        _mouseHook -= mouseHook;
        _mouseHookCount--;

        if (_mouseHookCount != 0)
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
        _mouseHook = null;
        _inputHooks = new();
    }

    private void ListenForMouse(GameTime gameTime)
    {
        var mouseState = Mouse.GetState();
        _mouseHook(gameTime, new Point(_window.Position.X + mouseState.X, _window.Position.Y + mouseState.Y), mouseState);
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
    private MouseHook _mouseHook;
    private UpdateDelegate _update;
    private Dictionary<Keys, InputHook> _inputHooks;
    private int _mouseHookCount = 0;
    private int _inputHookCount = 0;
}