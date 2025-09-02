
import { GoogleGenAI } from "@google/genai";
import { Scenario, UserActions, ActionItem } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generatePrompt = (scenario: Scenario, userActions: UserActions): string => {
  const formatActions = (actions: ActionItem[], category: string) => {
    if (actions.length === 0) return `Не проводился.`;
    return actions.map(a => `- ${a.text} (${a.isCorrect ? 'Правильно' : 'Неверно/Избыточно'})`).join('\n');
  };

  const findMissedActions = (allActions: ActionItem[], performedActions: ActionItem[]) => {
    const performedIds = new Set(performedActions.map(a => a.id));
    return allActions
      .filter(a => a.isCorrect && !performedIds.has(a.id))
      .map(a => `- ${a.text}`)
      .join('\n');
  };

  const missedAnamnesis = findMissedActions(scenario.anamnesis, userActions.anamnesis);
  const missedExamination = findMissedActions(scenario.examination, userActions.examination);
  const missedTests = findMissedActions(scenario.tests, userActions.tests);

  return `
Ты — опытный врач-терапевт и преподаватель в медицинском вузе. Твоя задача — оценить действия студента в симуляторе клинического мышления. Проанализируй следующий протокол и дай развернутую, конструктивную обратную связь в формате Markdown.

**Клинический случай:** ${scenario.title}
**Жалобы пациента:** ${scenario.initialComplaint}
**Профиль пациента:** ${scenario.patientProfile}

---

### **Действия студента:**

**Сбор анамнеза:**
${formatActions(userActions.anamnesis, 'анамнез')}
${missedAnamnesis ? `\n**Пропущенные важные вопросы:**\n${missedAnamnesis}` : ''}

**Физикальный осмотр:**
${formatActions(userActions.examination, 'осмотр')}
${missedExamination ? `\n**Пропущенные важные методы осмотра:**\n${missedExamination}` : ''}

**Лабораторные и инструментальные исследования:**
${formatActions(userActions.tests, 'исследования')}
${missedTests ? `\n**Пропущенные важные исследования:**\n${missedTests}` : ''}

---

### **Заключение студента:**

**Диагноз:**
\`\`\`
${userActions.diagnosis || 'Диагноз не поставлен.'}
\`\`\`

**План лечения:**
\`\`\`
${userActions.treatment || 'Лечение не назначено.'}
\`\`\`

---

### **Эталонный диагноз и лечение:**

**Диагноз:**
\`\`\`
${scenario.correctDiagnosis.diagnosis}
\`\`\`
**Объяснение:** ${scenario.correctDiagnosis.explanation}

**План лечения:**
\`\`\`
${scenario.correctDiagnosis.treatment}
\`\`\`

---

### **Задание для тебя:**

Проанализируй действия студента и предоставь детальный разбор. Структурируй свой ответ следующим образом:
1.  **Общая оценка:** Кратко оцени общую стратегию студента.
2.  **Анализ действий:** Поэтапно разбери сбор анамнеза, осмотр и обследования. Отметь правильные решения и укажи на ошибки (как на лишние действия, так и на пропущенные). Объясни клиническое значение каждого упущения.
3.  **Оценка диагноза и лечения:** Сравни диагноз и план лечения студента с эталонным. Укажи на неточности или грубые ошибки.
4.  **Итоговые рекомендации:** Дай 2-3 ключевых совета по улучшению клинического мышления на основе этого кейса.
5.  **Резюме:** Заверши отзыв обобщающей оценкой (например, "Отличная работа, все ключевые моменты учтены.", "Хорошая работа, но есть важные упущения.", "Требуется серьезная доработка диагностического подхода.").

Твой ответ должен быть доброжелательным, обучающим и профессиональным.
`;
};


export const getGeminiEvaluation = async (scenario: Scenario, userActions: UserActions): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Ошибка: API ключ не настроен. Пожалуйста, установите переменную окружения API_KEY.");
  }
  
  const prompt = generatePrompt(scenario, userActions);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `Произошла ошибка при обращении к API Gemini: ${error.message}`;
    }
    return "Произошла неизвестная ошибка при обращении к API Gemini.";
  }
};
