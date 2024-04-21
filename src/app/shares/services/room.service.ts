import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Room } from '../models/room';
import { getPaginatedResult, getPaginationHeaders } from './../helpers/paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  baseUrl = environment.baseUrl + 'api/room';

  constructor(private http: HttpClient) { }

  getRooms(pageNumber:number, pageSize:number){
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResult<Room[]>(this.baseUrl, params, this.http);
  }

  addRoom(data:any){
    return this.http.post(this.baseUrl +
       '?name=' + data.RoomName
      +'&LevelCode=' + data.LevelCode
      +'&LanguageCode='+ data.LanguageCode
      +'&numMemeber='+ data.MaximumMember, {});
  }

  editRoom(id: number, name: string){
    return this.http.put(this.baseUrl + '?id='+ id +'&editName='+name, {})
  }

  deleteRoom(id: number){
    return this.http.delete(this.baseUrl+'/'+id);
  }

  deleteAll(){
    return this.http.delete(this.baseUrl+'/delete-all');
  }

  getLanguage(){
    return this.http.get(`${this.baseUrl}/get-language`)
  }
  getLevel(){
    return this.http.get(`${this.baseUrl}/get-level`)
  }
}
