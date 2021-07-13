export function getNestedValue(obj: any, path: (string | number)[], fallback: any = undefined) {
  const last = path.length - 1;

  if (last < 0) return obj === undefined ? fallback : obj;

  for (let i = 0; i < last; i++) {
    if (obj == null) {
      return fallback;
    }
    obj = obj[path[i]];
  }

  if (obj == null) return fallback;

  return obj[path[last]] === undefined ? fallback : obj[path[last]];
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date && a.getTime() !== b.getTime()) {
    // If the values are Date, compare them as timestamps
    return false;
  }

  if (a !== Object(a) || b !== Object(b)) {
    // If the values aren't objects, they were already checked for equality
    return false;
  }

  const props = Object.keys(a);

  if (props.length !== Object.keys(b).length) {
    // Different number of props, don't bother to check
    return false;
  }

  return props.every((p) => deepEqual(a[p], b[p]));
}

export function getObjectValueByPath(obj: any, path: string, fallback = undefined) {
  // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
  if (obj == null || !path || typeof path !== 'string') return fallback;
  if (obj[path] !== undefined) return obj[path];
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  return getNestedValue(obj, path.split('.'), fallback);
}

export function getPropertyFromItem(
  item: Record<string | number, any>,
  property:
    | string
    | (string | number)[]
    | ((item: Record<string | number, any>, fallback: any) => any),
  fallback: any,
): any {
  if (property == null) return item === undefined ? fallback : item;

  if (item !== Object(item)) return fallback === undefined ? item : fallback;

  if (typeof property === 'string') return getObjectValueByPath(item, property, fallback);

  if (Array.isArray(property)) return getNestedValue(item, property, fallback);

  if (typeof property !== 'function') return fallback;

  const value = property(item, fallback);

  return typeof value === 'undefined' ? fallback : value;
}

/**
 * Remove host from github repo url
 */
export function removeHost(val: string, host = process.env.VUE_APP_BACKEND) {
  return val.replace(host + '/', '');
}

export function dateStringToUTCTimestamp(dateString: string): number {
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset();
  const utcDate = date.getTime() / 1000 - tzOffset * 60;
  return utcDate;
}


/**
 * Показывает сколько времени прошло (в днях)
 * @param dateString 
 * @returns 
 */
export function daysPassed(dateString: string | Date) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInTime = now.getTime() - date.getTime();
  return Math.round(diffInTime / (1000 * 3600 * 24));
}