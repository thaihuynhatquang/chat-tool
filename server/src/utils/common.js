// @flow

/**
 * Return null if input object is empty.
 * Otherwise, return the object itself.
 *
 * @param {Object} obj
 * @return {Object | null}
 */
export const nullIfEmptyObj = (obj: Object) => {
  return Object.keys(obj).length === 0 ? null : obj
}
