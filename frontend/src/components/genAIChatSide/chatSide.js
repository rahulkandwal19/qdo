document.addEventListener("DOMContentLoaded",addSideChatSection());

function addSideChatSection(){
  var div = document.createElement("div");
  div.id = "chatSection";

  div.innerHTML = ` 
                  <button id="menuBtn">⬅</button>
                  <div id="genaiChatMenu" class="side-menu">  

          <div class="col-md-12 col-lg-12 col-xl-12" >
          <div class="card" style="border-top: 4px solid #344966;">
            <div class="card-header d-flex justify-content-between align-items-center p-3"
              style="border-top: 4px solid">
              <h5 class="mb-0" style="color:black"> Prof. QDo</h5>
              <div class="d-flex flex-row align-items-center">
              </div>
            </div>
            <div id = "chatTextArea" class="card-body data-mdb-perfect-scrollbar-init overflowy-scroll" style="display:block; position: relative; height: 650px; colour: #b4cded; overflow-y: auto; background-color:#aaabb1;">
              
              <div class="d-flex flex-row justify-content-start">
                <img src="../../public/profChatImage.png"
                  alt="avatar 1" style="width: 45px; height: 100%;">
                <div>
                  <p class="small p-2 ms-3 mb-3 rounded-3 bg-body-tertiary" style="color:black">
                    Hello ! Myself Prof. QDo, I am a GenAI  powered bot to guide you in your Quanum Computing Journy.</p>
                </div>
              </div>

            </div>
            <div class="card-footer text-muted d-flex justify-content-start align-items-center p-3">
              <div class="input-group mb-0">
                <input id="askTextBox" type="text" class="form-control" placeholder="Type message"
                  aria-label="Recipient's username" aria-describedby="button-addon2" />
                <button data-mdb-button-init data-mdb-ripple-init id = "askButton" class="btn" type="button" id="button-addon2" style="padding-top: .55rem; background-color:#344966; color:#FFFF" onclick=sendQuery()>
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
                  </div>
                  `
  document.body.appendChild(div);
}

const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('genaiChatMenu');
let isMenuOpen = false;

menuBtn.addEventListener('click', () => {
  sideMenu.classList.toggle('show');
  isMenuOpen = !isMenuOpen;
  menuBtn.innerHTML = isMenuOpen ? '➡' : '⬅';
});



function addMessageCardUser(message){
  console.log("I am in addMessage");
  console.log(message);
  messageCard = '<div class="d-flex flex-row justify-content-end mb-4 pt-1"><div><p class="small p-2 me-3 mb-3 text-white rounded-3" style="background-color:#344966;">'
                  +message + 
                '</p></div><img src="../../public/studentChatImage.png"alt="avatar 1" style="width: 45px; height: 100%;"></div>'

  document.getElementById("chatTextArea").innerHTML+=messageCard;

  responseCard = `<div class="d-flex flex-row justify-content-start">
                  <img src="../../public/profChatImage.png"
                    alt="avatar 1" style="width: 45px; height: 100%;">
                  <div>
                    <p class="small p-2 ms-3 mb-3 rounded-3 bg-body-tertiary" style="color:black">
                      Sure , Give me one minute.</p>
                  </div>
                </div>`
  document.getElementById("chatTextArea").innerHTML+=responseCard;

}

function addMessageCardResponse(message){
  responseCard = '<div class="d-flex flex-row justify-content-start"><img src="../../public/profChatImage.png"alt="avatar 1" style="width: 45px; height: 100%;"><div><p class="small p-2 ms-3 mb-3 rounded-3 bg-body-tertiary" style="color:black">'
                    +message+
                  '</p></div></div>'
  document.getElementById("chatTextArea").innerHTML+=responseCard;
}

function sendQuery(){
  text = document.getElementById("askTextBox").value;
  addMessageCardUser(text);
  
  fetch("http://127.0.0.1:5000/generate?question="+text).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Something went wrong');
  })
  .then((responseJson) => {
    console.log(responseJson);
    addMessageCardResponse(responseJson[0]["generated_text"]);
  })
  .catch((error) => {
    console.log(error);
    addMessageCardResponse("Oh! Error, Prof. QDo is Having Fun With friends they too have friends come back later.")
  });

}
