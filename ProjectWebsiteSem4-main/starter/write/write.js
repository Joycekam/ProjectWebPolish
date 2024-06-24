window.onload = function() {
  const textField = document.getElementById('output');

  if (textField) {
    textField.contentDocument.designMode = 'on';
  } else {
    console.error('Could not find the iframe with the ID "output"');
  }

      const buttons = document.querySelectorAll('button');

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => {
          let cmd = buttons[i].getAttribute('data-cmd');
      if (buttons[i].name === "active") {
        buttons[i].classList.add('active');
      }

      if (cmd === "insertImage" || cmd === "createLink") {
        let url = prompt("Enter link here: ", "");
      }
    });
  }
}