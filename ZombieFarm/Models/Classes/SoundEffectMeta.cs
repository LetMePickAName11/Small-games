using Microsoft.Xna.Framework.Audio;

namespace ZombieFarm;

public class SoundEffectMeta
{
    public SoundEffectMeta(SoundEffect soundEffect, string name, float volume = 1f, float pitch = 1f, float pan = 1f)
    {
        _soundEffectInstance = soundEffect.CreateInstance();
        _name = name;
        _soundEffectInstance.Volume = volume;
        _soundEffectInstance.Pitch = pitch;
        _soundEffectInstance.Pan = pan;
    }

    public void Play(bool isLooping)
    {
        _soundEffectInstance.IsLooped = isLooping;
        _soundEffectInstance.Play();
    }

    public void Pause()
    {
        _soundEffectInstance.Pause();
    }

    public void Stop()
    {
        _soundEffectInstance.Stop();
    }

    private SoundEffectInstance _soundEffectInstance;
    private string _name;

}
