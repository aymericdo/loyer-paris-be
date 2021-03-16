export const stringToNumber = (value: string): number => {
  const digit = {
    un: 1,
    deux: 2,
    trois: 3,
    quatre: 4,
    cinq: 5,
    six: 6,
    sept: 7,
    huit: 8,
    neuf: 9,
  };

  if (value) {
    if (isNaN(+value)) {
      if (Object.keys(digit).includes(value)) {
        return digit[value];
      } else {
        return null;
      }
    } else {
      return +value;
    }
  } else {
    return null;
  }
};
