import {
  makeRequest,
  rateLimit,
  makeAuthenticatedDownloadRequest,
  makeAuthenticatedRequest,
  arrayBufferToBase64,
} from "./utils.js";
import { DELAY, URL } from "./consts.js";

export async function getAuthToken(data = {}) {
  try {
    const response = await makeRequest("post", URL.token, data);
    return response.token;
  } catch (error) {
    console.error("Failed to get token", error.message);
    return null;
  }
}

export async function getDomain() {
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
export async function registerAccount(data) {
  try {
    const response = await makeRequest("post", URL.account, data);
    return response;
  } catch (error) {
    console.error("Failed to register account", error.message);
    return null;
  }
}

export async function deleteAccount(id, token) {
  try {
    await makeAuthenticatedRequest(
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

async function getMessageAttachmentCore(token, downloadUrl) {
  try {
    const response = await makeAuthenticatedDownloadRequest(
      "get",
      `${URL.base}${downloadUrl}`,
      null,
      token
    );
    return arrayBufferToBase64(response);
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

export const getEmail = rateLimit(getEmailCore, DELAY);
export const getMessages = rateLimit(getMessagesCore, DELAY);
export const getMessage = rateLimit(getMessageCore, DELAY);
export const getMessageAttachment = rateLimit(getMessageAttachmentCore, DELAY);
