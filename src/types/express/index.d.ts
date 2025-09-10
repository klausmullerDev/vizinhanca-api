import { UserPublic } from '../../services/user.service';

declare global {
    namespace Express {
        export interface Request {
            user?: UserPublic;
        }
    }
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
    };
  }
}
