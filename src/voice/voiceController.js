export const isSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const startListening = (onResult) => {
  if (!isSupported()) {
    console.error("Speech recognition not supported");
    return null;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';
  
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.toLowerCase();
    onResult(parseCommand(text));
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
  };
  
  recognition.start();
  return recognition;
};

export const stopListening = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

const parseCommand = (text) => {
  if (text.includes('deploy team')) return { action: 'deploy', target: 'team' };
  if (text.includes('show alerts')) return { action: 'navigate', target: 'alerts' };
  if (text.includes('show map')) return { action: 'navigate', target: 'map' };
  if (text.includes('get stats')) return { action: 'show', target: 'stats' };
  return { action: 'unknown', text };
};
