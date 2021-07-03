

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
    if (typeof value === 'function') {
      value = value.toString();
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    localStorage.setItem(key, value);
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  reset(): void {
    localStorage.clear();
  },
};

export const resetLS = () => {
    LS.reset();
};

export default LS;