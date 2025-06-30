const API_ENDPOINT="/api/chat";
const chatBox=document.getElementById("chat-box"), userInput=document.getElementById("user-input");
document.getElementById("send-btn").onclick=async()=>{
  const text=userInput.value.trim();
  if(!text)return;
  chatBox.innerHTML+=`<p><strong>You:</strong> ${text}</p>`;
  userInput.value="";
  try{
    const res=await fetch(API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
    const data=await res.json();
    chatBox.innerHTML+=`<p><strong>Thinki AI:</strong> ${data.reply}</p>`;
  }catch{
    chatBox.innerHTML+=`<p><strong>Thinki AI:</strong> Error retrieving response.</p>`;
  }
};
document.getElementById("download-btn").onclick=()=>{const blob=new Blob([chatBox.innerText],{type:"text/plain"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="ThinkiChat.txt";link.click();};
document.getElementById("tools-btn").onclick=()=>alert("Tools coming soon!");
document.getElementById("mic-btn").onclick=()=>alert("Voice input coming soon!");