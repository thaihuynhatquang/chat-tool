export const nullIfEmptyObj = (obj) => {
  return Object.keys(obj).length === 0 ? null : obj
}
