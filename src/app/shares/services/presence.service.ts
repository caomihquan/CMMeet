import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { UtilityStreamService } from './utility-stream.service';
import { TokenModel } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.baseUrl + 'hubs/';
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private utility: UtilityStreamService) { }

  createHubConnection(user:TokenModel) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.accessToken
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection
      .start()
      .catch(error => console.log(error));



    this.hubConnection.on('CountMemberInGroup', ({roomId, countMember}) => {
      this.utility.RoomCount = {roomId, countMember}
    })

    this.hubConnection.on('OnLockedUser', (val: boolean) => {
      this.utility.KickedOutUser = val;
    })
  }

  stopHubConnection() {
    this.hubConnection.stop().catch(error => console.log(error));
  }
}
