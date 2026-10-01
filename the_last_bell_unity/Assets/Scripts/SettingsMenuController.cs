using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Audio;

/// <summary>
/// Controls the Settings Menu for 'The Last Bell' Mobile Game.
/// Handles audio levels, mobile graphics presets, haptic feedback toggles, and screen frame rate.
/// </summary>
public class SettingsMenuController : MonoBehaviour
{
    [Header("Audio Settings")]
    [SerializeField] private AudioMixer audioMixer;
    [SerializeField] private Slider masterVolumeSlider;
    [SerializeField] private Slider musicVolumeSlider;
    [SerializeField] private Slider sfxVolumeSlider;

    [Header("Graphics Settings")]
    [SerializeField] private Dropdown qualityDropdown;
    [SerializeField] private Toggle target60FpsToggle;
    [SerializeField] private Toggle dustParticlesToggle;
    [SerializeField] private ParticleSystem dustParticleSystem;

    [Header("Controls & Mobile")]
    [SerializeField] private Toggle hapticsToggle;
    [SerializeField] private Slider sensitivitySlider;

    [Header("Close / Back")]
    [SerializeField] private Button closeButton;
    [SerializeField] private Button resetDefaultsButton;

    private const string PREF_MASTER_VOL = "TLB_MasterVol";
    private const string PREF_MUSIC_VOL = "TLB_MusicVol";
    private const string PREF_SFX_VOL = "TLB_SfxVol";
    private const string PREF_QUALITY = "TLB_Quality";
    private const string PREF_60FPS = "TLB_Target60Fps";
    private const string PREF_DUST = "TLB_DustParticles";
    private const string PREF_HAPTICS = "TheLastBell_Haptics";
    private const string PREF_SENSITIVITY = "TLB_Sensitivity";

    private void Awake()
    {
        // Hook UI event listeners
        if (masterVolumeSlider != null)
            masterVolumeSlider.onValueChanged.AddListener(SetMasterVolume);

        if (musicVolumeSlider != null)
            musicVolumeSlider.onValueChanged.AddListener(SetMusicVolume);

        if (sfxVolumeSlider != null)
            sfxVolumeSlider.onValueChanged.AddListener(SetSfxVolume);

        if (qualityDropdown != null)
            qualityDropdown.onValueChanged.AddListener(SetQualityLevel);

        if (target60FpsToggle != null)
            target60FpsToggle.onValueChanged.AddListener(SetTarget60Fps);

        if (dustParticlesToggle != null)
            dustParticlesToggle.onValueChanged.AddListener(SetDustParticlesEnabled);

        if (hapticsToggle != null)
            hapticsToggle.onValueChanged.AddListener(SetHapticsEnabled);

        if (sensitivitySlider != null)
            sensitivitySlider.onValueChanged.AddListener(SetSensitivity);

        if (closeButton != null)
            closeButton.onClick.AddListener(CloseSettings);

        if (resetDefaultsButton != null)
            resetDefaultsButton.onClick.AddListener(ResetToDefaults);
    }

    private void Start()
    {
        LoadSettings();
    }

    public void LoadSettings()
    {
        // Audio
        float masterVol = PlayerPrefs.GetFloat(PREF_MASTER_VOL, 0.85f);
        float musicVol = PlayerPrefs.GetFloat(PREF_MUSIC_VOL, 0.75f);
        float sfxVol = PlayerPrefs.GetFloat(PREF_SFX_VOL, 0.9f);

        if (masterVolumeSlider != null) masterVolumeSlider.value = masterVol;
        if (musicVolumeSlider != null) musicVolumeSlider.value = musicVol;
        if (sfxVolumeSlider != null) sfxVolumeSlider.value = sfxVol;

        ApplyVolume("MasterVol", masterVol);
        ApplyVolume("MusicVol", musicVol);
        ApplyVolume("SfxVol", sfxVol);

        // Graphics
        int quality = PlayerPrefs.GetInt(PREF_QUALITY, QualitySettings.GetQualityLevel());
        if (qualityDropdown != null) qualityDropdown.value = quality;
        QualitySettings.SetQualityLevel(quality, true);

        bool target60 = PlayerPrefs.GetInt(PREF_60FPS, 1) == 1;
        if (target60FpsToggle != null) target60FpsToggle.isOn = target60;
        Application.targetFrameRate = target60 ? 60 : 30;

        bool dustOn = PlayerPrefs.GetInt(PREF_DUST, 1) == 1;
        if (dustParticlesToggle != null) dustParticlesToggle.isOn = dustOn;
        if (dustParticleSystem != null)
        {
            if (dustOn && !dustParticleSystem.isPlaying) dustParticleSystem.Play();
            else if (!dustOn && dustParticleSystem.isPlaying) dustParticleSystem.Stop();
        }

        // Controls
        bool haptics = PlayerPrefs.GetInt(PREF_HAPTICS, 1) == 1;
        if (hapticsToggle != null) hapticsToggle.isOn = haptics;

        float sensitivity = PlayerPrefs.GetFloat(PREF_SENSITIVITY, 1.0f);
        if (sensitivitySlider != null) sensitivitySlider.value = sensitivity;
    }

    public void SetMasterVolume(float value)
    {
        PlayerPrefs.SetFloat(PREF_MASTER_VOL, value);
        ApplyVolume("MasterVol", value);
    }

    public void SetMusicVolume(float value)
    {
        PlayerPrefs.SetFloat(PREF_MUSIC_VOL, value);
        ApplyVolume("MusicVol", value);
    }

    public void SetSfxVolume(float value)
    {
        PlayerPrefs.SetFloat(PREF_SFX_VOL, value);
        ApplyVolume("SfxVol", value);
    }

    private void ApplyVolume(string paramName, float linearValue)
    {
        if (audioMixer != null)
        {
            // Decibel conversion with lower floor limit
            float db = (linearValue > 0.0001f) ? Mathf.Log10(linearValue) * 20f : -80f;
            audioMixer.SetFloat(paramName, db);
        }
        else
        {
            // Fallback: scale AudioListener volume for master
            if (paramName == "MasterVol")
                AudioListener.volume = linearValue;
        }
    }

    public void SetQualityLevel(int index)
    {
        PlayerPrefs.SetInt(PREF_QUALITY, index);
        QualitySettings.SetQualityLevel(index, true);
    }

    public void SetTarget60Fps(bool is60Fps)
    {
        PlayerPrefs.SetInt(PREF_60FPS, is60Fps ? 1 : 0);
        Application.targetFrameRate = is60Fps ? 60 : 30;
    }

    public void SetDustParticlesEnabled(bool enabled)
    {
        PlayerPrefs.SetInt(PREF_DUST, enabled ? 1 : 0);
        if (dustParticleSystem != null)
        {
            if (enabled) dustParticleSystem.Play();
            else dustParticleSystem.Stop();
        }
    }

    public void SetHapticsEnabled(bool enabled)
    {
        PlayerPrefs.SetInt(PREF_HAPTICS, enabled ? 1 : 0);
    }

    public void SetSensitivity(float value)
    {
        PlayerPrefs.SetFloat(PREF_SENSITIVITY, value);
    }

    public void ResetToDefaults()
    {
        SetMasterVolume(0.85f);
        SetMusicVolume(0.75f);
        SetSfxVolume(0.9f);
        SetTarget60Fps(true);
        SetDustParticlesEnabled(true);
        SetHapticsEnabled(true);
        SetSensitivity(1.0f);
        LoadSettings();
    }

    public void CloseSettings()
    {
        PlayerPrefs.Save();
        gameObject.SetActive(false);
    }
}
