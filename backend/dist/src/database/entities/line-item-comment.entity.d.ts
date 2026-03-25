import { AuditScopeLineItem } from './audit-scope-line-item.entity';
import { User } from './user.entity';
export declare class LineItemComment {
    id: string;
    lineItemId: string;
    lineItem: AuditScopeLineItem;
    authorId: string;
    author: User;
    content: string;
    createdAt: Date;
}
