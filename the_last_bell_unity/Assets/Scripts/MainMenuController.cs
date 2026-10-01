using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
#if TMP_PRESENT || UNITY_2019_1_OR_NEWER
using TMPro;
#endif

/// <summary>
/// Controller for 'The Last Bell' Mobile Game Main Menu.
/// Manages menu item selection, panels, audio cues, and mobile transitions.
/// </summary>
public class MainMenuController : MonoBehaviour
{
    [Header("Menu Buttons")]
    [SerializeField] private Button newGameButton;
    [SerializeField] private Button continueButton;
    [SerializeField] private Button settingsButton;
    [SerializeField] private Button quitButton;

    [Header("Active Indicator (Brush Banner)")]
    [Tooltip("The red grunge brush stroke image that snaps behind the active/selected button")]
    [SerializeField] private RectTransform activeBrushBanner;

    [Header("Modals & Sub-Panels")]
    [SerializeField] private GameObject difficultyPanel;
    [SerializeField] private GameObject continueSlotsPanel;
    [SerializeField] private GameObject settingsPanel;
    [SerializeField] private GameObject quitConfirmPanel;

    [Header("Scene Loading")]
    [Tooltip("The name or index of the first playable game scene")]
    [SerializeField] private string firstGameSceneName = "GameScene_Prologue";
    [SerializeField] private CanvasGroup screenFader;
    [SerializeField] private float fadeDuration = 1.2f;

    [Header("Audio")]
    [SerializeField] private MenuAudioManager audioManager;

    private Button _currentSelectedButton;

    private void Awake()
    {
        // Enforce landscape orientation for mobile horror experience
        Screen.orientation = ScreenOrientation.AutoRotation;
        Screen.autorotateToPortrait = false;
        Screen.autorotateToPortraitUpsideDown = false;
        Screen.autorotateToLandscapeLeft = true;
        Screen.autorotateToLandscapeRight = true;

        // Prevent mobile display sleep during the menu
        Screen.sleepTimeout = SleepTimeout.NeverSleep;
    }

    private void Start()
    {
        // Hook button listeners
        if (newGameButton != null)
            newGameButton.onClick.AddListener(OnNewGameClicked);

        if (continueButton != null)
            continueButton.onClick.AddListener(OnContinueClicked);

        if (settingsButton != null)
            settingsButton.onClick.AddListener(OnSettingsClicked);

        if (quitButton != null)
            quitButton.onClick.AddListener(OnQuitClicked);

        // Check if a save game exists to enable/disable Continue
        CheckSaveGameAvailability();

        // Default active button is NEW GAME
        if (newGameButton != null)
        {
            SetActiveButton(newGameButton);
        }

        // Close all subpanels on start
        CloseAllPanels();

        // Fade in from black on start
        if (screenFader != null)
        {
            StartCoroutine(FadeFromBlack());
        }
    }

