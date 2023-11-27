import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DialogData } from '../../models/room-data.model';
import { RoomService } from 'src/app/shares/services/room.service';
import { ToastrService } from 'ngx-toastr';

interface RoomLanguage {
  languageCode: string;
  languageName: string;
}
interface RoomLevel {
  levelCode: string;
  levelName: string;
}
interface RoomMember {
  SL: number;
  Name: string;
}
@Component({
  selector: 'app-room-dialog',
  templateUrl: './room-dialog.component.html',
  styleUrls: ['./room-dialog.component.scss'],
})
export class RoomDialogComponent implements OnInit, OnDestroy {
  MemberData: RoomMember[] = [
    {
      SL:0,
      Name:'Any Level'
    },
    {
      SL:1,
      Name:'1'
    },
    {
      SL:2,
      Name:'2'
    },
    {
      SL:3,
      Name:'3'
    },

  ];

  ListLanguage:Array<RoomLanguage> = []
  ListLevel:Array<RoomLevel> = []

  selectedValue: string;
  constructor(
    public dialogRef: MatDialogRef<RoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _roomService:RoomService,
    private toastr: ToastrService,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ClickOk(){

  }

  ngOnInit(): void {
    this.getLang();
    this.getLevel();
  }


  ngOnDestroy(): void {
  }

  getLang(){
    this._roomService.getLanguage().subscribe((res:Array<RoomLanguage>)=>{
      this.ListLanguage = res;
    })
  }


  getLevel(){
    this._roomService.getLevel().subscribe((res:Array<RoomLevel>)=>{
      this.ListLevel = res;
    })
  }

  ClickOK(){
    if(!this.data.LanguageCode){
      this.toastr.error('Language is EMPTY');
      return
    }
    if(!this.data.LevelCode){
      this.toastr.error('Level is EMPTY');
      return;
    }
    this.dialogRef.close(this.data);
  }

}
