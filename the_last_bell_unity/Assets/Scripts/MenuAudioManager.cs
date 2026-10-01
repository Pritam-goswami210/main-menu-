using UnityEngine;

/// <summary>
/// Audio manager handling the atmospheric horror soundscape and UI sounds for 'The Last Bell'.
/// </summary>
public class MenuAudioManager : MonoBehaviour
{
    [Header("Audio Sources")]
    [SerializeField] private AudioSource ambienceSource;
    [SerializeField] private AudioSource sfxSource;

    [Header("Audio Clips")]
    [Tooltip("Low pitch eerie wind / classroom drone ambience")]
    [SerializeField] private AudioClip ambienceClip;

    [Tooltip("Hollow distant school bell chime")]
    [SerializeField] private AudioClip bellChimeClip;

    [Tooltip("Subtle paper / scratch sound when button is highlighted")]
    [SerializeField] private AudioClip hoverClip;

    [Tooltip("Heavy mechanical strike or bloody thud when button is tapped")]
    [SerializeField] private AudioClip clickClip;

    [Tooltip("Whoosh sound when a modal/dialog opens or closes")]
    [SerializeField] private AudioClip modalTransitionClip;

    private void Start()
    {
        // Start ambience loop
        if (ambienceSource != null && ambienceClip != null)
        {
            ambienceSource.clip = ambienceClip;
            ambienceSource.loop = true;
            ambienceSource.Play();
        }
    }

    public void PlayHoverSound()
    {
        if (sfxSource != null && hoverClip != null)
        {
            sfxSource.pitch = Random.Range(0.95f, 1.05f);
            sfxSource.PlayOneShot(hoverClip, 0.6f);
        }
    }

    public void PlayClickSound()
    {
        if (sfxSource != null && clickClip != null)
        {
            sfxSource.pitch = Random.Range(0.92f, 1.02f);
            sfxSource.PlayOneShot(clickClip, 0.9f);
        }
    }

    public void PlayBellChime()
    {
        if (sfxSource != null && bellChimeClip != null)
        {
            sfxSource.pitch = 1.0f;
            sfxSource.PlayOneShot(bellChimeClip, 1.0f);
        }
    }

    public void PlayModalTransition()
    {
        if (sfxSource != null && modalTransitionClip != null)
        {
            sfxSource.pitch = Random.Range(0.95f, 1.05f);
            sfxSource.PlayOneShot(modalTransitionClip, 0.7f);
        }
    }
}
