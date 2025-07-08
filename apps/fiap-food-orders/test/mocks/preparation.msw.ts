import { randomUUID } from 'crypto';
import { http, HttpResponse } from 'msw';

export const getPrerationServiceHandlers = (baseURL: string) => [
  http.post(`${baseURL}/v1/preparations`, () => {
    return HttpResponse.json({
      id: randomUUID(),
    });
  }),
];
