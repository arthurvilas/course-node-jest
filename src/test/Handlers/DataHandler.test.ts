import { DataHandler } from '../../app/Handlers/DataHandler';
import {
    AccessRight,
    HTTP_CODES,
    HTTP_METHODS,
} from '../../app/Models/ServerModels';
import { User, WorkingPosition } from '../../app/Models/UserModels';
import { Utils } from '../../app/Utils/Utils';

describe('DataHandler test suite', () => {
    let datahandler: DataHandler;

    // Mocks
    const requestMock = {
        method: '',
        url: '',
        headers: {
            authorization: '',
        },
    };
    const responseMock = {
        statusCode: 0,
        writeHead: jest.fn(),
        write: jest.fn(),
    };
    const tokenValidatorMock = {
        validateToken: jest.fn(),
    };
    const usersDBAccessMock = {
        getUsersByName: jest.fn(),
    };
    const parseUrlMock = jest.fn();

    const someUser: User = {
        id: 'validId',
        name: 'validName',
        age: 50,
        email: 'valid@email.com',
        workingPosition: WorkingPosition.PROGRAMMER,
    };

    // Setup
    beforeEach(() => {
        datahandler = new DataHandler(
            requestMock as any,
            responseMock as any,
            tokenValidatorMock as any,
            usersDBAccessMock as any
        );
        Utils.parseUrl = parseUrlMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Tests
    test('handleRequest with options method', async () => {
        // given
        requestMock.method = HTTP_METHODS.OPTIONS;
        // when
        await datahandler.handleRequest();
        // then
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
    });

    test('handleRequest with get method with valid token, read authorization and name parameter', async () => {
        // given
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'validToken';
        // when
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [AccessRight.READ],
        });
        parseUrlMock.mockReturnValueOnce({ query: { name: 'validName' } });
        usersDBAccessMock.getUsersByName.mockReturnValueOnce([someUser]);
        await datahandler.handleRequest();
        // then
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK, {
            'Content-Type': 'application/json',
        });
        expect(responseMock.write).toBeCalledWith(JSON.stringify([someUser]));
    });

    test('handleRequest with get method with valid token, read authorization and without name parameter', async () => {
        // given
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'validToken';
        // when
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [AccessRight.READ],
        });
        parseUrlMock.mockReturnValueOnce({ query: { name: '' } });
        await datahandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
        expect(responseMock.write).toBeCalledWith(
            'Missing name parameter in the request!'
        );
    });

    test('handleRequest with get method with valid token and unauthorized', async () => {
        // given
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'validToken';
        // when
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [],
        });
        await datahandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
        expect(responseMock.write).toBeCalledWith('Unauthorized operation!');
    });

    test('handleRequest with get method without token', async () => {
        // given
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = '';
        // when
        await datahandler.handleRequest();
        // then
        expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
        expect(responseMock.write).toBeCalledWith('Unauthorized operation!');
    });
});
