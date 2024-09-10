namespace ZombieFarm;


public class FarmTile : IClickable
{
    public FarmTile()
    {
        _plantedDateTime = DateTime.Now;
        _plantFullyGrownDateTime = _plantedDateTime;
    }

    public bool OnClick(GameTime gameTime, MouseEventType clickType)
    {
        if (_hasCrop)
        {
            return ClickCrop(gameTime, clickType);
        }

        return ClickEmpty(gameTime, clickType);
    }

    private bool ClickCrop(GameTime gameTime, MouseEventType clickType)
    {
        return false;
    }

    private bool ClickEmpty(GameTime gameTime, MouseEventType clickType)
    {
        return false;
    }


    private bool _hasCrop => _crop != null;
    private DateTime _plantedDateTime;
    private DateTime _plantFullyGrownDateTime;
    private bool _cropHarvestAble => _plantFullyGrownDateTime < DateTime.Now;
    private Crop _crop;
}

public class Crop 
{
    public int GrowthTimeMS;
    public int GoldCost;
    public bool Unlocked;
    public Texture2D Texture;
    public int dropItemIndex;

    public void Harvest()
    {

    }
}