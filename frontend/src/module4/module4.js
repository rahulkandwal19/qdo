function playGame() {
    window.location.href = "game.html"; 
  }
  
  function startQuiz() {
    window.location.href = "quiz4.html";
  }
  
  const synth = window.speechSynthesis;
  
  const paragraphContents = [
    "Quantum code implementation involves using special programming frameworks to build and simulate quantum circuits. The most common tools include Qiskit (IBM), Cirq (Google), and Q# (Microsoft). In quantum programming, the first step is to define qubits, which are the basic units of quantum information. Then, quantum gates (like Hadamard, Pauli-X, or CNOT) are applied to manipulate the state of qubits. These operations form a quantum circuit that represents the algorithm.",
    "After constructing the circuit, it is executed on a simulator or quantum hardware, and the qubits are measured to obtain results in classical bits (0 or 1). Unlike classical code, quantum programs are probabilistic, so they must often be run multiple times to get accurate output. Quantum programming emphasizes linear algebra, especially matrix and vector operations, and often integrates classical post-processing to interpret results. This approach blends coding with deep concepts from quantum physics and math"
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
  