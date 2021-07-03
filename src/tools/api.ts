import axios, { AxiosRequestConfig, AxiosResponse, CancelToken, Method, ResponseType } from 'axios';
import Vue from 'vue';
import store from '@/store';
import router from '@/router';
import LS from '@/types/localstorage';

axios.defaults.baseURL = process.env.VUE_APP_BACKEND;
axios.defaults.headers = {
  common: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

export interface APIResponse {
  code?: number;
  data?: {
    [key: string]: unknown;
  };
  result: 'success' | 'error';
}

export interface IResponseError {
  code?: string;
  message?: string;
  title: string;
}

export interface IResponseErrorValidation {
  [key: string]: string;
}

export interface APIResponseError extends APIResponse {
  result: 'error';
  data: {
    error?: IResponseError;
    validation?: IResponseErrorValidation;
  };
}

export interface APIResponseSuccess extends APIResponse {
  result: 'success';
}

export interface IAPIRequest {
  headers?: { [key: string]: any };
  method: Method;
  url: string;
  data?: {
    [key: string]: any;
  };
  params?: {
    [key: string]: any;
  };
  cancelToken?: CancelToken;
  responseType?: ResponseType;
}

export interface IHandleErrorResult {
  message: string;
  validation: Nullable<IResponseErrorValidation>;
}

export async function request<T>(
  { data, headers, method, params, url, cancelToken, responseType }: IAPIRequest,
  mock?: T, // Return mocked response without actually making a real request
  offline?: T, // Return mocked response if server is down or request returned an error
): Promise<T & APIResponseSuccess> {
  const requestParams: AxiosRequestConfig = {
    data,
    headers,
    method,
    params,
    url,
    cancelToken,
    responseType,
  };

  if (mock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve({ ...mock, ...{ result: 'success' } });
      }, 1000);
    });
  } else {
    try {
      const response = await axios.request(requestParams);
      return response.data;
    } catch (e) {
      if (process.env.VUE_APP_AUTHORIZED === 'true' && offline) {
        return Promise.resolve({ ...offline, ...{ result: 'success' } });
      } else {
        throw e;
      }
    }
  }
}

function handleError({ data: { error, validation } }: APIResponseError): IHandleErrorResult {
  let message: Nullable<string> = '';

  if (error) {
    message = error.title || error.message;
  }

  if (!message) {
    message = 'Unknown error';
  }

  if (validation && !Array.isArray(validation)) {
    message = Object.values(validation).join('<br/>');
  }

  return { message, validation };
}

axios.interceptors.request.use(function (config) {
  const token = LS.get('auth_token');
  if (token != '' && token != null) {
    config.headers.common = {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    };
  }

  return config;
});

axios.interceptors.response.use(
  function (response: AxiosResponse<APIResponseSuccess | APIResponseError>) {
    if (response.data.result === 'success') {
      return Promise.resolve(response);
    }

    return Promise.reject(handleError(response.data));
  },
  async (error) => {
    const response: Nullable<APIResponseError> = error.response;

    if (!response) {
      return Promise.reject(error);
    }

    /* if (401 === error.response.status) {
      Vue.notify({
        group: 'app',
        title: i18n.t('auth.messages.session-expired') as string,
        text: i18n.t('auth.messages.please-login-again') as string,
        duration: 3000,
      });
      await store.dispatch('app/logoutUser');
      router.push('/login');
    } */

    return Promise.reject(handleError(response.data as APIResponseError));
  },
);

// Use inside controllers
export const getResponseErrorsArray = (response: APIResponseError) => {
  if (response.data.validation) {
    const validations: string[] = [];

    for (const [key, value] of Object.entries(response.data.validation)) {
      validations.push(value);
    }

    return validations;
  }

  if (response.data.error) {
    return [response.data.error.message || response.data.error.title];
  }

  return [];
};