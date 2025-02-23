document.addEventListener("DOMContentLoaded", () => {
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChat");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const loadingIndicator = document.getElementById("loading-indicator"); // Add a loading indicator element in HTML

  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.style.display =
      chatbotContainer.style.display === "none" ? "block" : "none";
  });

  chatbotClose.addEventListener("click", () => {
    chatbotContainer.style.display = "none";
  });

  function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll to latest message
  }

  async function getAIResponse(prompt) {
    const apiKey =
      "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"; // Store securely
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/learnlm-1.5-pro-experimental:free", // Check model ID
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response from AI.";
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Error connecting to AI.";
    }
  }

  sendChatBtn.addEventListener("click", async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    appendMessage("You", userMessage);
    chatInput.value = "";

    loadingIndicator.style.display = "block";

    const aiResponse = await getAIResponse(userMessage);

    loadingIndicator.style.display = "none";
    appendMessage("AI", aiResponse);
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatBtn.click();
    }
  });
});
