import { request } from '@/tools/api';

const resource = 'https://api.github.com';

export default {
  async user() {
    return await request({ url: `${resource}/user`, method: 'get' });
  },
};
