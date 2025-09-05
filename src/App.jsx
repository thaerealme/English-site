import React, { useState, useEffect } from "react";
import { translateWord, getWordsByLevel, getWordInfo, getRandomFacts } from "./services/yandexTranslate";

const GRAMMAR = [
  { title: "Present Simple", text: "Use for habits, general truths, repeated actions: I eat breakfast every day." },
  { title: "Past Simple", text: "Use for actions in the past: I went to the store yesterday." }
];

// ===== COMPONENT =====
export default function App() {
  const [level, setLevel] = useState("A1");
  const [wordsPool, setWordsPool] = useState([]);
  const [quizWord, setQuizWord] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentWordInfo, setCurrentWordInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facts, setFacts] = useState([]);
  const [factsLoading, setFactsLoading] = useState(false);

  // Load studied words from localStorage
  const getStudied = () => JSON.parse(localStorage.getItem("studiedWords") || "[]");
  const setStudied = (words) => localStorage.setItem("studiedWords", JSON.stringify(words));

  // Load facts from API
  useEffect(() => {
    const loadFacts = async () => {
      setFactsLoading(true);
      try {
        const randomFacts = await getRandomFacts(4);
        setFacts(randomFacts);
      } catch (error) {
        console.error("Error loading facts:", error);
        setFacts([
          { title: "Brain", text: "Your brain weighs about 1.4 kg and consumes 20% of your energy.", emoji: "🧠", img: null },
          { title: "Space", text: "The Milky Way galaxy contains over 100 billion stars.", emoji: "🌌", img: null }
        ]);
      } finally {
        setFactsLoading(false);
      }
    };
    
    loadFacts();
  }, []);

  // Load words by level, excluding already studied
  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      try {
        const studied = getStudied();
        const levelWords = getWordsByLevel(level);
        const availableWords = levelWords.filter(word => !studied.includes(word));
        
        if (availableWords.length > 0) {
          setWordsPool(availableWords);
          const firstWord = availableWords[0];
          setQuizWord(firstWord);
          
          // Получаем полную информацию о слове
          const wordInfo = await getWordInfo(firstWord);
          setCurrentWordInfo(wordInfo);
        } else {
          setWordsPool([]);
          setQuizWord(null);
          setCurrentWordInfo(null);
        }
      } catch (error) {
        console.error("Error loading words:", error);
        setFeedback("❌ Error loading words. Using fallback mode.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWords();
    setUserAnswer("");
    setShowTranslation(false);
    setFeedback("");
  }, [level]);

  const handleLevelChange = (e) => setLevel(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizWord || !currentWordInfo) return;

    const userAnswerLower = userAnswer.trim().toLowerCase();
    const acceptedAnswers = currentWordInfo.allAcceptedAnswers.map(ans => ans.toLowerCase());
    
    // Проверяем, совпадает ли ответ пользователя с любым из принятых вариантов
    const isCorrect = acceptedAnswers.some(accepted => 
      accepted.includes(userAnswerLower) || userAnswerLower.includes(accepted) ||
      // Также проверяем отдельные слова в многословных ответах
      accepted.split(/[,;]\s*/).some(variant => 
        variant.trim() === userAnswerLower ||
        userAnswerLower.split(/\s+/).some(userWord => userWord === variant.trim())
      )
    );

    if (isCorrect) {
      setFeedback("✅ Correct!");
      const studied = getStudied();
      setStudied([...studied, quizWord]);
      await nextWord();
    } else {
      setFeedback("❌ Try again!");
      setShowTranslation(true);
    }
  };

  const nextWord = async () => {
    const remaining = wordsPool.filter(w => w !== quizWord);
    setWordsPool(remaining);
    
    if (remaining.length > 0) {
      const nextWord = remaining[0];
      setQuizWord(nextWord);
      
      try {
        const wordInfo = await getWordInfo(nextWord);
        setCurrentWordInfo(wordInfo);
      } catch (error) {
        console.error("Error getting word info:", error);
        setCurrentWordInfo({
          word: nextWord,
          translation: getFallbackTranslation(nextWord),
          allAcceptedAnswers: [getFallbackTranslation(nextWord)]
        });
      }
    } else {
      setQuizWord(null);
      setCurrentWordInfo(null);
    }
    
    setUserAnswer("");
    setShowTranslation(false);
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">EngLex 🚀</h1>
        <p className="text-gray-600">Practice English words and learn new facts!</p>
      </header>

      {/* LEVEL SELECT */}
      <section className="mb-6 text-center">
        <label className="mr-2 font-semibold">Your level:</label>
        <select value={level} onChange={handleLevelChange} className="border px-2 py-1 rounded">
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option>B2</option>
        </select>
      </section>

      {/* QUIZ */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Practice Words</h2>
        {isLoading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading words...</p>
          </div>
        ) : quizWord ? (
          <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
            <p className="text-xl mb-2"><strong>Word:</strong> {quizWord}</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type translation"
                className="border p-2 rounded w-full mb-2"
                disabled={isLoading}
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
                {isLoading ? "Loading..." : "Check"}
              </button>
            </form>

            {feedback && <p className="mt-2 font-semibold">{feedback}</p>}

            {showTranslation && currentWordInfo && (
              <div className="mt-4">
                <p className="font-semibold">Translation:</p>
                <p className="text-gray-700">{currentWordInfo.translation}</p>
                {currentWordInfo.synonyms && currentWordInfo.synonyms.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Synonyms: {currentWordInfo.synonyms.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center font-semibold text-gray-700">🎉 No more words to study at this level!</p>
        )}
      </section>

      {/* FACTS */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Interesting Facts 🌍</h2>
        {factsLoading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading facts...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {facts.map((f, i) => (
              <div key={i} className="bg-white rounded shadow p-4 flex flex-col items-center">
                <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                  {f.img ? (
                    <img 
                      src={f.img} 
                      alt={f.title} 
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                            <span class="text-4xl">${f.emoji || '🌍'}</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                      <span className="text-4xl">{f.emoji || '🌍'}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-gray-700 text-center text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Кнопка для обновления фактов */}
        <div className="text-center mt-6">
          <button 
            onClick={async () => {
              setFactsLoading(true);
              try {
                const newFacts = await getRandomFacts(4);
                setFacts(newFacts);
              } catch (error) {
                console.error("Error refreshing facts:", error);
              } finally {
                setFactsLoading(false);
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            disabled={factsLoading}
          >
            {factsLoading ? "Loading..." : "🔄 Load New Facts"}
          </button>
        </div>
      </section>

      {/* GRAMMAR */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Grammar 📚</h2>
        <div className="space-y-4">
          {GRAMMAR.map((g, i) => (
            <div key={i} className="bg-white rounded shadow p-4">
              <h3 className="font-bold">{g.title}</h3>
              <p className="text-gray-700">{g.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const getFallbackTranslation = (word) => {
  const fallbackTranslations = {
    "run": "бегать",
    "go": "идти", 
    "come": "приходить",
    "see": "видеть",
    "look": "смотреть",
    "make": "делать",
    "take": "брать",
    "get": "получать",
    "give": "давать",
    "know": "знать",
    "think": "думать",
    "say": "сказать",
    "find": "находить",
    "want": "хотеть",
    "use": "использовать",
    "work": "работать",
    "call": "звонить",
    "try": "пытаться",
    "need": "нуждаться",
    "feel": "чувствовать",
    "good": "хороший",
    "bad": "плохой",
    "big": "большой",
    "small": "маленький",
    "happy": "счастливый",
    "sad": "грустный",
    "hot": "горячий",
    "cold": "холодный",
    "young": "молодой",
    "old": "старый",
    "long": "длинный",
    "short": "короткий",
    "new": "новый",
    "man": "мужчина",
    "woman": "женщина",
    "child": "ребенок",
    "day": "день",
    "night": "ночь",
    "time": "время",
    "year": "год",
    "week": "неделя",
    "home": "дом",
    "school": "школа",
    "job": "работа",
    "life": "жизнь",
    "money": "деньги",
    "friend": "друг",
    "people": "люди",
    "country": "страна",
    "city": "город",
    "place": "место",
    "water": "вода",
    "food": "еда"
  };

  return fallbackTranslations[word] || `${word} (перевод не найден)`;
};