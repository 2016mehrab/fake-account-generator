const DELAY = 3000;
const DEBOUNCE_INTERVAL = 500;
const URL = {
  base: "https://api.mail.tm",
  token: "https://api.mail.tm/token",
  account: "https://api.mail.tm/accounts",
  domain: "https://api.mail.tm/domains",
  message: "https://api.mail.tm/messages",
};

async function makeAuthenticatedRequestCore(method, url, data = null, token) {
  try {
    const options = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (data !== null) options.body = JSON.stringify(data);

    const response = await fetch(url, options);
    if (!response.ok) {
      // If the response status is not OK, throw an error
      const errorData = await response.json();
      throw new Error(
        `Error (${method}-${url}): ${errorData.message || response.statusText}`
      );
    }
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application")) {
      return await response.json();
    } else if (contentType.includes("message")) return await response.text();
    return null;

  } catch (error) {
    console.error(
      `Error (${method}-${url}):`,
      error.response?.data || error.message
    );
  }
}

async function makeRequestCore(method, url, data = null) {
  try {
    const options = {
      method: method.toUpperCase(),
    };
    if (data !== null) {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error (${method}-${url}): ${errorData.message || response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(
      `Error (${method}-${url}):`,
      error.response?.data || error.message
    );
    throw new Error(
      `Error (${method}-${url}): ${error.response?.data || error.message}`
    );
  }
}

async function getAuthToken(data = {}) {
  try {
    const response = await makeRequest("post", URL.token, data);
    return response.token;
  } catch (error) {
    console.error("Failed to get token", error.message);
    return null;
  }
}

async function getDomain() {
  try {
    const response = await makeRequest("get", URL.domain);
    const domains = response["hydra:member"]?.map((d) => d.domain);
    const domain = domains.includes("ptct.net")
      ? "ptct.net"
      : domains[0] || null;

    return domain;
  } catch (error) {
    console.error("Failed to get domain", error.message);
    return null;
  }
}
// data
//{
//  "address": "sherrellturner@ptct.net",
//   "password":"NpqGWUk6gJ"

//}
async function registerAccount(data) {
  try {
    const response = await makeRequest("post", URL.account, data);
    return response;
  } catch (error) {
    console.error("Failed to register account", error.message);
    return null;
  }
}

async function deleteAccount(id, token) {
  try {
    const response = await makeAuthenticatedRequest(
      "delete",
      `${URL.account}/${id}`,
      null,
      token
    );
    console.info("account with id", id, "deleted!");
    return true;
  } catch (error) {
    console.error("Failed to delete account", error.message);
    return false;
  }
}

async function getMessageAttachmentsCore(token, messageId) {
  try {
    const response = await makeAuthenticatedRequest(
      "get",
      `${URL.message}/${messageId}/download`,
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to load messages", error.message);
    return null;
  }
}
async function getMessageCore(token, messageId) {
  try {
    const response = await makeAuthenticatedRequest(
      "get",
      `${URL.message}/${messageId}`,
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to load messages", error.message);
    return null;
  }
}

async function getMessagesCore(token) {
  try {
    const response = await makeAuthenticatedRequest(
      "get",
      URL.message,
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to load messages", error.message);
    return null;
  }
}
// username ,password
async function getEmailCore({ username, password }) {
  const domain = await getDomain();
  if (!domain) throw new Error("No domain available");

  const data = {
    address: `${username}@${domain}`,
    password,
  };
  const account = await registerAccount(data);
  const token = await getAuthToken(data);
  const rawMessages = await getMessages(token);
  return { account, token, rawMessages };
}

function rateLimit(fn, limitMs) {
  let lastCall = 0;
  return async (...args) => {
    const now = Date.now();
    const diff = now - lastCall;
    if (diff < limitMs)
      await new Promise((cb) => setTimeout(cb, limitMs - diff));
    lastCall = Date.now();
    return fn(...args);
  };
}

function debounce(fn, interval) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), interval);
  };
}

async function saveLocally(data) {
  const serialized = JSON.stringify(data);
  try {
    const res = await browser.storage.local.set({ fake_account: serialized });
    console.log("Saved data locally");
  } catch (error) {
    console.error(error);
  }
}

async function removeLocal(key = "fake_account") {
  try {
    await browser.storage.local.remove(key);
    console.log("Removed locally saved data");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function retrieveLocal() {
  try {
    const res = await browser.storage.local.get("fake_account");
    if (!res.fake_account) return false;
    return JSON.parse(res.fake_account);
  } catch (error) {
    console.error(error);
    return {};
  }
}

const makeAuthenticatedRequest = rateLimit(makeAuthenticatedRequestCore, DELAY);
const makeRequest = rateLimit(makeRequestCore, DELAY);
const getEmail = rateLimit(getEmailCore, DELAY);
const getMessages = rateLimit(getMessagesCore, DELAY);
const getMessage = rateLimit(getMessageCore, DELAY);
const getMessageAttachments = rateLimit(getMessageAttachmentsCore, DELAY);
