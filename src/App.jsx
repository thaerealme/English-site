import React, { useState, useEffect } from "react";
import { translateWord, getWordsByLevel, getWordInfo, getRandomFacts } from "./services/yandexTranslate";

const GRAMMAR = [
  { title: "Present Simple", text: "Use for habits, general truths, repeated actions: I eat breakfast every day." },
  { title: "Past Simple", text: "Use for actions in the past: I went to the store yesterday." }
];

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

  // Test function to check if JS works
  useEffect(() => {
    console.log("App component loaded successfully!");
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#1f2937'
        }}>
          EngLex 🚀
        </h1>
        <p style={{ color: '#6b7280' }}>
          Practice English words and learn new facts!
        </p>
      </header>

      {/* LEVEL SELECT */}
      <section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <label style={{ marginRight: '8px', fontWeight: '600' }}>Your level:</label>
        <select 
          value={level} 
          onChange={(e) => setLevel(e.target.value)}
          style={{
            border: '1px solid #d1d5db',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option>B2</option>
        </select>
      </section>

      {/* TEST CONTENT */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Test Section
        </h2>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          maxWidth: '512px',
          margin: '0 auto'
        }}>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '8px'
          }}>
            <strong>Test Word:</strong> {quizWord || 'No word loaded'}
          </p>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type translation"
              style={{
                border: '1px solid #d1d5db',
                padding: '8px',
                borderRadius: '4px',
                width: '100%',
                marginBottom: '8px'
              }}
            />
            <button 
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Check
            </button>
          </div>

          {feedback && (
            <p style={{
              marginTop: '8px',
              fontWeight: '600',
              color: feedback.includes('✅') ? '#16a34a' : '#dc2626'
            }}>
              {feedback}
            </p>
          )}
        </div>
      </section>

      {/* FACTS */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Interesting Facts 🌍
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '160px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem'
            }}>
              🌍
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              Test Fact
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px'
            }}>
              This is a test fact to check if CSS and layout work correctly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}