// import postalMime  from "https://cdn.jsdelivr.net/npm/postal-mime@2.4.3/+esm";
import postalMime, { decodeWords } from "./postal-mime.min.js";

async function refresh() {
  const refreshEl = document.getElementById("refresh");
  refreshEl.classList.add("loading");
  const TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE3NDQ4MDcwMjIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJhZGRyZXNzIjoiam9zaWFod2hpdGVAcHRjdC5uZXQiLCJpZCI6IjY3ZmZhNDZiOTViZTk3NmZlOTBmNjgwNCIsIm1lcmN1cmUiOnsic3Vic2NyaWJlIjpbIi9hY2NvdW50cy82N2ZmYTQ2Yjk1YmU5NzZmZTkwZjY4MDQiXX19.IQZ2ukiKgRx0ZHHJIz49qH_2h67W_-lc84Hx9DB23KKjpLdzkhPIgo174SfN3KYCv6Pb524Va1PrJb_h4XLhZw";
  const M_ID = "67ffab2acf93b51195d5250c";

  try {
    // get token
    let token = null;
    let savedAcc = await retrieveLocal();
    if (
      savedAcc &&
      typeof savedAcc === "object" &&
      Object.keys(savedAcc).length > 0
    )
      token = savedAcc.token;

    if (!token) throw new Error("Generate an account first.");
    // console.log("tokn", token);

    //get message id
    const res = await getMessages(token);
    const messages_id = res["hydra:member"].map((m) => m.id) || [];

    if (messages_id.length < 1) {
      throw new Error("No messages yet");
    }

    // get message detail

    const message = await getMessage(token, messages_id[0]);
    // const message = await getMessage(TOKEN, M_ID);

    let html;
    // console.log("message", message);
    // console.log(JSON.stringify(message));

    if (message?.html.length > 0) {
      html = decodeWords(message.html[0]);
      // console.log("decoded html", decodeWords(message.html[0]));
    }

    let attachmentUrls = [];

    if (message.hasAttachments) {
      // const res = await getMessageAttachments(token, messages_id[0]);
      attachmentUrls = await Promise.all(
        message.attachments.map(
          async ({ downloadUrl, id, filename, size, contentType }) => {
            let base64Data = await getMessageAttachment(token, downloadUrl);
            return {
              data: `data:${contentType};base64,${base64Data}`,
              id,
              filename,
              size,
              contentType,
            };
          }
        )
      );
    }

    renderBody(html, attachmentUrls);
    renderSubject(message.subject);
    renderDate(message.createdAt);
    renderSender(message.from);
    renderReceiver(message.to);
    renderAttachments(attachmentUrls);
  } catch (error) {
    console.error("something went wrong", error);
    const errorBlock = document.createElement("p");
    errorBlock.textContent = "";
    errorBlock.textContent = error.message || "something went wrong";
    const error_messageEl = document.getElementById("error-message");
    error_messageEl.appendChild(errorBlock);
  } finally {
    refreshEl.classList.remove("loading");
  }
}
document
  .getElementById("refresh")
  .addEventListener("click", debounce(refresh, DEBOUNCE_INTERVAL));
