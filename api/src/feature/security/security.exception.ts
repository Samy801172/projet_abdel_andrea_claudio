import { ApiException } from '@common/config/api/model/api.exception';
import { ApiCodeResponse } from '@common/config';

export class NoTokenFoundedException extends ApiException {
  constructor(message: string = 'No token found') {
    super(ApiCodeResponse.NO_TOKEN_FOUNDED, 401);
  }
}

export class UserNotFoundException extends ApiException {
  constructor(message: string = 'User not found') {
    super(ApiCodeResponse.USER_NOT_FOUND, 200);
  }
}

export class TokenExpiredException extends ApiException {
  constructor(message: string = 'Token expired') {
    super(ApiCodeResponse.TOKEN_EXPIRED, 401);
  }
}

export class SignupException extends ApiException {
  constructor(message: string = 'Signup error') {
    super(ApiCodeResponse.SIGNUP_ERROR, 200);
  }
}

export class CredentialDeleteException extends ApiException {
  constructor(message: string = 'Credential delete error') {
    super(ApiCodeResponse.CREDENTIAL_DELETE_ERROR, 200);
  }
}

export class UserAlreadyExistException extends ApiException {
  constructor(message: string = 'User already exists') {
    super(ApiCodeResponse.USER_ALREADY_EXIST, 200);
  }
}

export class TokenGenerationException extends ApiException {
  constructor(message: string = 'Token generation error') {
    super(ApiCodeResponse.TOKEN_GEN_ERROR, 500);
  }
}
