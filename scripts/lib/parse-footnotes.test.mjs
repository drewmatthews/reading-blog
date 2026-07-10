import { describe, it, expect } from 'vitest';
import { parseFootnotes } from './parse-footnotes.mjs';

describe('parseFootnotes', () => {
  it('leaves plain text untouched', () => {
    const { mdx, footnotes } = parseFootnotes('Just a normal sentence.');
    expect(mdx).toBe('Just a normal sentence.');
    expect(footnotes).toEqual([]);
  });

  it('parses a gif footnote into a Footnote tag', () => {
    const { mdx, footnotes } = parseFootnotes('Rhys does ==the brooding thing==[gif: https://giphy.com/x.gif] again.');
    expect(mdx).toBe('Rhys does <Footnote kind="gif" src="https://giphy.com/x.gif">the brooding thing</Footnote> again.');
    expect(footnotes).toEqual([
      { kind: 'gif', phrase: 'the brooding thing', src: 'https://giphy.com/x.gif' },
    ]);
  });

  it('parses a meme footnote', () => {
    const { footnotes } = parseFootnotes('==feral==[meme: https://i.img/z.png]');
    expect(footnotes[0]).toEqual({ kind: 'meme', phrase: 'feral', src: 'https://i.img/z.png' });
  });

  it('parses a quote with a source', () => {
    const { mdx, footnotes } = parseFootnotes('==a theatre kid==[quote: "I\'m not bad" — Jessica Rabbit]');
    expect(mdx).toBe('<Footnote kind="quote" quote="I\'m not bad" source="Jessica Rabbit">a theatre kid</Footnote>');
    expect(footnotes[0]).toEqual({ kind: 'quote', phrase: 'a theatre kid', quote: "I'm not bad", source: 'Jessica Rabbit' });
  });

  it('parses a quote with no source', () => {
    const { footnotes } = parseFootnotes('==x==[quote: "just this"]');
    expect(footnotes[0]).toEqual({ kind: 'quote', phrase: 'x', quote: 'just this', source: null });
  });

  it('handles multiple footnotes and preserves emoji', () => {
    const { footnotes } = parseFootnotes('==a==[gif: u1] then 🫠 ==b==[meme: u2]');
    expect(footnotes.map((f) => f.kind)).toEqual(['gif', 'meme']);
  });

  it('parses a link footnote', () => {
    const { mdx, footnotes } = parseFootnotes('he is a ==HOE==[link: https://youtu.be/abc123]');
    expect(footnotes[0]).toEqual({ kind: 'link', phrase: 'HOE', href: 'https://youtu.be/abc123' });
    expect(mdx).toBe('he is a <Footnote kind="link" href="https://youtu.be/abc123">HOE</Footnote>');
  });

  it('treats url as an alias for link', () => {
    const { footnotes } = parseFootnotes('==clone wars==[url: https://youtube.com/watch?v=xyz]');
    expect(footnotes[0]).toEqual({ kind: 'link', phrase: 'clone wars', href: 'https://youtube.com/watch?v=xyz' });
  });

  it('unwraps google redirect links to the real target', () => {
    const { footnotes } = parseFootnotes(
      '==k==[url: https://www.google.com/url?sa=t&url=https%3A%2F%2Fyoutu.be%2Fabc123&ved=x]'
    );
    expect(footnotes[0].href).toBe('https://youtu.be/abc123');
  });

  it('treats img/image as a downloadable meme image', () => {
    const { footnotes } = parseFootnotes('==old==[img: https://x.test/a.jpg]');
    expect(footnotes[0]).toEqual({ kind: 'meme', phrase: 'old', src: 'https://x.test/a.jpg' });
  });

  it('tolerates loose spacing around the marker', () => {
    const { mdx, footnotes } = parseFootnotes('she ==cant dance worth a shit ==[ gif: https://x.gif ] lol');
    expect(footnotes[0]).toEqual({ kind: 'gif', phrase: 'cant dance worth a shit', src: 'https://x.gif' });
    expect(mdx).toBe('she <Footnote kind="gif" src="https://x.gif">cant dance worth a shit</Footnote> lol');
  });
});
