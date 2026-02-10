
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");

const nameText = document.getElementById("nameText");
const nameInputs = document.getElementById("nameInputs");
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");

const textFields = {
  title: document.getElementById("companyText"),
  email: document.getElementById("emailText"),
  phone: document.getElementById("phoneText"),
};

const inputFields = {
  title: document.getElementById("companyInput"),
  email: document.getElementById("emailInput"),
  phone: document.getElementById("phoneInput"),
};


function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  const first = parts.shift() || "";
  const last = parts.join(" "); 
  return { first, last };
}

function getContactIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getParentIdFromStorage() {
  return localStorage.getItem("userId");
}

function enterEditMode() {

  const { first, last } = splitName(nameText.textContent);
  firstNameInput.value = first;
  lastNameInput.value = last;

  nameText.classList.add("hidden");
  nameInputs.classList.remove("hidden");

 
  for (const key in textFields) {
    inputFields[key].value = textFields[key].textContent;
    textFields[key].classList.add("hidden");
    inputFields[key].classList.remove("hidden");
  }

  editBtn.classList.add("hidden");
  saveBtn.classList.remove("hidden");
  cancelBtn.classList.remove("hidden");
  deleteBtn.classList.remove("hidden");
}

function exitEditMode() {
  nameText.classList.remove("hidden");
  nameInputs.classList.add("hidden");

  for (const key in textFields) {
    textFields[key].classList.remove("hidden");
    inputFields[key].classList.add("hidden");
  }

  editBtn.classList.remove("hidden");
  saveBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  deleteBtn.classList.add("hidden");
}


async function readContact() {
  // Need contact id in URL from contact list page
  // Use query params most likely. 
  const id = getContactIdFromUrl();
  if (!id) throw new Error("Missing contact ID in URL (details.html?id=...).");

  const parentID = getParentIdFromStorage();
  if (!parentID) {
    window.location.href = "./login.html";
    return;
  }

  const res = await fetch("/API/contacts_flow/readcontact.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: Number(id),
      parent_id: Number(parentID),
    }),
  });

  const text = await res.text();

  if (!res.ok) {
  
    try {
      const errData = JSON.parse(text);
      throw new Error(errData?.error || `Failed to load contact (${res.status})`);
    } catch {
      throw new Error(text || `Failed to load contact (${res.status})`);
    }
  }

  let contact;
  try {
    contact = JSON.parse(text);
  } catch {
    throw new Error("Read contact returned invalid JSON.");
  }

  
  nameText.textContent = `${contact.firstname || ""} ${contact.lastname || ""}`.trim();
  textFields.title.textContent = contact.company || "";
  textFields.email.textContent = contact.email || "";
  textFields.phone.textContent = contact.phone || "";

  return contact;
}

async function updateContact() {
  saveBtn.disabled = true;

  try {
    const id = getContactIdFromUrl();
    if (!id) throw new Error("Missing contact ID in URL.");

    const parentID = getParentIdFromStorage();
    if (!parentID) {
      window.location.href = "./login.html";
      return;
    }

    const payload = {
      id: Number(id),
      parent_id: Number(parentID),
      firstname: firstNameInput.value.trim(),
      lastname: lastNameInput.value.trim(),
      email: inputFields.email.value.trim(),
      phone: inputFields.phone.value.trim(),
      company: inputFields.title.value.trim(),
    };

    const res = await fetch("/API/contacts_flow/updatecontact.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {

      throw new Error(text || `Update failed (${res.status})`);
    }

    nameText.textContent = `${payload.firstname} ${payload.lastname}`.trim();
    textFields.title.textContent = payload.company;
    textFields.email.textContent = payload.email;
    textFields.phone.textContent = payload.phone;

    exitEditMode();
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to update contact.");
  } finally {
    saveBtn.disabled = false;
  }
}

async function deleteContact() {
  const confirmed = confirm("Are you sure you want to delete this contact?");
  if (!confirmed) return;

  const id = getContactIdFromUrl();
  if (!id) {
    alert("Missing contact ID in URL.");
    return;
  }

  const parentID = getParentIdFromStorage();
  if (!parentID) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const res = await fetch("/API/contacts_flow/deletecontact.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id),
        parent_id: Number(parentID),
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || `Delete failed (${res.status})`);
    }

    alert("Contact deleted.");
    window.location.href = "./contacts.html";
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to delete contact.");
  }
}


exitEditMode();

editBtn.addEventListener("click", enterEditMode);
cancelBtn.addEventListener("click", exitEditMode);
saveBtn.addEventListener("click", updateContact);
deleteBtn.addEventListener("click", deleteContact);

readContact().catch((err) => {
  console.error(err);
  alert(err.message || "Failed to load contact.");
});
