import { numberToWords } from './number-to-words';

describe('numberToWords (Indian numbering)', () => {
  it('handles zero', () => {
    expect(numberToWords(0)).toBe('Zero Rupees');
  });

  it('converts small amounts', () => {
    expect(numberToWords(1)).toBe('One Rupees Only');
    expect(numberToWords(19)).toBe('Nineteen Rupees Only');
    expect(numberToWords(45)).toBe('Forty Five Rupees Only');
  });

  it('converts hundreds', () => {
    expect(numberToWords(100)).toBe('One Hundred Rupees Only');
    expect(numberToWords(999)).toBe('Nine Hundred Ninety Nine Rupees Only');
  });

  it('converts thousands and lakhs', () => {
    expect(numberToWords(1000)).toBe('One Thousand Rupees Only');
    expect(numberToWords(12345)).toBe('Twelve Thousand Three Hundred Forty Five Rupees Only');
    expect(numberToWords(100000)).toBe('One Lakh Rupees Only');
    expect(numberToWords(2550000)).toBe('Twenty Five Lakh Fifty Thousand Rupees Only');
  });

  it('converts crores', () => {
    expect(numberToWords(10000000)).toBe('One Crore Rupees Only');
    expect(numberToWords(12345678)).toBe(
      'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Rupees Only',
    );
  });

  it('includes paise', () => {
    expect(numberToWords(100.5)).toBe('One Hundred Rupees and Fifty Paise Only');
    expect(numberToWords(0.25)).toBe('Zero Rupees and Twenty Five Paise Only');
  });
});
