document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const messagesContainer = document.getElementById("messages");
  const sendBtn = document.getElementById("send-btn");

  const copyToastEl = document.getElementById('copyToast');
  const copyToast = new bootstrap.Toast(copyToastEl, {
    animation: true,
    autohide: true,
    delay: 2000 // Toast verschwindet nach 2 Sekunden
  });

  form.addEventListener("submit", async () => {
    const text = userInput.value.trim();
    if(!text) return;

    // User Nachricht anzeigen
    addMessage(text, "user-message");
    userInput.value = "";

    // Ladeindikator anzeigen
    const loaderId = addLoadingIndicator();
    sendBtn.disabled = true;

    try {
      // Beispielhafter Backend-Aufruf, URL ggf. anpassen
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({user_message: text})
      });
      
      sendBtn.disabled = false;
      removeLoadingIndicator(loaderId);

      if(!response.ok){
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      if(data.error){
        addMessage("Entschuldigung, ein Fehler ist aufgetreten: " + data.error, "bot-message");
      } else {
        // Bot-Antwort anzeigen
        addMessage(data.assistant_message, "bot-message");
      }

    } catch (e) {
      sendBtn.disabled = false;
      removeLoadingIndicator(loaderId);
      addMessage("Entschuldigung, es ist ein Netzwerkfehler aufgetreten: " + e.message, "bot-message");
    }
  });

  // Nachricht auch mit Enter absenden
  userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });

  function addMessage(text, className) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-row");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add(className);
    messageDiv.innerText = text;
    
    messageWrapper.appendChild(messageDiv);

    // Wenn es eine Bot-Nachricht ist, füge den Icon-Button unterhalb der Sprechblase hinzu
    if (className === "bot-message") {
      const copyButton = document.createElement("button");
      copyButton.className = "copy-btn";
      copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
      copyButton.onclick = () => copyToClipboard(text);
      messageWrapper.appendChild(copyButton);
    }

    messagesContainer.appendChild(messageWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addLoadingIndicator() {
    const loaderId = "loader-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.id = loaderId;
    loadingDiv.className = "loading-indicator";
    loadingDiv.innerHTML = `
      <div class="spinner-border text-primary" role="status"></div>
      <span>Der Bot denkt nach...</span>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return loaderId;
  }

  function removeLoadingIndicator(id) {
    const loader = document.getElementById(id);
    if(loader){
      messagesContainer.removeChild(loader);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Anstatt alert, Toast anzeigen
      copyToast.show();
    }).catch(e => {
      console.error("Fehler beim Kopieren", e);
    });
  }
});
