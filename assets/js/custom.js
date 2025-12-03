window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("feedback-form");
  const submitBtn = form.querySelector("button[type='submit']");
  const resultsBox = document.getElementById("form-results");
  const popup = document.getElementById("form-popup");

  // Inputs
  const fields = {
    name: document.getElementById("name-field"),
    surname: document.getElementById("surname-field"),
    email: document.getElementById("email-field"),
    phone: document.getElementById("phone-field"),
    address: document.getElementById("address-field"),
    message: document.getElementById("message-field"),
    rating1: document.getElementById("rating1-field"),
    rating2: document.getElementById("rating2-field"),
    rating3: document.getElementById("rating3-field"),
  };

  // Create error text elements dynamically under each field
  Object.values(fields).forEach((input) => {
    const error = document.createElement("div");
    error.classList.add("error-text");
    error.innerText = "Invalid input";
    input.insertAdjacentElement("afterend", error);
  });

  // VALIDATION RULES
  function validateName(value) {
    return /^[A-Za-zÀ-ž\s'-]+$/.test(value);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateAddress(value) {
    return value.length >= 5;
  }

  function validatePhone(value) {
    return /^\+370 6\d{2} \d{5}$/.test(value);
  }

  function validateNotEmpty(value) {
    return value.trim() !== "";
  }

  // PHONE: +370 6xx xxxxx
  fields.phone.addEventListener("input", () => {
    let digits = fields.phone.value.replace(/\D/g, "");

    if (!digits.startsWith("370")) {
      digits = "370" + digits;
    }

    digits = digits.substring(0, 11);

    let formatted = "+370";

    if (digits.length > 3) formatted += " " + digits[3];
    if (digits.length > 4) formatted += digits[4] + digits[5];
    if (digits.length > 6) formatted += " " + digits.substring(6);

    fields.phone.value = formatted;

    validateField(fields.phone, validatePhone);
    checkFormValidity();
  });

  // ============================
  // VALIDATE SINGLE FIELD
  // ============================

  function validateField(input, validator) {
    const error = input.nextElementSibling;
    const value = input.value.trim();

    if (!validator(value)) {
      input.classList.add("input-error");
      input.classList.remove("input-valid");
      error.classList.add("active");
      return false;
    }

    input.classList.remove("input-error");
    input.classList.add("input-valid");
    error.classList.remove("active");
    return true;
  }

  // Attach validators
  fields.name.addEventListener("input", () => {
    validateField(fields.name, (v) => validateNotEmpty(v) && validateName(v));
    checkFormValidity();
  });

  fields.surname.addEventListener("input", () => {
    validateField(fields.surname, (v) => validateNotEmpty(v) && validateName(v));
    checkFormValidity();
  });

  fields.email.addEventListener("input", () => {
    validateField(fields.email, (v) => validateNotEmpty(v) && validateEmail(v));
    checkFormValidity();
  });

  fields.address.addEventListener("input", () => {
    validateField(fields.address, validateAddress);
    checkFormValidity();
  });

  fields.message.addEventListener("input", checkFormValidity);

  [fields.rating1, fields.rating2, fields.rating3].forEach((rating) => {
    rating.addEventListener("input", checkFormValidity);
  });

  // ENABLE / DISABLE SUBMIT WHEN THE FORM IS VALID
  function checkFormValidity() {
    const valid =
      validateField(fields.name, validateName) &&
      validateField(fields.surname, validateName) &&
      validateField(fields.email, validateEmail) &&
      validateField(fields.address, validateAddress) &&
      validatePhone(fields.phone.value);

    submitBtn.disabled = !valid;
    submitBtn.style.opacity = valid ? "1" : "0.6";
    submitBtn.style.pointerEvents = valid ? "auto" : "none";
  }

  checkFormValidity();

  // SUBMIT HANDLING
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const rating1 = Number(fields.rating1.value);
    const rating2 = Number(fields.rating2.value);
    const rating3 = Number(fields.rating3.value);
    const avg = Number(((rating1 + rating2 + rating3) / 3).toFixed(1));

    const formData = {
      name: fields.name.value,
      surname: fields.surname.value,
      email: fields.email.value,
      phone: fields.phone.value,
      address: fields.address.value,
      message: fields.message.value,
      rating1,
      rating2,
      rating3,
      average: avg,
    };

    console.log("Form data:", formData);

    resultsBox.innerHTML = `
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Surname:</strong> ${formData.surname}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone number:</strong> ${formData.phone}</p>
      <p><strong>Address:</strong> ${formData.address}</p>
      <p><strong>Rating 1:</strong> ${rating1}</p>
      <p><strong>Rating 2:</strong> ${rating2}</p>
      <p><strong>Rating 3:</strong> ${rating3}</p>
      <p><strong>Average:</strong> <span id="average-output">${avg}</span></p>
      <p><strong>${formData.name} ${formData.surname}:</strong> ${avg}</p>
    `;

    const avgSpan = document.getElementById("average-output");
    if (avg < 4) avgSpan.style.color = "red";
    else if (avg < 7) avgSpan.style.color = "orange";
    else avgSpan.style.color = "green";

    // Popup
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
  });
});
