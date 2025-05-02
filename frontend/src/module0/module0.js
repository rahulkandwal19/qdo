function playGame() {
  window.location.href = "game.html"; 
}

function startQuiz() {
  window.location.href = "quiz0.html";
}

const synth = window.speechSynthesis;

const paragraphContents = [
  "A qubit is the basic unit of information in quantum computing. Unlike a regular computer bit, which can only be 0 or 1, a qubit can be in both states at the same time. This property is called superposition. Because of superposition, quantum computers can perform many calculations at once, making them powerful for certain tasks. A qubit is described using complex numbers, and when we measure it, the qubit chooses one state — either 0 or 1 — based on probabilities. This is very different from classical computers, where the result is always certain and fixed.",
  "Let’s take a real-life example, Imagine flipping a coin and letting it spin in the air. While it spins, it’s not just heads or tails — it’s in a mixture of both. Only when you catch and look at it does it become one or the other. A qubit works the same way: it's in both 0 and 1 until you measure it."
];

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}

function typeAndSpeakParagraphs(container) {
  let index = 0;

  function processNext() {
    if (index >= paragraphContents.length) return;

    const p = document.createElement("p");
    container.appendChild(p);
    const fullText = paragraphContents[index];
    let charIndex = 0;

    speakText(fullText); // Start speaking immediately

    function typeWriter() {
      if (charIndex < fullText.length) {
        p.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 20);
      } else {
        index++;
        setTimeout(processNext, 500);
      }
    }

    typeWriter();
  }

  processNext();
}

window.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".module-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });

  const contentContainer = document.getElementById("text-container");
  typeAndSpeakParagraphs(contentContainer);
});

window.addEventListener("beforeunload", () => {
  if (synth.speaking) {
    synth.cancel();
  }
});
