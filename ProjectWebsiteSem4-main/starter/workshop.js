document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  nameWritingType.textContent = document.querySelector(".essayType");

  textArea.addEventListener('click', function () {
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
    const textContent = `<pl> ${content.replace(/<\/?[^>]+(>|$)/g, "")}`; // Add <pl> prefix and remove HTML tags
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
      textArea.innerHTML = `${originalText} <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `${originalText} <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }
});
