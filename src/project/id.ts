import { rword } from 'rword';

function generate() {
  const word1 = rword.generate(1, {
    length: '4-12'
  });
  const word2 = rword.generate(1, {
    length: `4-${30 - 4 - 8 - word1.length}`
  });
  const num6digit = Math.floor(99999 + Math.random() * 900001);
  return `${word1}-${word2}-${num6digit}`;
}

let id = generate();
const get = () => id;
const set = (newId: string) => (id = newId);

export default {
  generate,
  get,
  set
};
