using UnityEngine;

/// <summary>
/// Safe Area Fitter for modern mobile displays (notches, punch-holes, dynamic island, rounded corners).
/// Attach this component to a full-screen RectTransform (the UI Container holding the buttons and title).
/// The background image can remain on the parent Canvas to bleed edge-to-edge.
/// </summary>
[RequireComponent(typeof(RectTransform))]
public class SafeAreaFitter : MonoBehaviour
{
    private RectTransform _rectTransform;
    private Rect _lastSafeArea = Rect.zero;
    private Vector2Int _lastScreenSize = Vector2Int.zero;
    private ScreenOrientation _lastOrientation = ScreenOrientation.LandscapeLeft;

    [Tooltip("If true, safe area will only apply to horizontal borders (left/right notch), ideal for landscape games.")]
    [SerializeField] private bool horizontalOnly = true;

    private void Awake()
    {
        _rectTransform = GetComponent<RectTransform>();
        ApplySafeArea();
    }

    private void Update()
    {
        // Detect orientation changes or window resize (e.g. split screen or foldable devices)
        if (_lastSafeArea != Screen.safeArea || 
            _lastScreenSize.x != Screen.width || 
            _lastScreenSize.y != Screen.height || 
            _lastOrientation != Screen.orientation)
        {
            ApplySafeArea();
        }
    }

    public void ApplySafeArea()
    {
        if (_rectTransform == null)
            _rectTransform = GetComponent<RectTransform>();

        Rect safeArea = Screen.safeArea;
        _lastSafeArea = safeArea;
        _lastScreenSize = new Vector2Int(Screen.width, Screen.height);
        _lastOrientation = Screen.orientation;

        // Convert safe area rectangle from absolute screen space to normalized anchor space (0 to 1)
        Vector2 anchorMin = safeArea.position;
        Vector2 anchorMax = safeArea.position + safeArea.size;

        anchorMin.x /= Screen.width;
        anchorMax.x /= Screen.width;

        if (horizontalOnly)
        {
            anchorMin.y = 0f;
            anchorMax.y = 1f;
        }
        else
        {
            anchorMin.y /= Screen.height;
            anchorMax.y /= Screen.height;
        }

        _rectTransform.anchorMin = anchorMin;
        _rectTransform.anchorMax = anchorMax;
        _rectTransform.offsetMin = Vector2.zero;
        _rectTransform.offsetMax = Vector2.zero;
    }
}
