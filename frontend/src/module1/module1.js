function playGame() {
    window.location.href = "game.html"; 
  }
  
  function startQuiz() {
    window.location.href = "quiz1.html";
  }
  
  const synth = window.speechSynthesis;
  
  const paragraphContents = [
    "Quantum computing is built on principles from both quantum physics and linear algebra. In physics, key concepts include qubits and superposition, where a qubit can exist in a combination of 0 and 1 at the same time. Entanglement allows qubits to be linked, so the state of one instantly affects the other, even at a distance. Interference is used to enhance correct outcomes in quantum algorithms, while measurement collapses a qubit into a definite state probabilistically.",
    "From mathematics, linear algebra plays a central role: qubits are represented as vectors, and quantum gates are unitary matrices applied through matrix multiplication. Multi-qubit systems are modeled using tensor products. Quantum states use complex numbers to represent probability amplitudes, and the square of the magnitude gives the likelihood of each outcome. Dirac notation (like ∣0⟩ and ∣ψ⟩) simplifies state representation. Advanced concepts like eigenvalues and eigenvectors help explain measurements and system behavior."
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
  