import { useState } from 'react';

export const validateRegex = (regex: string): boolean => {
    try {
        new RegExp(regex);
        return true;
    } catch {
        return false;
    }
};

export const testRegex = (regex: string, testString: string): RegExpMatchArray | null => {
    const regExp = new RegExp(regex);
    return testString.match(regExp);
};

export const generateRegexFromNaturalLanguage = (input: string): string => {
    // Placeholder for AI integration to generate regex from natural language
    // This function should call an AI service to get the regex pattern
    return ''; // Return the generated regex pattern
};