import { randomUUID } from 'crypto';
import { http, HttpResponse } from 'msw';

export const getPayementsServiceHandlers = (baseURL: string) => [
  http.post(`${baseURL}/v1/payments`, () => {
    return HttpResponse.json({
      id: randomUUID(),
    });
  }),
  http.get(`${baseURL}/v1/payments/:id`, (req) => {
    return HttpResponse.json({
      id: req.params.id,
      amount: 999.99,
      type: 'PixQrCode',
      status: 'Created',
      conciliationId: '2024112416101632b129',
      content:
        '00020126480014BR.GOV.BCB.PIX0126payments@fiapfood.com.br5204000053039865406999.995802BR5911Fiap Food6009Sao Paulo622405202024112416101632B12963044944',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
];
