import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Data, Server, WebSocket } from "ws";

import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from "@nestjs/websockets";

@WebSocketGateway(80)
export class GatewayHandler {
	@WebSocketServer()
	server: Server;

	@SubscribeMessage("edit")
	onEdit(client: WebSocket, data: Data): Observable<WsResponse<number>> {
		return from([1, 2, 3]).pipe(
			map((item) => ({ event: "events", data: item }))
		);
	}
}
