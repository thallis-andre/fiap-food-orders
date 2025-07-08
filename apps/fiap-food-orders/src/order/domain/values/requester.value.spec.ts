import { Requester } from './requester.value';

describe('Requester', () => {
  const name = 'John Doe';
  const cpf = '01234567890';
  const email = 'john@doe.com';

  it('should not allow instantiating with neader CPF nor Email', () => {
    expect(() => new Requester(name)).toThrow();
  });

  it('should instantiate with both CPF and Email', () => {
    const target = new Requester(name, cpf, email);
    expect(target.cpf).toBe(cpf);
    expect(target.email).toBe(email);
  });

  it('should instantiate with only CPF', () => {
    const target = new Requester(name, cpf);
    expect(target.cpf).toBe(cpf);
    expect(target.email).toBeFalsy();
  });
  it('should instantiate with only Email', () => {
    const target = new Requester(name, null, email);
    expect(target.cpf).toBeFalsy();
    expect(target.email).toBe(email);
  });
});
