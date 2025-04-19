import { DELAY } from "./consts.js";

export function formatPhoneNumber(phone) {
  // Replace dots with hyphens
  return phone.replace(/\./g, "-");
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (let b of bytes) result += String.fromCharCode(b);
  return btoa(result);
}

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

async function makeAuthenticatedDownloadRequestCore(
  method,
  url,
  data = null,
  token
) {
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
      const errorData = await response.json();
      throw new Error(
        `Error (${method}-${url}): ${errorData.message || response.statusText}`
      );
    }
    return await response.arrayBuffer();
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

export function rateLimit(fn, limitMs) {
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

export function debounce(fn, interval) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), interval);
  };
}

export async function saveLocally(data) {
  const serialized = JSON.stringify(data);
  try {
    const res = await browser.storage.local.set({ fake_account: serialized });
    console.log("Saved data locally");
  } catch (error) {
    console.error(error);
  }
}

export async function removeLocal(key = "fake_account") {
  try {
    await browser.storage.local.remove(key);
    console.log("Removed locally saved data");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function retrieveLocal() {
  try {
    const res = await browser.storage.local.get("fake_account");
    if (!res.fake_account) return false;
    return JSON.parse(res.fake_account);
  } catch (error) {
    console.error(error);
    return {};
  }
}

export const makeAuthenticatedRequest = rateLimit(
  makeAuthenticatedRequestCore,
  DELAY
);
export const makeAuthenticatedDownloadRequest = rateLimit(
  makeAuthenticatedDownloadRequestCore,
  DELAY
);

export const makeRequest = rateLimit(makeRequestCore, DELAY);
