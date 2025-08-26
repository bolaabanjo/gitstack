export function isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
}

export function isUsernameValid(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return usernameRegex.test(username);
}

export function isInputNotEmpty(input: string): boolean {
    return input.trim().length > 0;
}

export function validateRepoQAInput(repo: string, question: string): string | null {
    if (!repo || typeof repo !== 'string' || repo.trim().length === 0) {
        return 'Repository identifier is required';
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return 'Question is required';
    }

    if (question.length > 2000) {
        return 'Question is too long';
    }

    return null;
}