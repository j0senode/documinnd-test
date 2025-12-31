const API_BASE = 'https://documind-backend-5fme.onrender.com';

const messagesEl = document.getElementById('messages');
const fileInput = document.getElementById('fileInput');
const userQuestion = document.getElementById('userQuestion');
const sendBtn = document.getElementById('sendBtn');

// Persist uploaded files and chat history for the current browser session
let sessionFiles = [];
let chatHistory = [];

function addMessage(text, sender) {
  const msgEl = document.createElement('div');
  msgEl.className = 'message ' + sender;
  msgEl.textContent = text;
  messagesEl.appendChild(msgEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files);
  const fileContents = await Promise.all(
    files.map(file =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, content: reader.result });
        reader.readAsText(file);
      })
    )
  );

  // Merge newly uploaded files with session files
  sessionFiles = [...sessionFiles, ...fileContents];

  // Reset input
  fileInput.value = '';
});

sendBtn.addEventListener('click', async () => {
  const question = userQuestion.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  chatHistory.push({ role: 'user', content: question });

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: sessionFiles,
        history: chatHistory,
        userMessage: question
      })
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);

    const data = await response.json();
    const aiText = data.text || 'No response from AI';
    addMessage(aiText, 'ai');
    chatHistory.push({ role: 'assistant', content: aiText });
  } catch (err) {
    console.error(err);
    addMessage('Error contacting AI backend.', 'ai');
  }

  userQuestion.value = '';
});
