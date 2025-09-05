// Translation Service with multiple APIs
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';
const WORDS_API_URL = 'https://api.datamuse.com/words';
const FACTS_API_URL = 'https://uselessfacts.jsph.pl/random.json?language=en';
const NUMBERS_API_URL = 'http://numbersapi.com/random/trivia?json';

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
    const response = await fetch(`${WORDS_API_URL}?rel_syn=${word}&max=5`);
    const data = await response.json();
    return data.map(item => item.word);
  } catch (error) {
    console.log('Error getting synonyms:', error);
    return [];
  }
};

// Получить различные формы слова (для глаголов)
const getWordForms = async (word) => {
  try {
    const response = await fetch(`${WORDS_API_URL}?rel_spc=${word}&max=5`);
    const data = await response.json();
    return data.map(item => item.word);
  } catch (error) {
    console.log('Error getting word forms:', error);
    return [];
  }
};

// Перевести слово с английского на русский
export const translateWord = async (word) => {
  try {
    console.log('Translating word:', word);

    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        q: word,
        source: 'en',
        target: 'ru',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.translatedText) {
      return data.translatedText;
    } else {
      throw new Error('No translation received from API');
    }
  } catch (error) {
    console.error('Translation error:', error);
    return getFallbackTranslation(word);
  }
};

// Получить полную информацию о слове (перевод + синонимы + формы)
export const getWordInfo = async (word) => {
  try {
    const [translation, synonyms, forms] = await Promise.all([
      translateWord(word),
      getSynonyms(word),
      getWordForms(word)
    ]);

    // Получить переводы для синонимов
    const synonymTranslations = [];
    for (const synonym of synonyms.slice(0, 3)) {
      try {
        const synTranslation = await translateWord(synonym);
        synonymTranslations.push(synTranslation);
      } catch (error) {
        console.log('Error translating synonym:', synonym);
      }
    }

    // Получить переводы для различных форм
    const formTranslations = [];
    for (const form of forms.slice(0, 3)) {
      try {
        const formTranslation = await translateWord(form);
        formTranslations.push(formTranslation);
      } catch (error) {
        console.log('Error translating form:', form);
      }
    }

    // Создаем расширенный список принятых ответов
    const allVariations = [
      translation,
      ...synonymTranslations,
      ...formTranslations,
      ...getWordVariations(translation),
      ...synonymTranslations.flatMap(syn => getWordVariations(syn))
    ];

    // Добавляем дополнительные распространенные формы
    const commonVariations = getCommonVariations(word, translation);
    allVariations.push(...commonVariations);

    return {
      word,
      translation,
      synonyms,
      synonymTranslations,
      forms,
      allAcceptedAnswers: [...new Set(allVariations.filter(Boolean))]
    };
  } catch (error) {
    console.error('Error getting word info:', error);
    const fallback = getFallbackTranslation(word);
    return {
      word,
      translation: fallback,
      synonyms: [],
      synonymTranslations: [],
      forms: [],
      allAcceptedAnswers: [fallback, ...getWordVariations(fallback), ...getCommonVariations(word, fallback)].filter(Boolean)
    };
  }
};

// Получить различные формы русского слова
const getWordVariations = (russianWord) => {
  const variations = [russianWord];
  
  // Простые правила для генерации форм (для глаголов)
  if (russianWord.endsWith('ать')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'аю', stem + 'аешь', stem + 'ает', stem + 'аем', stem + 'аете', stem + 'ают');
  }
  
  if (russianWord.endsWith('ить')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'ю', stem + 'ишь', stem + 'ит', stem + 'им', stem + 'ите', stem + 'ят');
    // Также добавляем совершенный вид для некоторых глаголов
    if (russianWord === 'находить') {
      variations.push('найти', 'нашел', 'нашла', 'нашли', 'найди');
    }
    if (russianWord === 'искать') {
      variations.push('ищу', 'ищешь', 'ищет', 'ищем', 'ищете', 'ищут');
    }
  }
  
  if (russianWord.endsWith('еть')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'жу', stem + 'дишь', stem + 'дит', stem + 'дим', stem + 'дите', stem + 'дят');
  }
  
  if (russianWord.endsWith('уть') || russianWord.endsWith('очь')) {
    const stem = russianWord.slice(0, -3);
    variations.push(stem + 'гу', stem + 'жешь', stem + 'жет', stem + 'жем', stem + 'жете', stem + 'гут');
  }
  
  // Специальные правила для распространенных слов
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
  
  // Убираем дубликаты
  return [...new Set(variations)];
};

// Генерация форм прошедшего времени
const generatePastTense = (verb) => {
  const forms = [];
  
  // Для глаголов мужского рода
  if (verb.endsWith('ть') || verb.endsWith('ти')) {
    const stem = verb.slice(0, -2);
    forms.push(stem + 'л'); // сделал
  } else if (verb.endsWith('чь')) {
    const stem = verb.slice(0, -2);
    forms.push(stem + 'г'); // мочь -> мог
  }
  
  return forms;
};

