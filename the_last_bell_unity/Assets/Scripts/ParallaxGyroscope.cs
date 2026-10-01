using UnityEngine;

/// <summary>
/// Creates an immersive 2.5D parallax effect by reading the mobile gyroscope / accelerometer,
/// or mouse cursor/breathing motion in the Unity Editor.
/// Attach to individual UI elements or the Background image to give depth.
/// </summary>
public class ParallaxGyroscope : MonoBehaviour
{
    [Header("Parallax Depth Settings")]
    [Tooltip("Multiplier for parallax offset. Positive moves with tilt, negative moves against.")]
    [SerializeField] private Vector2 parallaxIntensity = new Vector2(25f, 15f);

    [Tooltip("Smoothing speed for camera/layer motion")]
    [SerializeField] private float smoothSpeed = 4f;

    [Header("Horror Breathing Drift")]
    [Tooltip("Adds a faint breathing sway even when phone is held perfectly still")]
    [SerializeField] private bool enableBreathingDrift = true;
    [SerializeField] private float breathingFrequency = 0.5f;
    [SerializeField] private float breathingAmplitude = 6f;

    private RectTransform _rectTransform;
    private Vector2 _initialAnchoredPos;
    private Vector2 _targetOffset;
    private bool _hasGyro;

    private void Awake()
    {
        _rectTransform = GetComponent<RectTransform>();
        if (_rectTransform != null)
        {
            _initialAnchoredPos = _rectTransform.anchoredPosition;
        }

        // Initialize gyroscope if supported
        _hasGyro = SystemInfo.supportsGyroscope;
        if (_hasGyro)
        {
            Input.gyro.enabled = true;
        }
    }

    private void Update()
    {
        if (_rectTransform == null) return;

        Vector2 inputTilt = Vector2.zero;

#if UNITY_EDITOR || UNITY_STANDALONE
        // In editor/desktop: Use normalized mouse position (-1 to 1)
        Vector2 mouseNorm = new Vector2(
            (Input.mousePosition.x / Screen.width) * 2f - 1f,
            (Input.mousePosition.y / Screen.height) * 2f - 1f
        );
        inputTilt = mouseNorm;
#else
        // On Mobile: Use gyroscope gravity vector or accelerometer
        if (_hasGyro)
        {
            // Gyro gravity vector (x = roll/tilt, y = pitch)
            inputTilt.x = Mathf.Clamp(Input.gyro.gravity.x * 2.0f, -1f, 1f);
            inputTilt.y = Mathf.Clamp(Input.gyro.gravity.y * 2.0f, -1f, 1f);
        }
        else
        {
            // Fallback to accelerometer
            inputTilt.x = Mathf.Clamp(Input.acceleration.x * 2.0f, -1f, 1f);
            inputTilt.y = Mathf.Clamp(Input.acceleration.y * 2.0f, -1f, 1f);
        }
#endif

        // Calculate target offset
        _targetOffset = new Vector2(
            inputTilt.x * parallaxIntensity.x,
            inputTilt.y * parallaxIntensity.y
        );

        // Add subtle horror breathing sway
        if (enableBreathingDrift)
        {
            float breathX = Mathf.Sin(Time.time * breathingFrequency) * breathingAmplitude;
            float breathY = Mathf.Cos(Time.time * breathingFrequency * 0.7f) * (breathingAmplitude * 0.6f);
            _targetOffset += new Vector2(breathX, breathY);
        }

        // Smoothly interpolate anchored position
        Vector2 desiredPos = _initialAnchoredPos + _targetOffset;
        _rectTransform.anchoredPosition = Vector2.Lerp(
            _rectTransform.anchoredPosition, 
            desiredPos, 
            Time.deltaTime * smoothSpeed
        );
    }
}
