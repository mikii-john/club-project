🏨 Grand Horizon Hotel: Project Presentation

This document serves as your complete script and guide for presenting the Grand Horizon Hotel project.

🎙️ Slide 1: Introduction

Speaker Notes:
"Welcome everyone. Today I'm excited to present Grand Horizon Hotel, a modern luxury hotel platform that bridge the gap between premium hospitality and cutting-edge Artificial Intelligence. Our goal was to create more than just a booking site—we built an interactive ecosystem for the modern traveler."

🏗️ Slide 2: The Modern Tech Stack

Speaker Notes:
"To deliver a premium experience, we used a 'best-of-breed' tech stack:

Frontend: React & TypeScript for a type-safe, scalable UI.
Styling: Tailwind CSS for a custom, responsive design system.
Backend: Supabase for real-time authentication and database management.
Intelligence: Google Gemini AI integrated with a Vector Database for smart guest assistance."

🤖 Slide 3: The Star Feature: AI Concierge (RAG)

Speaker Notes:
"The heart of Grand Horizon is our AI Concierge. Unlike generic bots, this uses RAG (Retrieval-Augmented Generation).

It doesn't just guess; it searches our private hotel knowledge base first.
If you ask about pool hours or room service, it finds the exact data in our Supabase Vector DB and generates a polite, 'brand-aware' response using Gemini."

🌓 Slide 4: User Experience & Design

Speaker Notes:
"A luxury hotel deserves a luxury interface.

We implemented a seamless Dark Mode for evening browsing.
Used Reveal Animations to make the content feel alive as you scroll.
The site is fully responsive, ensuring guests can book from their laptop or phone seamlessly."


📈 Slide 5: Conclusion & Future

Speaker Notes:
"Grand Horizon Hotel shows how AI can transform the hospitality industry. In the future, we plan to integrate direct booking APIs and personalized room recommendations based on guest history. Thank you for your time!"

🛠️ Technical Deep-Dive (For Q&A)

How RAG Works in our Code:

1. User asks a question in [ChatBot.tsx].
2. Embedding Generation: We turn that question into numbers (vectors) in [geminiService.ts].
3. Vector Search: We ask Supabase to find the most similar text in our hotel docs.
4. Augmented Prompt: We send the Question + Found Context to Gemini.
5. Final Answer: Gemini answers based only on the context provided.
