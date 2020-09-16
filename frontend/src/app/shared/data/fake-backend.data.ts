import { User } from '../../models/user.model';

/**
 * Fake user login
 */
const u1 = new User();
u1.username = 'vunb';
u1.password = 'vunb';

const u2 = new User();
u2.username = 'test';
u2.password = 'test';

export const UserFakeData: User[] = [u1, u2];
