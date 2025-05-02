function playGame() {
    window.location.href = "../game/game.html"; 
  }
  
  function startQuiz() {
    window.location.href = "quiz2.html";
  }
  
  const synth = window.speechSynthesis;
  
  const paragraphContents = [
    "Quantum gates are the fundamental operations used in quantum computing, similar to logic gates in classical computing. However, instead of working on bits (0 or 1), they operate on qubits, which can be in a superposition of states. Quantum gates manipulate qubits by changing their amplitudes and phases, and are represented mathematically by unitary matrices. These operations are reversible and maintain the total probability of the system.",
    "Common single-qubit gates include the Pauli-X gate (like a NOT gate), Hadamard gate (creates superposition), and Z gate (applies a phase shift). Multi-qubit gates like CNOT and Toffoli are used to create entanglement, a key quantum phenomenon.",
    "A quantum circuit is a sequence of these gates applied to one or more qubits to perform a computation. By combining gates in specific ways, we can create algorithms that solve problems more efficiently than classical computers."
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
  