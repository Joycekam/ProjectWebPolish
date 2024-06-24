const pageTitle = "JS SPA Routing";

const routes = {
  404: "404.html",
  "/": "index.html",
  section_1: "empty.html",
  section_2: "empty.html",
  write: "write/write.html",
  workshop: "workshop.html",
  forum: "forum/forum.html",
  howWrite: "how_to_write/how_to_write.html"
};

const locationHandler = async () => {
  const location = window.location.hash.replace("#", "");

  if (location.length === 0) {
    // Handle the case where no location is specified
    return;
  }

  const route = routes[location];

  if (!route) {
    console.error(`Route not found for location: ${location}`);
    const html = await fetch(routes[404]).then((response) => response.text());
    document.getElementById("content").innerHTML = html;
    return;
  }

  const html = await fetch(route).then((response) => response.text());
  document.getElementById("content").innerHTML = html;
  document.title = pageTitle; // Update title

  if (location === 'workshop') {
    initializeEditor();
  }
};

window.addEventListener("hashchange", locationHandler);
locationHandler();

function initializeEditor() {
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  if (document.querySelector(".essayType")) {
    nameWritingType.textContent = document.querySelector(".essayType").textContent;
  }

  textArea.addEventListener('click', function (){
    if (textArea.textContent.length < 21) {
      textArea.textContent = "";
      textArea.removeAttribute("style");
    }
  });

  function formatText(command, value = null) {
    document.execCommand(command, false, value);
  }

  toolbar.querySelectorAll(".format-button").forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.getAttribute("data-command");
      if (command === "insertImage") {
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) {
          formatText("insertImage", imageUrl);
        }
      } else {
        formatText(command);
      }
    });
  });

  colorPicker.addEventListener("change", function () {
    formatText("foreColor", this.value);
  });

  fontSizePicker.addEventListener("change", function () {
    formatText("fontSize", this.value);
  });

  document.querySelector(".save").addEventListener("click", function () {
    const content = textArea.innerHTML;
    saveEssay(content);
  });

  document.querySelector(".check").addEventListener("click", function () {
    const content = textArea.innerHTML;
    checkEssay(content);
  });

  async function saveEssay(content) {
    const response = await fetch('http://localhost:8080/api/essays/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Essay', content: content })
    });

    if (response.ok) {
      console.log('Essay saved successfully');
    } else {
      console.error('Failed to save essay');
    }
  }

  async function checkEssay(content) {
    const textContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    const response = await fetch('http://localhost:8080/api/essays/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences: [textContent] })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Received corrected text:", result.correctedText);
      displayCorrectedEssay(textContent, result.correctedText);
    } else {
      console.error('Failed to check essay');
    }
  }

  function displayCorrectedEssay(originalText, correctedText) {
    console.log("Corrected text:", correctedText);
    if (Array.isArray(correctedText) && correctedText.length > 0) {
      const correctedTextString = correctedText.join(" ");
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }
}
