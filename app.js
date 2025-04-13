const DEBOUNCE_INTERVAL = 500;
const data_elements = {
  username: document.querySelector("strong#username"),
  email: document.querySelector("strong#email"),
  password: document.querySelector("strong#password"),
  phone: document.querySelector("strong#phone"),

  first_name: document.querySelector("strong#first-name"),
  last_name: document.querySelector("strong#last-name"),
  gender: document.querySelector("strong#gender"),

  day: document.querySelector("strong#day"),
  month: document.querySelector("strong#month"),
  year: document.querySelector("strong#year"),

  street: document.querySelector("strong#street"),
  city: document.querySelector("strong#city"),
  zip: document.querySelector("strong#zip"),
  state: document.querySelector("strong#state"),
  country: document.querySelector("strong#country"),
};
function writeElements(data = {}) {
  data_elements.username.innerText = data.username || "";
  data_elements.email.innerText = data.email || "";
  data_elements.password.innerText = data.password || "";
  data_elements.phone.innerText = formatPhoneNumber(data.phone_number || "");
  data_elements.first_name.innerText = data.first_name || "";
  data_elements.last_name.innerText = data.last_name || "";
  data_elements.gender.innerText = data.gender || "";
  data_elements.day.innerText = data.date_of_birth?.split("-")[2] || "";
  data_elements.month.innerText = data.date_of_birth?.split("-")[1] || "";
  data_elements.year.innerText = data.date_of_birth?.split("-")[0] || "";
  data_elements.street.innerText = data.address?.street_address || "";
  data_elements.city.innerText = data.address?.city || "";
  data_elements.zip.innerText = data.address?.zip_code || "";
  data_elements.state.innerText = data.address?.state || "";
  data_elements.country.innerText = data.address?.country || "";
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
    console.log("Retrieved Data", res);
    if (!res.fake_account) return false;
    return JSON.parse(res.fake_account);
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function generateAccount() {
  const generateButton = document.getElementById("generate");
  generateButton.classList.add("loading");
  try {
    let res;
    // deleting previous acc
    let prevAcc = await retrieveLocal();
    if (prevAcc && typeof prevAcc === "object" && Object.keys(prevAcc).length > 0) {
      await deleteAccount(prevAcc.account, prevAcc.token);
      await removeLocal();
    }

    res = await fetch("https://random-data-api.com/api/v2/users");
    res = await res.json();

    let username = res.first_name.toLowerCase() + res.last_name.toLowerCase();

    const { account, token, rawMessages } = await getEmail({
      username,
      password: res.password,
    });

    if (!account || !token) throw new Error("Failed to create account");

    const data = {
      ...res,
      username,
      account: account.id,
      email: account.address,
      token,
    };

    writeElements(data);
    await saveLocally(data);
  } catch (error) {
    console.error(error);
  } finally {
    generateButton.classList.remove("loading");
  }
}

function formatPhoneNumber(phone) {
  // Replace dots with hyphens
  return phone.replace(/\./g, "-");
}

async function copy(e) {
  const datagroup = e.currentTarget;
  const strongEl = datagroup.querySelector("strong.data");
  if (strongEl) {
    try {
      await navigator.clipboard.writeText(strongEl.textContent);
      console.log("copied", strongEl.textContent);
    } catch (error) {
      console.error(error);
    }
  } else console.warn("No strong element found in data-group");
}
function debounce(fn, interval) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), interval);
  }
}

async function main() {
  let data = await retrieveLocal();
  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    writeElements(data);
  }

  document
    .getElementById("generate")
    .addEventListener("click", debounce(generateAccount, DEBOUNCE_INTERVAL));
  document
    .querySelectorAll(".data-group")
    .forEach((node) => node.addEventListener("click", copy));
}

main();
