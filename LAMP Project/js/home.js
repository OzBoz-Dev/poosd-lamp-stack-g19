//Once again all SVG configurations are done with Claude

//saves login info, if you logged in on your device previously this should access that saved data and auto log you in, else go to login page
let userId = localStorage.getItem('userId');
let userFirstName = localStorage.getItem('userFirstName') || '';
let userLastName = localStorage.getItem('userLastName') || '';

if (!userId) {
  window.location.href = './login.html';
}

//In home.html there is a thing that will display your username, this is for that
const userNameElement = document.getElementById('userName');
if (userNameElement) {
  const fullName = `${userFirstName} ${userLastName}`.trim();
  userNameElement.textContent = fullName || 'User';
}

let contacts = [];
let editingContactId = null;

loadContacts();

// =============== API Nightmare ================

async function loadContacts() {
  try {
    const response = await fetch('/API/contacts_flow/readallcontacts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: userId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load contacts');
    }

    contacts = data.contacts || [];
    renderContacts();
  } catch (err) {
    console.error('Error loading contacts:', err);
    showFormError('Failed to load contacts: ' + err.message);
  }
}

async function addContact(contactData) {
  try {
    const response = await fetch('/API/contacts_flow/addcontact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_id: userId,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add contact');
    }

    await loadContacts();
    return true;
  } catch (err) {
    throw err;
  }
}

async function updateContact(contactId, contactData) {
  try {
    const response = await fetch('/API/contacts_flow/updatecontact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: contactId,
        parent_id: userId,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update contact');
    }

    await loadContacts();
    return true;
  } catch (err) {
    throw err;
  }
}

async function deleteContact(contactId) {
  try {
    const response = await fetch('/API/contacts_flow/deletecontact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: contactId,
        parent_id: userId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete contact');
    }

    await loadContacts();
    return true;
  } catch (err) {
    throw err;
  }
}

// =============== UI FUNCTIONS ================

//dynamically display contact cards
function renderContacts() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const grid = document.getElementById('contactsGrid');
  const emptyState = document.getElementById('emptyState');

  //thing to make the search bar work
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    return fullName.includes(searchQuery) || email.includes(searchQuery);
  });

  //load empty state from home.html if there are not contacts
  if (filteredContacts.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  //how to make a contact card for a contact
  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = filteredContacts.map(contact => {
    const fullName = `${escapeHtml(contact.firstName || '')} ${escapeHtml(contact.lastName || '')}`.trim();
    const company = contact.company ? `<p class="contact-company">${escapeHtml(contact.company)}</p>` : '';
    const email = contact.email ? `
      <div class="contact-detail">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 4.5h11c.5 0 1 .5 1 1v6c0 .5-.5 1-1 1h-11c-.5 0-1-.5-1-1v-6c0-.5.5-1 1-1z" stroke="currentColor" stroke-width="1.2"/>
          <path d="M14.5 5l-6.5 4-6.5-4" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <span>${escapeHtml(contact.email)}</span>
      </div>
    ` : '';
    const phone = contact.phone ? `
      <div class="contact-detail">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14.5 11.2v1.8c0 1-.8 1.8-1.8 1.8-6.1-.3-11-5.2-11.3-11.3 0-1 .8-1.8 1.8-1.8h1.8c.5 0 .9.4 1 .9l.3 1.5c.1.4 0 .8-.3 1.1l-.8.8c1 1.9 2.6 3.5 4.5 4.5l.8-.8c.3-.3.7-.4 1.1-.3l1.5.3c.5.1.9.5.9 1z" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <span>${escapeHtml(contact.phone)}</span>
      </div>
    ` : '';

    return `
      <div class="contact-card">
        <div class="contact-header">
          <div class="contact-info">
            <h3 class="contact-name">${fullName}</h3>
            ${company}
          </div>
          <div class="contact-actions">
            <button class="icon-btn" onclick="openEditModal(${contact.id})" title="Edit contact">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.3 2a1.4 1.4 0 012 2L4.6 12.7 2 13.3l.6-2.6L11.3 2z" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </button>
            <button class="icon-btn delete-btn" onclick="confirmDelete(${contact.id})" title="Delete contact">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5 4V2.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V4m2 0v9.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5V4h10z" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </button>
          </div>
        </div>
        ${email || phone ? `
          <div class="contact-details">
            ${email}
            ${phone}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

//CLAUDE MADE THIS AS A HELPER FOR THE SVG DESIGNS ABOVE
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function openAddModal() {
  editingContactId = null;
  document.getElementById('modalTitle').textContent = 'Add Contact';
  document.getElementById('contactForm').reset();
  document.getElementById('formError').style.display = 'none';
  document.getElementById('contactModal').classList.add('show');
}

function openEditModal(contactId) {
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;

  //build an empty form
  editingContactId = contactId;
  document.getElementById('modalTitle').textContent = 'Edit Contact';
  document.getElementById('firstName').value = contact.firstName || '';
  document.getElementById('lastName').value = contact.lastName || '';
  document.getElementById('email').value = contact.email || '';
  document.getElementById('phone').value = contact.phone || '';
  document.getElementById('company').value = contact.company || '';
  document.getElementById('formError').style.display = 'none';
  document.getElementById('contactModal').classList.add('show');
}

function closeModal() {
  document.getElementById('contactModal').classList.remove('show');
  editingContactId = null;
  document.getElementById('contactForm').reset();
}

//CLAUDE USED TO WRITE THIS FUNCTION
async function saveContact(event) {
  event.preventDefault();

  const contactData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    company: document.getElementById('company').value.trim()
  };

  if (!contactData.firstName) {
    showFormError('First name is required');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editingContactId) {
      await updateContact(editingContactId, contactData);
    } else {
      await addContact(contactData);
    }
    closeModal();
  } catch (err) {
    showFormError(err.message || 'Failed to save contact');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Contact';
  }
}

function confirmDelete(contactId) {
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;

  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'this contact';
  
  if (confirm(`Are you sure you want to delete ${fullName}?`)) {
    deleteContact(contactId).catch(err => {
      alert('Failed to delete contact: ' + err.message);
    });
  }
}

function showFormError(message) {
  const errorDiv = document.getElementById('formError');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function logout() {
  localStorage.clear();
  window.location.href = './index.html';
}

//make add contact form go away if you click outside of it, maybe replace with a cancel button later
document.getElementById('contactModal').addEventListener('click', (e) => {
  if (e.target.id === 'contactModal') {
    closeModal();
  }
});
