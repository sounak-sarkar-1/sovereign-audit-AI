import { AuditorExceptionsService } from './exceptions.service';
import { User } from '../../database/entities/user.entity';
export declare class AuditorExceptionsController {
    private readonly service;
    constructor(service: AuditorExceptionsService);
    findAllGlobal(user: User): Promise<import("../../database/entities/exception-request.entity").ExceptionRequest[]>;
    getComments(id: string): Promise<import("../../database/entities/exception-comment.entity").ExceptionComment[]>;
    addComment(id: string, content: string, user: User): Promise<import("../../database/entities/exception-comment.entity").ExceptionComment>;
}
