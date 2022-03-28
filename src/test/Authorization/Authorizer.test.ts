import { Authorizer } from '../../app/Authorization/Authorizer';
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
import { Account, SessionToken } from '../../app/Models/ServerModels';
// import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
// import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
jest.mock('../../app/Authorization/SessionTokenDBAccess');
jest.mock('../../app/Authorization/UserCredentialsDbAccess'); // now our new Authorizer() constructor will instance mock implementations

describe('Authorizer test suite', () => {
    let authorizer: Authorizer;

    // Mocks
    const sessionTokenDBAccessMock = {
        storeSessionToken: jest.fn(),
    };
    const userCredentialsDBAccessMock = {
        getUserCredential: jest.fn(),
    };

    const someAccount: Account = {
        username: 'someUser',
        password: 'password',
    };

    // Setup
    beforeEach(() => {
        authorizer = new Authorizer(
            sessionTokenDBAccessMock as any,
            userCredentialsDBAccessMock as any
        );
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Tests
    test('constructor arguments are called', () => {
        new Authorizer(); // MUST MOCK DEPENDENCIES MODULES - If not, this will instanciate SessionTokenDBAccess and UserCredentialsDBAccess with real implementations
        expect(SessionTokenDBAccess).toBeCalled();
        expect(UserCredentialsDbAccess).toBeCalled();
    });

    test('should return sessionToken for valid credentials', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
        jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);
        userCredentialsDBAccessMock.getUserCredential.mockResolvedValueOnce({
            username: 'someUser',
            accessRights: [1, 2, 3],
        });
        const expectedSessionToken: SessionToken = {
            userName: 'someUser',
            accessRights: [1, 2, 3],
            valid: true,
            tokenId: '',
            expirationTime: new Date(60 * 60 * 1000),
        };
        const sessionToken = await authorizer.generateToken(someAccount);
        expect(expectedSessionToken).toEqual(sessionToken);
        expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(
            sessionToken
        );
    });
});
