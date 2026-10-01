using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

/// <summary>
/// Manages save slots and checkpoint loading for the 'Continue' menu in Unity.
/// </summary>
public class SaveSlotManager : MonoBehaviour
{
    [System.Serializable]
    public class SaveSlotUI
    {
        public int slotIndex;
        public GameObject rootContainer;
        public Text chapterTitleText;
        public Text locationTimestampText;
        public Button loadButton;
        public Button deleteButton;
        public GameObject emptySlotIndicator;
    }

    [Header("Slot Elements")]
    [SerializeField] private SaveSlotUI[] saveSlots;
    [SerializeField] private Button closeButton;

    private void Awake()
    {
        if (closeButton != null)
            closeButton.onClick.AddListener(() => gameObject.SetActive(false));
    }

    private void OnEnable()
    {
        RefreshAllSlots();
    }

    public void RefreshAllSlots()
    {
        for (int i = 0; i < saveSlots.Length; i++)
        {
            SetupSlot(saveSlots[i]);
        }
    }

    private void SetupSlot(SaveSlotUI slot)
    {
        string keyPrefix = $"TLB_Slot_{slot.slotIndex}_";
        bool exists = PlayerPrefs.GetInt(keyPrefix + "Exists", 0) == 1;

        if (exists)
        {
            if (slot.emptySlotIndicator != null) slot.emptySlotIndicator.SetActive(false);
            if (slot.chapterTitleText != null)
                slot.chapterTitleText.text = PlayerPrefs.GetString(keyPrefix + "Chapter", "Chapter I: The Silent Hallway");

            if (slot.locationTimestampText != null)
            {
                string loc = PlayerPrefs.GetString(keyPrefix + "Location", "Classroom 302");
                string time = PlayerPrefs.GetString(keyPrefix + "Time", DateTime.Now.ToString("g"));
                slot.locationTimestampText.text = $"{loc} • {time}";
            }

            if (slot.loadButton != null)
            {
                slot.loadButton.interactable = true;
                slot.loadButton.onClick.RemoveAllListeners();
                slot.loadButton.onClick.AddListener(() => LoadSlot(slot.slotIndex));
            }

            if (slot.deleteButton != null)
            {
                slot.deleteButton.gameObject.SetActive(true);
                slot.deleteButton.onClick.RemoveAllListeners();
                slot.deleteButton.onClick.AddListener(() => DeleteSlot(slot.slotIndex));
            }
        }
        else
        {
            if (slot.emptySlotIndicator != null) slot.emptySlotIndicator.SetActive(true);
            if (slot.chapterTitleText != null) slot.chapterTitleText.text = "— EMPTY CORRIDOR —";
            if (slot.locationTimestampText != null) slot.locationTimestampText.text = "No saved data";
            if (slot.loadButton != null) slot.loadButton.interactable = false;
            if (slot.deleteButton != null) slot.deleteButton.gameObject.SetActive(false);
        }
    }

    public void LoadSlot(int slotIndex)
    {
        string keyPrefix = $"TLB_Slot_{slotIndex}_";
        string targetScene = PlayerPrefs.GetString(keyPrefix + "Scene", "GameScene_Prologue");
        PlayerPrefs.SetInt("TLB_ActiveSlot", slotIndex);
        PlayerPrefs.Save();

        SceneManager.LoadScene(targetScene);
    }

    public void DeleteSlot(int slotIndex)
    {
        string keyPrefix = $"TLB_Slot_{slotIndex}_";
        PlayerPrefs.DeleteKey(keyPrefix + "Exists");
        PlayerPrefs.DeleteKey(keyPrefix + "Chapter");
        PlayerPrefs.DeleteKey(keyPrefix + "Location");
        PlayerPrefs.DeleteKey(keyPrefix + "Time");
        PlayerPrefs.DeleteKey(keyPrefix + "Scene");
        PlayerPrefs.Save();

        RefreshAllSlots();
    }
}
