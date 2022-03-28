import { LoginHandler } from '../../app/Handlers/LoginHandler';
import {
    HTTP_CODES,
    HTTP_METHODS,
    SessionToken,
} from '../../app/Models/ServerModels';
import { Utils } from '../../app/Utils/Utils';

describe('LoginHandler test suite', () => {
    let loginHandler: LoginHandler;

    // Mocks
    const requestMock = {
        method: '', // specify props we will probably use in mocks
    };
    const responseMock = {
        writeHead: jest.fn(), // mock method
        write: jest.fn(),
        statusCode: 0,
    };
    const authorizerMock = {
        generateToken: jest.fn(), // mock method
    };
    const getRequestBodyMock = jest.fn();

    // Setup
    beforeEach(() => {
        // instanciate LoginHandler and inject empty parameter mocks
        loginHandler = new LoginHandler(
            requestMock as any,
            responseMock as any,
            authorizerMock as any
        );
        Utils.getRequestBody = getRequestBodyMock; // now we have control over method
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    const someSessionToken: SessionToken = {
        tokenId: 'someTokenId',
        userName: 'someUserName',
        valid: true,
        expirationTime: new Date(),
        accessRights: [1, 2, 3],
    };

    // Tests
    test('handleRequest with options method', async () => {
        // given
        requestMock.method = HTTP_METHODS.OPTIONS;
        // when
        await loginHandler.handleRequest();
        // calls for response.writehead method, so it should be mocked in response param prop
        // then
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
    });

    test('handleRequest with unhandled http method', async () => {
        // given
        requestMock.method = 'someRandomMethod';
        // when
        loginHandler.handleRequest();
        // then
        expect(responseMock.writeHead).not.toBeCalledWith(HTTP_CODES.OK);
        // won't work because method WAS called in the test before
        // calling responseMock.writeHead.mockClear(); before this test is a solution, but not optimal
        // use afterEach is best practice
    });

    test('handleRequest with post method and valid login', async () => {
        // given
        requestMock.method = HTTP_METHODS.POST;
        // handlePost receives a value (requestBody) from another class (Utils) - so we must mock this call
        getRequestBodyMock.mockReturnValueOnce({
            username: 'someUser',
            password: 'password',
        }); // return an Account object
        authorizerMock.generateToken.mockReturnValueOnce(someSessionToken);
        // when
        await loginHandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, {
            'Content-Type': 'application/json',
        });
        expect(responseMock.write).toBeCalledWith(
            JSON.stringify(someSessionToken)
        );
    });

    test('handleRequest with post method and invalid login', async () => {
        // given
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockReturnValueOnce({
            username: 'someUser',
            password: 'password',
        });
        authorizerMock.generateToken.mockReturnValueOnce(null);
        // when
        await loginHandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
        expect(responseMock.write).toBeCalledWith('wrong username or password');
    });

    test('handleRequest with post method and unexpected error', async () => {
        // given
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockRejectedValueOnce(
            new Error('Something went wrong!')
        );
        // we don't even need to mock authorize since error is thrown before
        // when
        await loginHandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
        expect(responseMock.write).toBeCalledWith(
            'Internal error: ' + 'Something went wrong!'
        );
    });
});
