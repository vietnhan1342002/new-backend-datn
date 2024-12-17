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

    private users: number = 0;

    // Triển khai phương thức handleConnection để xử lý kết nối mới
    async handleConnection(socket: Socket) {
        const authHeader = socket.handshake.headers.authorization
        if (authHeader && (authHeader as string).split(' '), [1]) {
            try {
                socket.data.userId = await this.userAuthService.handleVerifyToken(
                    (authHeader as string).split(' ')[1],
                )
                console.log("Connect success:", socket.data.userId);
                socket.join(socket.data.userId)
            } catch (error) {
                socket.disconnect()
            }
        }
        console.log(`A new client connected: ${socket.id}`);
    }

    async handDisconnect(@ConnectedSocket() socket: Socket) {
        console.log("Disconnect: ", socket.id, socket.data.userId);

    }

    // Lắng nghe sự kiện "sendNotification"
    @SubscribeMessage('sendNotification')
    handleNotification(
        @MessageBody() { doctorId, status, appointmentId }: { doctorId: string, status: string, appointmentId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        console.log(`Sending notification to doctor ${doctorId} for appointment ${appointmentId} with status: ${status}. Client: ${socket}`);

        this.server.to("userId").emit('appointmentConfirmed', { appointmentId, status })
    }

    // Khi bác sĩ kết nối, lưu socket của họ
    @SubscribeMessage('sendNotification')
    handleConnected(@MessageBody() doctorId: string, @ConnectedSocket() client: Socket): void {
        this.doctorsSockets[doctorId] = client;
        console.log(`Doctor with ID ${doctorId} connected.`);
    }

    // Khi bác sĩ ngắt kết nối, xóa kết nối khỏi đối tượng
    @SubscribeMessage('disconnect')
    handleDisconnect(@ConnectedSocket() client: Socket): void {
        const doctorId = Object.keys(this.doctorsSockets).find(id => this.doctorsSockets[id] === client);
        if (doctorId) {
            delete this.doctorsSockets[doctorId];
            console.log(`Doctor with ID ${doctorId} disconnected.`);
        }
    }

    afterInit(server: Server) {
        console.log('WebSocket Initialized');
    }

    // Gửi thông báo đến bác sĩ theo ID
    sendNotificationToDoctor(doctorId: string, status: string): void {
        const doctorSocket = this.doctorsSockets[doctorId];
        if (doctorSocket) {
            doctorSocket.emit('appointmentConfirmed', status);
        }
    }

    @SubscribeMessage('updateStatus')
    handleAppointmentUpdate(@MessageBody() { appointmentId, doctorId, status }: { appointmentId: string, doctorId: string, status: string }): void {
        if (status === 'confirmed') {
            // Gửi thông báo đến bác sĩ sau khi trạng thái cuộc hẹn được cập nhật
            this.sendNotificationToDoctor(doctorId, `Appointment ${appointmentId} is confirmed.`);
        }
    }
}
