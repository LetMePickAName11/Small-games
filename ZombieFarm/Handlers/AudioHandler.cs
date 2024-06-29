using System.Collections.Generic;
using Microsoft.Xna.Framework.Audio;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.Media;

namespace ZombieFarm;

public class AudioHandler
{
    public AudioHandler(ContentManager contentManager)
    {
        _contentManager = contentManager;

    }

    public void LoadContent(string name)
    {
        _songs = new();
        _soundEffects = new();
    }

    public void PlaySong(string name, bool onRepeat)
    {
        _songs[""].
    }

    public void PlayEffect(string name, bool isLooping)
    {
        _soundEffects[name].Play(isLooping);
    }

    public void UpdateSettings()
    {

    }

    private Song _currentSong;
    private Dictionary<string, Song> _songs;
    private Dictionary<string, SoundEffectMeta> _soundEffects;
    private ContentManager _contentManager;
}
