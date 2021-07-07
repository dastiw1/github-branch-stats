import { request } from '@/tools/api';

const resource = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth';

type TokenType = 'bearer';
type AccessTokenResponse = {
  access_token: string;
  token_type: TokenType;
};
export default {
  async getToken(payload: {
    client_id: string;
    client_secret: string;
    code: string;
    redirect_uri?: string;
  }) {
    return await request<AccessTokenResponse>({
      url: `${resource}/access_token`,
      method: 'post',
      data: payload,
    });
  },
};
