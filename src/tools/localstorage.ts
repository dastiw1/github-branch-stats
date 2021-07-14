const LS = {
  get(key: string): any {
    const value = localStorage.getItem(key);

    let parsedValue;

    try {
      parsedValue = JSON.parse(value || 'null');
    } catch (e) {
      parsedValue = value || null;
    }

    if (parsedValue === 'true') {
      parsedValue = true;
    } else if (parsedValue === 'false') {
      parsedValue = false;
    }

    return parsedValue;
  },
  set(key: string, value: any): void {
    let val = value;
    if (typeof value === 'function') {
      val = value.toString();
    } else if (typeof value !== 'string') {
      val = JSON.stringify(value);
    }

    localStorage.setItem(key, val);
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  reset(): void {
    localStorage.clear();
  },
};

export const resetLS = (): void => {
  LS.reset();
};

export default LS;
