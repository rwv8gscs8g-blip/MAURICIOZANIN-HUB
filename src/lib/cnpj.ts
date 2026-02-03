export function normalizeCnpj(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCnpj(raw: string) {
  const cnpj = normalizeCnpj(raw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calc = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i += 1) {
      sum += parseInt(base[i], 10) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base = cnpj.slice(0, 12);
  const digit1 = calc(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calc(base + digit1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj === base + digit1.toString() + digit2.toString();
}
