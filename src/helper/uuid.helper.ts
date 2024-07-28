import { NIL as NIL_UUID, v4 as uuidv4, validate as uuidValidate } from 'uuid';

export function UUIDV4(): string {
  return uuidv4();
}

export function UUIDCheck(uuid: string): boolean {
  return uuidValidate(uuid);
}

export function UUIDEmpty(): string {
  return NIL_UUID;
}
