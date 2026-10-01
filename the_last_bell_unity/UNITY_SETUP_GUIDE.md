# Unity Implementation Guide: "The Last Bell" Mobile Main Menu

This guide walks you through building the exact horror main menu shown in the design inside **Unity** (compatible with Unity 2021.3 LTS, 2022.3 LTS, Unity 6, and newer).

---

## 1. Project & Asset Setup

### A. Folder Structure in Unity
Copy the `Assets/` directory from this project directly into your Unity project's `Assets` folder:
```
Assets/
├── Sprites/
│   ├── Classroom_Background.jpg   (The abandoned classroom background)
│   ├── Brush_Banner_Red.svg       (Crimson grunge brush highlight for active button)
│   └── Title_Logo.svg             (Vector title with bloody dripping 'BELL')
├── Scripts/
│   ├── MainMenuController.cs      (Core menu logic, scene loads, modals)
│   ├── SettingsMenuController.cs  (Volume, mobile graphics presets, haptics)
│   ├── SafeAreaFitter.cs          (Crucial mobile notch & rounded corners handler)
│   ├── ParallaxGyroscope.cs       (Mobile phone tilt 3D depth effect)
│   ├── MenuAudioManager.cs       (Horror audio loops & tactile clicks)
│   └── SaveSlotManager.cs         (Checkpoint & save slot handling)
```

### B. Texture Import Settings in Unity
1. Select `Classroom_Background.jpg` in the Project window:
   - **Texture Type**: `Sprite (2D and UI)`
   - **Sprite Mode**: `Single`
   - **Wrap Mode**: `Clamp`
   - **Max Size**: `2048` or `4096`
   - Click **Apply**.
2. Select `Brush_Banner_Red.svg` (or rasterized PNG):
   - **Texture Type**: `Sprite (2D and UI)`
   - **Mesh Type**: `Full Rect`
   - Click **Apply**.

---

## 2. Canvas & Mobile Screen Configuration

1. In the Hierarchy, create a **Canvas** (`UI > Canvas`). Name it `MainMenuCanvas`.
2. Configure the **Canvas Scaler**:
   - **UI Scale Mode**: `Scale With Screen Size`
   - **Reference Resolution**: `1920` x `1080` (or `2400` x `1080` for ultra-wide modern mobile screens)
   - **Screen Match Mode**: `Match Width Or Height`
   - **Match**: `0.5`
3. Add a **Graphic Raycaster** component (default).

---

## 3. UI Hierarchy Layout

Structure your canvas hierarchy as follows:

```
MainMenuCanvas (Canvas, CanvasScaler, GraphicRaycaster)
├── Background (Image: Classroom_Background.jpg, Anchors: Stretch-Stretch, ParallaxGyroscope)
├── VolumetricRays (Particle System or semi-transparent beam sprite on the right)
├── DustParticleSystem (Particle System - floating slow motes in sunbeams)
├── VignetteOverlay (Image with radial dark gradient, color #000000, alpha 0.45)
│
└── SafeAreaContainer (RectTransform: Stretch-Stretch, SafeAreaFitter component)
    │
    ├── TitleGroup (RectTransform: Top-Left, Anchor Min (0.05, 0.65), Max (0.45, 0.95))
    │   ├── TitleLogo (Image: Title_Logo.svg, Preserve Aspect: true)
    │   └── OR TextMeshPro text setup (see Section 4)
    │
    ├── MenuButtonsGroup (VerticalLayoutGroup: Anchor Min (0.06, 0.15), Max (0.35, 0.58))
    │   │
    │   ├── ActiveBrushBanner (Image: Brush_Banner_Red, Sibling 0, snaps behind selected button)
    │   │
    │   ├── Button_NewGame (Button: Text = "NEW GAME")
    │   ├── Button_Continue (Button: Text = "CONTINUE")
    │   ├── Button_Settings (Button: Text = "SETTINGS")
    │   └── Button_Quit (Button: Text = "QUIT")
    │
    └── Modals/
        ├── Panel_Settings (SettingsMenuController component)
        ├── Panel_DifficultySelect (Story / Normal / Nightmare)
        ├── Panel_SaveSlots (SaveSlotManager component)
        └── Panel_QuitConfirm ("Abandon the classroom?")
```

---

## 4. Typography & Styling (TextMeshPro)

For authentic horror classroom typography:
- **Font Recommendations**:
  - *Cinzel* or *Cormorant Garamond* (weathered serif)
  - *Nosifer* or *Creepster* (grunge/distressed horror)
  - Standard bold serif with tracking/character spacing: `+12`
- **Button Text Styling**:
  - **Normal Color**: `#D1CCC0` (faded chalk/parchment white)
  - **Highlighted/Selected Color**: `#FFFFFF` (crisp chalk white)
  - **Font Size**: `36` - `42` pt
  - **Alignment**: Left-aligned, uppercase.
  - **Selected State**: The `ActiveBrushBanner` (crimson red grunge banner) automatically parents to the active button via `MainMenuController.SetActiveButton()`.

---

## 5. Mobile Notches & Safe Area (`SafeAreaFitter.cs`)

Modern phones feature camera cutouts, dynamic islands, and curved bezels.
1. Place the `SafeAreaFitter.cs` script on the `SafeAreaContainer` GameObject.
2. Check `horizontalOnly = true` so the left/right notch padding is automatically respected.
3. The `Background` remains full-bleed edge-to-edge outside the safe area container so there are no black bars!

---

## 6. Gyroscope Parallax (`ParallaxGyroscope.cs`)

To make the menu feel alive when holding the phone:
1. Attach `ParallaxGyroscope.cs` to the `Background` RectTransform.
2. Set:
   - **Parallax Intensity**: `X: 30, Y: 18`
   - **Smooth Speed**: `3.5`
   - **Enable Breathing Drift**: `True`
3. When the player tilts their phone in landscape, the classroom angle shifts dynamically. In the Unity Editor, it smoothly tracks mouse movement.

---

## 7. Mobile Platform & Build Settings

1. Go to **File > Build Settings** and switch platform to **Android** or **iOS**.
2. Open **Project Settings > Player**:
   - **Resolution and Presentation**:
     - **Orientation**: `Auto Rotation`
     - Allow: `Landscape Left`, `Landscape Right`
     - Disallow: `Portrait`, `Portrait Upside Down`
     - **Render outside safe area**: `Checked` (True full-screen)
   - **Other Settings (Android)**:
     - **Target Architectures**: `ARM64` checked (required by Google Play Store)
     - **Vibration Permission**: Enabled for `Handheld.Vibrate()`.
