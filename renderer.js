document.getElementById("generate-btn").addEventListener("click", async () => {
  const raw = document.getElementById("data-input").value;
  const statusBox = document.getElementById("status");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    statusBox.innerText = "⚠️ Invalid JSON format.";
    statusBox.style.borderLeftColor = "#e74c3c";
    return;
  }

  const result = await window.excelAPI.applyTemplate(parsed);
  statusBox.innerText = result.message;

  if (result.success) {
    statusBox.style.borderLeftColor = "#27ae60";
  } else {
    statusBox.style.borderLeftColor = "#e74c3c";
  }
});

document.getElementById("minimize-btn").addEventListener("click", () => {
  window.electronAPI.minimizeWindow();
});

document.getElementById("maximize-btn").addEventListener("click", () => {
  window.electronAPI.maximizeWindow();
});

document.getElementById("close-btn").addEventListener("click", () => {
  window.electronAPI.closeWindow();
});
