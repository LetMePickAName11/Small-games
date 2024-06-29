using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
namespace ZombieFarm;

public class Tilemap
{
    private List<Tile[,]> _loadedChunks;

    private int _currentChunkId;
    private int _tileMapId;

    public Tilemap(int tileMapid)
    {
        LoadTileMap(tileMapid);
    }

    public void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        foreach (Tile tile in _loadedChunks[_currentChunkId])
        {
            spriteBatch.Draw(tile.Texture, tile.Position, tile.Color);
        }
    }

    public void Update(GameTime gameTime, Vector2 position)
    {
        foreach (Tile tile in _loadedChunks[_currentChunkId])
        {
            if (tile.Texture.Bounds.Contains(position))
            {
                return;
            }
        }
    }

    public void LoadChunk()
    {
        _currentChunkId = new();
    }

    public void LoadTileMap(int tileMapid)
    {
        this._tileMapId = tileMapid;
        this._currentChunkId = 0;
        LoadChunk();
    }

    public static class TimeMapId
    {
        public const int OverWorld = 1;
    }
}
