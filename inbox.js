const errorDiv = document.getElementById("error");
const messagesBody = document.getElementById("messages");
const noEmailsDiv = document.getElementById("no-emails");

async function displayMessages() {
  try {
    const { account, token } = await retrieveLocal();
    if (!token) {
      throw new Error("No email account data available");
    }

    const response = await getMessages(token);
    const messages = response?.["hydra:member"] || [];

    if (messages.length === 0) {
      noEmailsDiv.style.display = "block";
      return;
    }
    noEmailsDiv.style.display = "none";

    messagesBody.innerHTML = messages
      .map((msg) => {
        const from = msg.from?.address || "Unknown";
        const subject = msg.subject || "(No Subject)";
        const date = new Date(msg.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const unreadClass = msg.seen ? "" : "unread";
        const attachmentClass = msg.hasAttachments ? "attachment" : "";

        return `
          <div class="${unreadClass} grid grid-cols-3" data-id="${msg.id}">
              <span class="date">${date}</span>
              <span class="sender">${from}</span>
              <span class="subject ${attachmentClass}">${subject}</span>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Failed to load messages:", error);
    errorDiv.textContent = "Failed to load messages: " + error.message;
    errorDiv.style.display = "block";
    noEmailsDiv.style.display = "none";
  }
}

document
  .getElementById("refresh")
  .addEventListener("click", debounce(displayMessages, DEBOUNCE_INTERVAL));
displayMessages();
