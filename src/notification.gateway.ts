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
import { DoctorsService } from './modules/doctors/doctors.service';
import { ApiModule } from './modules/api.module';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly userAuthService: UserAuthService,
    ) {

    }

    private doctorsSockets = [];

    afterInit(server: Server) {
        console.log('WebSocket Initialized');
    }

    async handleConnection(socket: Socket) {
        const authHeader = socket.handshake.auth;
        if (authHeader) {
            const token = authHeader.token;
            try {
                const userId = await this.userAuthService.handleVerifyToken(token);
                const user = await this.userAuthService.findById(userId);
                if (user && user.roleId._id.toString() === '673d935335e97c832bfa6356') {
                    socket.data.userId = userId;
                    this.doctorsSockets.push({ userId, socket })
                    console.log('Doctor connected:', userId);
                }
            } catch (error) {
                console.error('Token verification failed', error);
                socket.disconnect();
            }
            console.log(`A new client connected: ${socket.id}`);
        }
    }

    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() socket: Socket) {
        console.log('Disconnect:', socket.id, socket.data.userId);
        if (socket.data.userId) {
            delete socket.data.userId;
        }
    }

    sendNotificationToDoctor(userId: string, doctorId: string, message: string,) {
        console.log("doctorId", doctorId);
        console.log("doctorsSockets", this.doctorsSockets[0]);
        const doctorSocket = userId;
        console.log("doctorSocket", doctorSocket);

        if (doctorSocket) {
            this.server.emit('doctor-notification', message);
            console.log(`Notification sent to doctor ${doctorId}: ${message}`);
        }
    }
}
