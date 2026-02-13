async function listGenerationModels() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing VITE_GEMINI_API_KEY in .env.local");
    return;
  }

  try {
    console.log("--- Checking v1beta for generateContent ---");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      data.models
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .forEach(m => {
          console.log(`- ${m.name}`);
        });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listGenerationModels();
