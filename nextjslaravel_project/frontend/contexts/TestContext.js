import { createContext, useContext, useState, useEffect } from 'react';

const TestContext = createContext();

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

export const TestProvider = ({ children }) => {
  const [currentTest, setCurrentTest] = useState(null);
  const [testProgress, setTestProgress] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('testProgress');
    if (savedProgress) {
      setTestProgress(JSON.parse(savedProgress));
    }
  }, []);

  const saveProgress = (testId, questionIndex, answer, timeLeft) => {
    const progress = {
      ...testProgress,
      [testId]: {
        currentQuestion: questionIndex,
        answers: {
          ...testProgress[testId]?.answers,
          [questionIndex]: answer
        },
        timeRemaining: timeLeft,
        lastUpdated: Date.now()
      }
    };
    
    setTestProgress(progress);
    localStorage.setItem('testProgress', JSON.stringify(progress));
  };

  const getTestProgress = (testId) => {
    return testProgress[testId] || {
      currentQuestion: 0,
      answers: {},
      timeRemaining: 0,
      lastUpdated: null
    };
  };

  const completeTest = (testId) => {
    const progress = { ...testProgress };
    if (progress[testId]) {
      progress[testId].completed = true;
      progress[testId].completedAt = Date.now();
    }
    setTestProgress(progress);
    localStorage.setItem('testProgress', JSON.stringify(progress));
  };

  const clearTestProgress = (testId) => {
    const progress = { ...testProgress };
    delete progress[testId];
    setTestProgress(progress);
    localStorage.setItem('testProgress', JSON.stringify(progress));
  };

  return (
    <TestContext.Provider value={{
      currentTest,
      setCurrentTest,
      testProgress,
      saveProgress,
      getTestProgress,
      completeTest,
      clearTestProgress,
      timeRemaining,
      setTimeRemaining
    }}>
      {children}
    </TestContext.Provider>
  );
};