// Дополнительные распространенные формы для конкретных слов
const getCommonVariations = (englishWord, russianTranslation) => {
  const commonForms = {
    'find': ['находить', 'найти', 'нашел', 'нашла', 'нашли', 'найди', 'ищу', 'ищешь', 'ищет', 'искать', 'отыскать', 'отыскивать'],
    'give': ['давать', 'дать', 'дал', 'дала', 'дали', 'дай', 'даю', 'даешь', 'дает'],
    'take': ['брать', 'взять', 'взял', 'взяла', 'взяли', 'возьми', 'беру', 'берешь', 'берет'],
    'make': ['делать', 'сделать', 'сделал', 'сделала', 'сделали', 'делаю', 'делаешь', 'делает'],
    'go': ['идти', 'пойти', 'шел', 'шла', 'шли', 'иди', 'иду', 'идешь', 'идет', 'ехать', 'уехать'],
    'come': ['приходить', 'прийти', 'пришел', 'пришла', 'пришли', 'приди', 'прихожу', 'приходишь', 'приходит'],
    'see': ['видеть', 'увидеть', 'увидел', 'увидела', 'увидели', 'вижу', 'видишь', 'видит'],
    'look': ['смотреть', 'посмотреть', 'посмотрел', 'посмотрела', 'посмотрели', 'смотрю', 'смотришь', 'смотрит', 'выглядеть'],
    'work': ['работать', 'поработать', 'работаю', 'работаешь', 'работает', 'работа'],
    'think': ['думать', 'подумать', 'думаю', 'думаешь', 'думает', 'подумай'],
    'know': ['знать', 'узнать', 'знаю', 'знаешь', 'знает', 'узнал', 'узнала', 'узнали'],
    'want': ['хотеть', 'захотеть', 'хочу', 'хочешь', 'хочет', 'хотел', 'хотела', 'хотели'],
    'need': ['нуждаться', 'понадобиться', 'нужен', 'нужна', 'нужно', 'нужны', 'нуждаюсь', 'нуждаешься', 'нуждается'],
    'feel': ['чувствовать', 'почувствовать', 'чувствую', 'чувствуешь', 'чувствует', 'почувствовал', 'почувствовала'],
    'try': ['пытаться', 'попробовать', 'пытаюсь', 'пытаешься', 'пытается', 'попробуй', 'попробовал', 'попробовала'],
    'call': ['звонить', 'позвонить', 'звоню', 'звонишь', 'звонит', 'позвони', 'позвонил', 'позвонила']
  };

  return commonForms[englishWord] || [];
};

// Получить случайный факт
export const getRandomFact = async () => {
  try {
    const response = await fetch(FACTS_API_URL);
    const data = await response.json();
    return {
      title: "Random Fact",
      text: data.text,
      emoji: "🤔",
      img: null
    };
  } catch (error) {
    console.log('Error getting random fact:', error);
    return getFallbackFact();
  }
};

// Получить факт о числах
export const getNumberFact = async () => {
  try {
    const response = await fetch(NUMBERS_API_URL);
    const data = await response.json();
    return {
      title: "Number Fact",
      text: data.text,
      emoji: "🔢",
      img: null
    };
  } catch (error) {
    console.log('Error getting number fact:', error);
    return getFallbackFact();
  }
};

// Получить несколько фактов
export const getRandomFacts = async (count = 4) => {
  const facts = [];
  
  for (let i = 0; i < count; i++) {
    try {
      // Чередуем разные типы фактов
      const fact = i % 2 === 0 ? await getRandomFact() : await getNumberFact();
      facts.push(fact);
      
      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log('Error getting fact:', error);
      facts.push(getFallbackFact());
    }
  }
  
  return facts;
};

// Fallback факты на случай если API не работает
const getFallbackFact = () => {
  const fallbackFacts = [
    {
      title: "Ocean Depth",
      text: "The deepest part of the ocean is the Mariana Trench, which reaches about 11 kilometers deep.",
      emoji: "🌊",
      img: null
    },
    {
      title: "Lightning",
      text: "Lightning strikes the Earth about 100 times per second, or 8.6 million times per day.",
      emoji: "⚡",
      img: null
    },
    {
      title: "Honey",
      text: "Honey never spoils. Archaeologists have found edible honey in Egyptian tombs over 3,000 years old.",
      emoji: "🍯",
      img: null
    },
    {
      title: "Octopus",
      text: "Octopuses have three hearts and blue blood. Two hearts pump blood through the gills, and one pumps it through the body.",
      emoji: "🐙",
      img: null
    },
    {
      title: "DNA",
      text: "If you stretched out all the DNA in your body, it would reach to the Sun and back over 600 times.",
      emoji: "🧬",
      img: null
    },
    {
      title: "Tongue",
      text: "Your tongue is made up of eight interwoven muscles, and it's the only muscle in your body that works alone.",
      emoji: "👅",
      img: null
    }
  ];
  
  return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
};

// Перевести несколько слов одновременно
export const translateWords = async (words) => {
  try {
    const translations = [];

    for (const word of words.slice(0, 10)) {
      const translation = await translateWord(word);
      translations.push(translation);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    throw error;
  }
};

// Fallback переводы для основных слов
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
    "work": "работа",
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