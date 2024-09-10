namespace ZombieFarm;

public class Taliban
{
    private Texture2D _texture;
    private Rectangle _rect;
    private Vector2 _velocity;
    private Vector2 _position;
    private Vector2 _target;
    private string _goal;
    public Taliban(TextureHandler textureHandler, Vector2 position)
    {
        _texture = textureHandler.GetTexture2D("Gonk");
        _velocity = new(0, 0);
        _position = position;
        _rect = new((int)position.X,(int)position.Y, 100, 100);
    }

    public void MindControl(Vector2 target)
    {
        _target = target;
    }

    public void Update(GameTime gameTime)
    {
        if(Vector2.Distance(_position, _target) < 0.1f){
            _velocity = Vector2.Zero;
        }
        else{
            _velocity = new(0.01f, 0.01f);
        }

        _position.X += _velocity.X;
        _position.Y += _velocity.Y;

        _rect.X = (int)_position.X;
        _rect.Y = (int)_position.Y;
    }

    public void Draw(SpriteBatch spriteBatch)
    {
        spriteBatch.Draw(_texture, _rect, Color.White);
    }
}