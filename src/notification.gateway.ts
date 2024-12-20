import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserAuthService } from './modules/user-auth/user-auth.service';
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly userAuthService: UserAuthService) { }

    private doctorsSockets: { [doctorId: string]: Socket } = {};

    afterInit(server: Server) {
        console.log('WebSocket Initialized');
    }

    async handleConnection(socket: Socket) {
        const authHeader = socket.handshake.auth;
        if (authHeader) {
            const token = authHeader.token
            try {
                socket.data.userId = await this.userAuthService.handleVerifyToken(token);
                console.log("Connect success:", socket.data.userId);
                socket.join(socket.data.userId);
            } catch (error) {
                console.error('Token verification failed', error);
                socket.disconnect();
            }
        }
        console.log(`A new client connected: ${socket.id}`);
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        console.log("Disconnect: ", socket.id, socket.data.userId);
        if (socket.data.userId) {
            delete this.doctorsSockets[socket.data.userId];
        }
    }

}
