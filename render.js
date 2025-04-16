document.getElementById("email-container").style.display = "block";
document.getElementById("html-container").style.display = "block";

function formatAddress(address) {
  const a = document.createElement("a");
  a.classList.add("email-address");
  a.textContent = ` <${address.address}>`;
  a.href = `mailto:${address.address}`;
  return a;
}

function formatAddresses(addresses) {
  let parts = [];

  let processAddress = (address, partCounter) => {
    if (partCounter) {
      let sep = document.createElement("span");
      sep.classList.add("email-address-separator");
      sep.textContent = ", ";
      parts.push(sep);
    }

    if (address.group) {
      let groupStart = document.createElement("span");
      groupStart.classList.add("email-address-group");
      let groupEnd = document.createElement("span");
      groupEnd.classList.add("email-address-group");

      groupStart.textContent = `${address.name}:`;
      groupEnd.textContent = `;`;

      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatAddress(address));
    }
  };

  addresses.forEach(processAddress);

  const result = document.createDocumentFragment();
  parts.forEach((part) => {
    result.appendChild(part);
  });
  return result;
}

function renderEmail(email) {
  renderSubject(email);
  renderSender(email);
  renderDate(email);
  renderBody(email);

  for (let type of ["to", "cc", "bcc"]) {
    if (email[type] && email[type].length) {
      document.getElementById(`${type}-container`).style.display = "flex";
      document.querySelector(`#${type}-container .content`).innerHTML = "";
      document
        .querySelector(`#${type}-container .content`)
        .appendChild(formatAddresses(email[type]));
    } else {
      document.getElementById(`${type}-container`).style.display = "none";
    }
  }
}

function renderSubject(subject) {
  if (subject) {
    document.getElementById("subject").style.display = "block";
    document.getElementById("subject").textContent += subject;
  } else {
    document.getElementById("subject").style.display = "none";
  }
}

function renderSender(sender) {
  if (sender) {
    const span = document.createElement("span");
    span.textContent = sender.name || "";
    document.querySelector("#from").appendChild(span);
    document.querySelector("#from").appendChild(formatAddress(sender));
  } else {
    document.getElementById("from-container").style.display = "none";
  }
}

function renderReceiver(address) {
  if (address.length > 0) {
    address.forEach((a) => {
      document.querySelector("#to").appendChild(formatAddress(a));
    });
  } else {
    document.getElementById("from-container").style.display = "none";
  }
}

function renderDate(date) {
  if (date) {
    document.getElementById("date-container").style.display = "flex";
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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (let b of bytes) result += String.fromCharCode(b);
  return btoa(result);
}

function renderAttachments(attachmentUrls) {
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

      downloadEl.download = attachment.filename || attachment.id || "attachment";
      downloadEl.classList.add("attachment-link");
      document
        .querySelector("#attachments-container .content")
        .appendChild(downloadEl);
    });
  } else {
    document.getElementById("attachments-container").style.display = "none";
  }
}


function getAttachmentLinks(email) {
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

function renderBody(htmlString, attachmentUrls) {
  const htmlContentElm = document.getElementById("html-content");
  const hr = document.createElement("hr");
  hr.classList.add("section-break");
  htmlContentElm.innerHTML = "";
  if (attachmentUrls.length > 0) {
    attachmentUrls.forEach((attch) => {
      const replacement = attch.data;
      let matchingStr = new RegExp(`attachment:${attch.id}`, "g");
      htmlString = htmlString.replace(matchingStr, replacement);
    });
  }
  htmlContentElm.innerHTML += htmlString;
  htmlContentElm.appendChild(hr);
}
