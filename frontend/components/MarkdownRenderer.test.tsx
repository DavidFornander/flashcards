import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
    it('renders bold text correctly', () => {
        // using "children" prop or just passing text if that's how it's used
        render(<MarkdownRenderer>**Bold Text**</MarkdownRenderer>);
        const boldElement = screen.getByText('Bold Text');
        expect(boldElement).toBeInTheDocument();
        expect(boldElement.tagName).toBe('STRONG');
    });

    it('renders headers correctly', () => {
        render(<MarkdownRenderer># Heading 1</MarkdownRenderer>);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Heading 1');
    });
});
