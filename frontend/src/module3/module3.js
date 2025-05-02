function playGame() {
    window.location.href = "game.html"; 
  }
  
  function startQuiz() {
    window.location.href = "quiz3.html";
  }
  
  const synth = window.speechSynthesis;
  
  const paragraphContents = [
    "Several well-known quantum algorithms showcase the unique power of quantum computing. Shor’s Algorithm is used for factoring large numbers exponentially faster than classical algorithms, posing a potential threat to current encryption methods. Grover’s Algorithm provides a quadratic speedup for searching unsorted databases, making it valuable for optimization and search problems.",
    "The Quantum Fourier Transform (QFT) is a core part of many algorithms, enabling tasks like phase estimation and hidden subgroup identification. Deutsch-Jozsa Algorithm was one of the first to show a clear quantum advantage by determining whether a function is constant or balanced with just one evaluation. Variational Quantum Eigensolver (VQE) and Quantum Approximate Optimization Algorithm (QAOA) are hybrid algorithms that combine classical and quantum techniques for solving problems in chemistry and optimization. These implementations demonstrate how quantum systems can tackle problems that are classically intractable by using superposition, entanglement, and interference."
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
  