import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react';

export const highlightCode = (code: string, language: string) => {
    return (
        <SyntaxHighlighter language={language} style={solarizedlight}>
            {code}
        </SyntaxHighlighter>
    );
};

export default highlightCode;
