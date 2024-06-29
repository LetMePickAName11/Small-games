using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;

public delegate void UpdateDelegate(GameTime gameTime);
public delegate void MouseHook(GameTime gameTime, Point position, MouseState mouseState);
public delegate void InputHook(GameTime gameTime);