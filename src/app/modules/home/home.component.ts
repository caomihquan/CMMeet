import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Pagination } from 'src/app/shares/models/pagination';
import { Room } from 'src/app/shares/models/room';
import { RoomService } from 'src/app/shares/services/room.service';
import { RoomDialogComponent } from './widgets/room-dialog/room-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  roomGroupBy: any[] = [];
  pageNumber = 0;
  pageSize = 20;
  maxSize = 5;
  data: any;
  pagination: Pagination;
  listRoom: Room[] = [];
  dataGroupByUser: Map<any, any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private _router:Router,
    private roomService:RoomService,
    public dialog: MatDialog
    ){}
  ngOnInit(): void {
    this.loadRooms();
  }

  joinRoom(roomId: number){
    this._router.navigate(['/room', roomId])
  }

  loadRooms() {
    this.roomGroupBy = [];
    this.roomService.getRooms(this.pageNumber, this.pageSize).subscribe(res => {
      this.listRoom = [...res.result];
      this.pagination = res.pagination;
      //group by de hien thi len select html
      const grouped = this.groupBy(this.listRoom, (room: Room) => room.userName);
      this.dataGroupByUser = grouped;
      //load data into select html
      grouped.forEach((value: Room[], key: string) => {
        let obj = {userName: key, displayName: value[0].displayName}
        this.roomGroupBy.push(obj)
      });
    })
  }

   private groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  handlePage(e: any) {
    this.pageNumber = e.pageIndex;
    this.loadRooms();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(RoomDialogComponent, {
      data: {
        MaximumMember:0,
        RoomName:'',
        LanguageCode:'',
        LevelCode:'',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed',result);
      this.roomService.addRoom(result).subscribe((res: Room)=>{
      })
    });
  }
}
