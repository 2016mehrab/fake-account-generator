import {arrayBufferToBase64} from "./utils.js"

document.getElementById("email-container").style.display = "block";
document.getElementById("html-container").style.display = "block";
const receiverDropDown = document.createElement("select");

export function formatAddress(address) {
  const a = document.createElement("a");
  a.classList.add("email-address");
  a.textContent = `<${address.address}>`;
  a.href = `mailto:${address.address}`;
  return a;
}

export function getAddressOption(address) {
  const option = document.createElement("option");
  option.value = `mailto:${address.address}`;
  option.text = `<${address.address}>`;
  return option;
}



export function renderSubject(subject) {
  if (subject) {
    const containerEl = document.getElementById("subject");
    containerEl.style.display = "block";
    containerEl.innerHTML = "";
    containerEl.textContent = subject;
  } else {
    document.getElementById("subject").style.display = "none";
  }
}


export function renderSender(sender) {
  if (sender) {
    const span = document.createElement("span");
    span.textContent = sender.name || "";
    document.querySelector("#from").innerHTML = "";
    document.querySelector("#from").appendChild(span);
    document.querySelector("#from").appendChild(formatAddress(sender));
  } else {
    document.getElementById("from-container").style.display = "none";
  }
}

export function renderReceiver(address) {
  if (address.length > 0) {
    document.querySelector("#to").appendChild(receiverDropDown);
    address.forEach((a) => {
      // document.querySelector("#to").appendChild(formatAddress(a));
      receiverDropDown.appendChild(getAddressOption(a));
    });

    receiverDropDown.addEventListener("change", (e) => {
      const selectedMail = e.target.value;
      if (selectedMail) window.location.href = selectedMail;
    });
  } else {
    document.getElementById("from-container").style.display = "none";
  }
}

export function renderDate(date) {
  if (date) {
    document.querySelector("#date-container .content").innerHTML = "";

    let dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      // hour12: false,
    };

    document.querySelector("#date-container .content").textContent =
      new Intl.DateTimeFormat("default", dateOptions).format(new Date(date));
  } else {
    document.getElementById("date-container").style.display = "none";
  }
}


export function renderAttachments(attachmentUrls) {
  if (attachmentUrls.length > 0) {
    document.getElementById("attachments-container").style.display = "block";
    document.querySelector("#attachments-container .content").innerHTML = "";

    attachmentUrls.forEach((attachment) => {
      const downloadEl = document.createElement("a");
      downloadEl.style.display = "block";
      downloadEl.href = attachment.data;
      downloadEl.textContent = `Download ${
        attachment.filename || attachment.id || "attachment"
      }`;

      downloadEl.download =
        attachment.filename || attachment.id || "attachment";
      downloadEl.classList.add("attachment-link");
      document
        .querySelector("#attachments-container .content")
        .appendChild(downloadEl);
    });
  } else {
    document.getElementById("attachments-container").style.display = "none";
  }
}

export function getAttachmentLinks(email) {
  const id_link = [];
  if (email.attachments && email.attachments.length > 0) {
    email.attachments.forEach((attachment) => {
      const base64data = arrayBufferToBase64(attachment.content);
      const downloadEl = document.createElement("a");
      downloadEl.style.display = "block";
      downloadEl.href = `data:${attachment.mimeType};base64,${base64data}`;
      downloadEl.textContent = `Download ${
        attachment.filename || "attachment"
      }`;
      downloadEl.download = attachment.filename || "attachment";
      downloadEl.classList.add("attachment-link");

      id_link.push({
        id: attachment.id,
        data: downloadEl.href,
        mimeType: attachment.mimeType,
        name: attachment.filename || "attachment",
      });
    });
    return id_link;
  }
  return [];
}

export function renderBody(cleanHtml, attachmentUrls) {

  const htmlContentElm = document.getElementById("html-content");
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "400px";
  iframe.style.border = "1px solid var(--primary-color)";
  htmlContentElm.innerHTML = "";

  htmlContentElm.appendChild(iframe);

  if (attachmentUrls.length > 0) {
    attachmentUrls.forEach((attch) => {
      const replacement = attch.data;
      let matchingStr = new RegExp(`attachment:${attch.id}`, "g");
      cleanHtml = cleanHtml.replace(matchingStr, replacement);
    });
  }

  iframe.onload = () => {
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.body.innerHTML = cleanHtml;
  };

  iframe.srcdoc = "<!DOCTYPE html><html><head></head><body></body></html>";
  const hr = document.createElement("hr");
  hr.classList.add("section-break");
  htmlContentElm.appendChild(hr);
}
