import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import PPTPreview from "./Ppt";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const chatBoxRef = useRef(null);

  
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages, isLoading]);

  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        { contents: [{ parts: [{ text: userMsg }] }] }
      );

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t generate a response.";

      setMessages((prev) => [...prev, { from: "ai", text: aiText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Something went wrong. Please try again!" },
      ]);
    }

    setIsLoading(false);
  };

  
const handlePreview = (text) => {
 
  const lines = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((line) => line.trim() !== "");

  const slidesArray = [];
  const LINES_PER_SLIDE = 4; 

  for (let i = 0; i < lines.length; i += LINES_PER_SLIDE) {
    const content = lines.slice(i, i + LINES_PER_SLIDE).join(" ");
    slidesArray.push({
      title: `Slide ${slidesArray.length + 1}`,
      content,
    });
  }

  setSlides(slidesArray);
  setShowPreview(true);
};



  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 text-gray-800">
      <div
        className={`flex bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-500 ${
          showPreview ? "w-[90%]" : "w-[60%]"
        } h-[80vh]`}
      >
       
        <div
          className={`flex flex-col transition-all duration-500 ${
            showPreview ? "w-1/2" : "w-full"
          } p-6`}
        >
          <h1 className="text-2xl font-semibold text-center mb-4">
            Hello, <span className="text-blue-600">piyuindia4!</span>
          </h1>

          <div className="flex flex-col flex-1 overflow-hidden">
            {messages.length ? (
              <div
                ref={chatBoxRef}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto mb-4"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-4 flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-[75%] relative ${
                        msg.from === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>

                      {msg.from === "ai" && (
                       <button
    onClick={() => handlePreview(msg.text)}
    className="absolute bottom-1 right-1 text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
    title="Open in PPT preview"
  >
    ➤ <span className="whitespace-nowrap">For slides click here</span>
  </button>
)}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center flex-1 text-gray-400">
                <p className="text-lg">Start with a topic!</p>
                <p className="text-sm">We’ll turn it into slides</p>
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="border border-gray-300 rounded-lg p-3 flex items-center gap-2"
            >
              <textarea
                className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-1 focus:ring-blue-400 resize-none text-sm"
                placeholder="Start with a topic ,we'll convert into slides"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                ➤
              </button>
            </form>
          </div>
        </div>

      
        {showPreview && (
          <div className="w-1/2 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <PPTPreview slides={slides} onClose={() => setShowPreview(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
