const PUNCHES = [
  'Jab',
  'Cross',
  'Lead Hook',
  'Rear Hook',
  'Lead Uppercut',
  'Rear Uppercut',
  'Body Jab',
  'Body Cross',
];

export function* comboGenerator(length = 4) { //запам'ятовування + yield
  while (true) {   //нескінченний
    const combo = [];
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * PUNCHES.length);
      combo.push(PUNCHES[index]);
    }
    yield combo; //ПАУЗА для запам'ятовування комбо, повертає комбо і зупиняє генератор до наступного виклику
  }
}

export function* roundTimer(seconds = 5) {
  for (let remaining = seconds; remaining >= 0; remaining--) { //скінчений
    yield remaining;
  }
}


