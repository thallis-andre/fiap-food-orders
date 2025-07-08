export class Requester {
  constructor(
    private readonly _name: string,
    private readonly _cpf?: string,
    private readonly _email?: string,
  ) {
    if (!_cpf && !_email) {
      throw new Error('Requester must have at least one of email or cpf');
    }
  }

  get name() {
    return this._name;
  }
  get cpf() {
    return this._cpf;
  }
  get email() {
    return this._email;
  }
}
