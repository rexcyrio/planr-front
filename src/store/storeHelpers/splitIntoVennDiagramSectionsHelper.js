/**
 * @param {Array} A The first array
 * @param {Array} B The second array
 * @returns An array of three elements representing the sets `A \ B`, `A ∩ B` and `B \ A` respectively
 */
export function splitIntoVennDiagramSections(A, B) {
  const objectA = Object.fromEntries(A.map((each) => [each, true]));
  const objectB = Object.fromEntries(B.map((each) => [each, true]));

  const onlyA = [];
  const intersection = [];
  const onlyB = [];

  for (const element of A) {
    if (element in objectB) {
      intersection.push(element);
    } else {
      onlyA.push(element);
    }
  }

  for (const element of B) {
    if (!(element in objectA)) {
      onlyB.push(element);
    }
  }

  return [onlyA, intersection, onlyB];
}
