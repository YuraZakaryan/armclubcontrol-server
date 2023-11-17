import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsLatitude(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isLatitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true; // Allow empty values
          }

          const latitude = parseFloat(value);
          return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
        },
        defaultMessage(args: ValidationArguments) {
          return propertyName + ' must be a valid latitude';
        },
      },
    });
  };
}
export function IsLongitude(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isLongitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true; // Allow empty values
          }

          const longitude = parseFloat(value);
          return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
        },
        defaultMessage(args: ValidationArguments) {
          return propertyName + ' must be a valid longitude';
        },
      },
    });
  };
}
@ValidatorConstraint({ name: 'latitudeLongitudePair', async: false })
export class LatitudeLongitudePairValidator
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const latitude = args.object['latitudeMap'];
    const longitude = args.object['longitudeMap'];

    return !((latitude && !longitude) || (!latitude && longitude));
  }

  defaultMessage(args: ValidationArguments) {
    return 'If latitudeMap is provided, longitudeMap must be provided as well, and vice versa.';
  }
}
