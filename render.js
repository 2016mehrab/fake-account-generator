document.getElementById("email-container").style.display = "block";

function formatAddress(address) {
  const a = document.createElement("a");
  a.classList.add("email-address");
  a.textContent = address.name || `<${address.address}>`;
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
    document.getElementById("subject-content").style.display = "block";
    document.getElementById("subject-content").textContent += subject;
  } else {
    document.getElementById("subject-content").style.display = "none";
  }
}

function renderSender(sender) {
  if (sender) {
    document.getElementById("from-container").style.display = "flex";
    document.querySelector("#from-container .content").innerHTML = "";
    document
      .querySelector("#from-container .content")
    //   .appendChild(formatAddress(sender));
      .appendChild(sender);
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
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    };

    document.querySelector("#date-container .content").textContent =
      new Intl.DateTimeFormat("default", dateOptions).format(
        new Date(date)
      );
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

function renderAttachments(email) {
  if (email.attachments && email.attachments.length) {
    document.getElementById("attachments-container").style.display = "block";
    document.querySelector("#attachments-container .content").innerHTML = "";

    email.attachments.forEach((attachment) => {
      const base64data = arrayBufferToBase64(attachment.content);
      const downloadEl = document.createElement("a");
      downloadEl.href = `data:${attachment.mimeType};base64,${base64data}`;
      downloadEl.textContent = `Download ${
        attachment.filename || "attachment"
      }`;
      downloadEl.download = attachment.filename || "attachment";
      downloadEl.classList.add("attachment-link");

      document
        .querySelector("#attachments-container .content")
        .appendChild(downloadEl);
    });
  } else {
    document.getElementById("attachments-container").style.display = "none";
  }
}

function renderBody(email) {
  const htmlContentElm = document.getElementById("html-content");
  htmlContentElm.innerHTML = "";
  htmlContentElm.innerHTML += email?.text;
  console.log(email?.text);
  
  //   if (email?.html.length > 0) {
  //     email.html.forEach((e) => {
  //       return (htmlContainerElm.innerHTML += e);
  //     });
  //   }
}
