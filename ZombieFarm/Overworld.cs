using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
namespace ZombieFarm;

public class OverWorld
{
    public OverWorld(InputHandler inputHandler)
    {
        _inputHandler = inputHandler;
    }

    public void LoadContent()
    {
        
    }

    public void Update(GameTime gameTime)
    {

    }

    public void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {

    }

    private InputHandler _inputHandler;
    private List<Zombie> _zombies;
    private Tilemap _tilemap;
    private Player _player;
    private AudioHandler _audioHandler;
}
