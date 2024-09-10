namespace ZombieFarm;

public class Tile 
{
	public Texture2D Texture;
	public Rectangle Position;
	public Color Color;
	public bool HasCollision;
	public IClickable clickable;
}


public interface IClickable
{
	public bool OnClick(GameTime gameTime, MouseEventType clickType);
}

