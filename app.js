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

function writeElements(data) {
  console.log("from writeelements", data);
  let username = data.first_name.toLowerCase() + data.last_name.toLowerCase();
  data_elements.username.innerText = username;
  data_elements.password.innerText = data.password;
  data_elements.phone.innerText = formatPhoneNumber(data.phone_number);

  data_elements.first_name.innerText = data.first_name;
  data_elements.last_name.innerText = data.last_name;
  data_elements.gender.innerText = data.gender;

  data_elements.day.innerText = data.date_of_birth.split("-")[2];
  data_elements.month.innerText = data.date_of_birth.split("-")[1];
  data_elements.year.innerText = data.date_of_birth.split("-")[0];

  data_elements.street.innerText = data.address.street_address;
  data_elements.city.innerText = data.address.city;
  data_elements.zip.innerText = data.address.zip_code;
  data_elements.state.innerText = data.address.state;
  data_elements.country.innerText = data.address.country;
  // TODO: get email.
  data_elements.email.innerText = username;
}

async function saveLocally(data) {
  const serialized = JSON.stringify(data);
  try {
    const res = await browser.storage.local.set({ fake_account: serialized });
    console.log("saved data locally");
  } catch (error) {
    console.error(error);
  }
}

async function retrieveLocal() {
  try {
    const res = await browser.storage.local.get("fake_account");
    console.log("res from retrieve", res);
    if (!res.fake_account) return false;
    return JSON.parse(res.fake_account);
  } catch (error) {
    console.error(error);
  }
}
async function generateAccount() {
  const generateButton = document.getElementById("generate");
  generateButton.classList.add("loading");
  try {
    let res = await fetch("https://random-data-api.com/api/v2/users");
    res = await res.json();
    console.log("res from generate", res);
    writeElements(res);
    saveLocally(res);
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

async function main() {
  let data = await retrieveLocal();
  if (data) {
    writeElements(data);
  }

  document
    .getElementById("generate")
    .addEventListener("click", generateAccount);
  document
    .querySelectorAll(".data-group")
    .forEach((node) => node.addEventListener("click", copy));
}

main();
