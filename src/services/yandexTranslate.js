// Translation Service compatible with GitHub Pages
const MY_MEMORY_API = 'https://api.mymemory.translated.net/get';

// Получить список слов по уровню
export const getWordsByLevel = (level) => {
  const words = {
    A1: ["run", "go", "come", "see", "look", "make", "take", "get", "give", "know", "think", "say", "find", "want", "use", "work", "call", "try", "need", "feel", "good", "bad", "big", "small", "happy", "sad", "hot", "cold", "young", "old", "long", "short", "new", "man", "woman", "child", "day", "night", "time", "year", "week", "home", "school", "work", "life", "money", "friend", "people", "country", "city", "place", "water", "food"],
    A2: ["weekend", "beautiful", "important", "interesting", "difficult", "easy", "possible", "impossible", "necessary", "dangerous", "expensive", "cheap", "healthy", "ill", "tired", "hungry", "thirsty", "busy", "free", "ready", "sure", "afraid", "angry", "excited", "surprised", "worried", "bored", "interested", "proud", "shy"],
    B1: ["environment", "technology", "communication", "education", "healthcare", "transportation", "entertainment", "politics", "economy", "culture", "history", "science", "nature", "society", "future", "success", "failure", "opportunity", "challenge", "experience"],
    B2: ["sustainable", "innovation", "globalization", "artificial intelligence", "climate change", "digital transformation", "entrepreneurship", "leadership", "collaboration", "creativity", "critical thinking", "problem solving", "decision making", "time management", "stress management"]
  };
  
  return words[level] || [];
};

// Получить синонимы и связанные слова
const getSynonyms = async (word) => {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=3`);
    const data = await response.json();
    return data.map(item => item.word);
  } catch (error) {
    console.log('Synonyms API failed');
    return [];
  }
};

// Перевести слово с английского на русский
export const translateWord = async (word) => {
  try {
    console.log('Translating word:', word);

    // Используем MyMemory API без CORS проблем
    const response = await fetch(`${MY_MEMORY_API}?q=${encodeURIComponent(word)}&langpair=en|ru`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
    
    // Fallback если API не работает
    return getFallbackTranslation(word);
    
  } catch (error) {
    console.error('Translation error:', error);
    return getFallbackTranslation(word);
  }
};

// Получить полную информацию о слове
export const getWordInfo = async (word) => {
  try {
    const [translation, synonyms] = await Promise.all([
      translateWord(word),
      getSynonyms(word)
    ]);

    // Создаем расширенный список принятых ответов
    const allVariations = [
      translation,
      ...getWordVariations(translation)
    ];

    return {
      word,
      translation,
      synonyms,
      allAcceptedAnswers: [...new Set(allVariations.filter(Boolean))]
    };
  } catch (error) {
    console.error('Error getting word info:', error);
    const fallback = getFallbackTranslation(word);
    return {
      word,
      translation: fallback,
      synonyms: [],
      allAcceptedAnswers: [fallback, ...getWordVariations(fallback)].filter(Boolean)
    };
  }
};

// Получить различные формы русского слова
const getWordVariations = (russianWord) => {
  const variations = [russianWord];
  
  // Простые правила для генерации форм
  if (russianWord.endsWith('ать')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'аю', stem + 'аешь', stem + 'ает');
  }
  
  if (russianWord.endsWith('ить')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'ю', stem + 'ишь', stem + 'ит');
    if (russianWord === 'находить') {
      variations.push('найти', 'нашел', 'нашла', 'нашли', 'найди');
    }
    if (russianWord === 'искать') {
      variations.push('ищу', 'ищешь', 'ищет');
    }
  }
  
  // Специальные правила
  const specialRules = {
    'находить': ['найти', 'нашел', 'нашла', 'нашли', 'найди', 'ищу', 'ищешь', 'ищет', 'искать'],
    'давать': ['дать', 'дал', 'дала', 'дали', 'дай'],
    'брать': ['взять', 'взял', 'взяла', 'взяли', 'возьми'],
    'делать': ['сделать', 'сделал', 'сделала', 'сделали'],
    'говорить': ['сказать', 'сказал', 'сказала', 'сказали', 'скажи'],
    'идти': ['пойти', 'шел', 'шла', 'шли', 'иди'],
    'приходить': ['прийти', 'пришел', 'пришла', 'пришли', 'приди'],
    'бегать': ['бежать', 'бежал', 'бежала', 'бежали', 'беги'],
    'работать': ['поработать'],
    'звонить': ['позвонить', 'позвони'],
    'пытаться': ['попробовать', 'попробуй'],
    'нуждаться': ['нужен', 'нужна', 'нужно', 'нужны']
  };
  
  if (specialRules[russianWord]) {
    variations.push(...specialRules[russianWord]);
  }
  
  return [...new Set(variations)];
};

// Получить случайный факт
export const getRandomFact = async () => {
  const fallbackFacts = [
    { title: "Brain", text: "Your brain weighs about 1.4 kg and consumes 20% of your energy.", emoji: "🧠" },
    { title: "Space", text: "The Milky Way galaxy contains over 100 billion stars.", emoji: "🌌" },
    { title: "Honey", text: "Honey never spoils. Archaeologists have found edible honey in Egyptian tombs over 3,000 years old.", emoji: "🍯" },
    { title: "Lightning", text: "Lightning strikes the Earth about 100 times per second.", emoji: "⚡" }
  ];
  
  return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
};

// Получить факт о числах
export const getNumberFact = async () => {
  const fallbackFacts = [
    { title: "Number Fact", text: "The number 1 is the only number that is neither prime nor composite.", emoji: "🔢" },
    { title: "Math Fact", text: "A circle has 360 degrees.", emoji: "📐" }
  ];
  
  return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
};

// Получить несколько фактов
export const getRandomFacts = async (count = 4) => {
  const facts = [];
  
  for (let i = 0; i < count; i++) {
    const fact = i % 2 === 0 ? await getRandomFact() : await getNumberFact();
    facts.push(fact);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return facts;
};

// Fallback переводы
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