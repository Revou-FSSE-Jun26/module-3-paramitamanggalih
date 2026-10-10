// Select DOM elements
const title = document.querySelector("#title");
const description = document.querySelector("#description");
const changeTextButton = document.querySelector("#change-text-btn");
const toggleButton = document.querySelector("#toggle-btn");
const addButton = document.querySelector("#add-btn");
const removeButton = document.querySelector("#remove-btn");
const itemList = document.querySelector("#item-list");
const contactForm = document.querySelector("#contact-form");
const visitorName = document.querySelector("#visitor-name");
const formMessage = document.querySelector("#form-message");

// Keep track of the dynamic item number
let itemCount = 3;

// Click event: update text content
changeTextButton.addEventListener("click", () => {
    title.textContent = "DOM Manipulation Is Working!";
    description.textContent =
        "The page content was updated using JavaScript DOM manipulation.";
});

// Click event: toggle a CSS class
toggleButton.addEventListener("click", () => {
    description.classList.toggle("highlight");
});

// Click event: create a new element
addButton.addEventListener("click", () => {
    itemCount += 1;

    const newItem = document.createElement("li");

    newItem.textContent = `New Item ${itemCount}`;

    itemList.appendChild(newItem);
});

// Click event: remove the last element
removeButton.addEventListener("click", () => {
    const lastItem = itemList.lastElementChild;

    if (lastItem) {
        lastItem.remove();

        if (itemCount > 3) {
            itemCount -= 1;
        }
    }
});

// Submit event: prevent default browser submission
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = visitorName.value.trim();

    if (name === "") {
        formMessage.textContent = "Please enter your name.";
        formMessage.style.color = "#dc2626";
        return;
    }

    formMessage.textContent = `Thanks, ${name}! Your form was submitted successfully.`;
    formMessage.style.color = "#15803d";

    contactForm.reset();
});