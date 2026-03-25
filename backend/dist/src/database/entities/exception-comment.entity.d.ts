import { ExceptionRequest } from './exception-request.entity';
import { User } from './user.entity';
export declare class ExceptionComment {
    id: string;
    exceptionRequestId: string;
    exceptionRequest: ExceptionRequest;
    authorId: string;
    author: User;
    content: string;
    createdAt: Date;
}