    private void Update()
    {
        // Handle Android hardware 'Back' button
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            HandleBackInput();
        }
    }

    /// <summary>
    /// Checks PlayerPrefs or file storage to see if Continue should be clickable.
    /// </summary>
    private void CheckSaveGameAvailability()
    {
        bool hasSave = PlayerPrefs.HasKey("TheLastBell_HasSave") && PlayerPrefs.GetInt("TheLastBell_HasSave") == 1;
        if (continueButton != null)
        {
            continueButton.interactable = hasSave;
            // Optionally fade the text color if disabled
            var btnText = continueButton.GetComponentInChildren<Text>();
            if (btnText != null)
            {
                btnText.color = hasSave ? Color.white : new Color(0.6f, 0.6f, 0.6f, 0.4f);
            }
        }
    }

    /// <summary>
    /// Snaps the red brush banner behind the targeted button and plays sound.
    /// </summary>
    public void SetActiveButton(Button targetButton)
    {
        if (targetButton == null) return;
        _currentSelectedButton = targetButton;

        if (activeBrushBanner != null)
        {
            activeBrushBanner.SetParent(targetButton.transform, false);
            activeBrushBanner.SetAsFirstSibling(); // Place behind text
            activeBrushBanner.anchoredPosition = Vector2.zero;
            activeBrushBanner.gameObject.SetActive(true);
        }

        if (audioManager != null)
            audioManager.PlayHoverSound();
    }

    public void OnNewGameClicked()
    {
        SetActiveButton(newGameButton);
        if (audioManager != null) audioManager.PlayClickSound();

        // Trigger mobile haptic feedback if enabled
        TriggerHaptic();

        if (difficultyPanel != null)
        {
            difficultyPanel.SetActive(true);
        }
        else
        {
            StartCoroutine(LoadGameSequence("Normal"));
        }
    }

    public void OnContinueClicked()
    {
        if (!continueButton.interactable) return;

        SetActiveButton(continueButton);
        if (audioManager != null) audioManager.PlayClickSound();
        TriggerHaptic();

        if (continueSlotsPanel != null)
        {
            continueSlotsPanel.SetActive(true);
        }
        else
        {
            // Resume latest save directly
            string lastScene = PlayerPrefs.GetString("TheLastBell_LastScene", firstGameSceneName);
            StartCoroutine(LoadGameSequence(lastScene));
        }
    }

    public void OnSettingsClicked()
    {
        SetActiveButton(settingsButton);
        if (audioManager != null) audioManager.PlayClickSound();
        TriggerHaptic();

        if (settingsPanel != null)
        {
            settingsPanel.SetActive(true);
        }
    }

    public void OnQuitClicked()
    {
        SetActiveButton(quitButton);
        if (audioManager != null) audioManager.PlayClickSound();
        TriggerHaptic();

        if (quitConfirmPanel != null)
        {
            quitConfirmPanel.SetActive(true);
        }
        else
        {
            ConfirmQuit();
        }
    }

    public void ConfirmQuit()
    {
        if (audioManager != null) audioManager.PlayClickSound();

#if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
#else
        Application.Quit();
#endif
    }

    public void CloseAllPanels()
    {
        if (difficultyPanel != null) difficultyPanel.SetActive(false);
        if (continueSlotsPanel != null) continueSlotsPanel.SetActive(false);
        if (settingsPanel != null) settingsPanel.SetActive(false);
        if (quitConfirmPanel != null) quitConfirmPanel.SetActive(false);
    }

    public void HandleBackInput()
    {
        // If any panel is open, close it; otherwise ask to quit
        if (difficultyPanel != null && difficultyPanel.activeSelf)
        {
            difficultyPanel.SetActive(false);
        }
        else if (continueSlotsPanel != null && continueSlotsPanel.activeSelf)
        {
            continueSlotsPanel.SetActive(false);
        }
        else if (settingsPanel != null && settingsPanel.activeSelf)
        {
            settingsPanel.SetActive(false);
        }
        else if (quitConfirmPanel != null && quitConfirmPanel.activeSelf)
        {
            quitConfirmPanel.SetActive(false);
        }
        else
        {
            OnQuitClicked();
        }
    }

    public void StartGameWithDifficulty(string difficulty)
    {
        PlayerPrefs.SetString("TheLastBell_Difficulty", difficulty);
        PlayerPrefs.SetInt("TheLastBell_HasSave", 1);
        PlayerPrefs.Save();

        StartCoroutine(LoadGameSequence(firstGameSceneName));
    }

    private IEnumerator LoadGameSequence(string sceneName)
    {
        if (audioManager != null)
            audioManager.PlayBellChime();

        // Fade to black
        if (screenFader != null)
        {
            screenFader.gameObject.SetActive(true);
            float elapsed = 0f;
            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                screenFader.alpha = Mathf.Clamp01(elapsed / fadeDuration);
                yield return null;
            }
        }
        else
        {
            yield return new WaitForSeconds(0.5f);
        }

        SceneManager.LoadScene(sceneName);
    }

    private IEnumerator FadeFromBlack()
    {
        screenFader.gameObject.SetActive(true);
        screenFader.alpha = 1f;
        float elapsed = 0f;
        while (elapsed < fadeDuration)
        {
            elapsed += Time.deltaTime;
            screenFader.alpha = 1f - Mathf.Clamp01(elapsed / fadeDuration);
            yield return null;
        }
        screenFader.gameObject.SetActive(false);
    }

    private void TriggerHaptic()
    {
        bool hapticsOn = PlayerPrefs.GetInt("TheLastBell_Haptics", 1) == 1;
        if (hapticsOn)
        {
#if UNITY_ANDROID || UNITY_IOS
            Handheld.Vibrate();
#endif
        }
    }
}
