export function exclude(object: any, keys: any) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key))
  );
}
