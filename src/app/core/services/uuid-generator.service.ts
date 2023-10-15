import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';

@Injectable({
  providedIn: 'root',
})
export class UuidGenerator {
  constructor() {}

  generate(): string {
    return faker.string.uuid();
  }
}
