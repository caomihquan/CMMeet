import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Peer from 'peerjs';
import { Subscription } from 'rxjs';
import { eMeet } from 'src/app/shares/models/eMeeting';
import { Member } from 'src/app/shares/models/member';
import { Message } from 'src/app/shares/models/message';
import { VideoElement } from 'src/app/shares/models/video-element';
import { ChatHubService } from 'src/app/shares/services/chathub.service';
import { MessageCountStreamService } from 'src/app/shares/services/message-count-stream.service';
import { MuteCamMicService } from 'src/app/shares/services/mute-cam-mic.service';
import { TokenModel, UserService } from 'src/app/shares/services/user.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit,OnDestroy {
  chatForm = new UntypedFormGroup({
    content: new UntypedFormControl('', Validators.required)
  })
  isMeeting: boolean;
  isRecorded: boolean;
  isShowChat: boolean = true;
  enableShareScreen:boolean = true;
  roomId: string;
  myPeer: any;
  currentUser: TokenModel;
  currentMember: Member;

  stream: any;
  enableVideo = true;
  enableAudio = true;

  shareScreenPeer: any;
  shareScreenStream:any;
  maxUserDisplay = 8;
  tempvideos: VideoElement[] = [];

  videos: VideoElement[] = [];
  @ViewChild('videoPlayer') localvideoPlayer: ElementRef;
  messageInGroup: Message[] = [];
  messageCount = 0;
  subscriptions = new Subscription();
  statusScreen: eMeet;

  userIsSharing: string;

  constructor(
    private _user: UserService,
    private route: ActivatedRoute,
    private router:Router,
    private chatHub: ChatHubService,
    private messageCountService: MessageCountStreamService,
    private shareScreenService: MuteCamMicService,
    public dialog: MatDialog
    ){
    this._user.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.currentMember = { userName: user.userName, displayName: user.fullName } as Member
      }
    })
  }
  ngOnInit(): void {
    this.isMeeting = true
    this.isRecorded = true //this.configService.isRecorded;//enable or disable recorded
    let  enableShareScreen = false;
    const shareScreen = localStorage.getItem('share-screen');
    if(!!shareScreen){
      enableShareScreen = JSON.parse(shareScreen);
    }
    if (enableShareScreen) {// != null
      this.enableShareScreen = enableShareScreen
    }
    this.roomId = this.route.snapshot.paramMap.get('id') ?? '';
    this.chatHub.createHubConnection(this.currentUser, this.roomId)
    this.createLocalStream();
    this.myPeer = new Peer(this.currentUser?.userName, {
      config: {
        'iceServers': [{
          urls: "stun:stun.l.google.com:19302",
        },{
          urls:"turn:numb.viagenie.ca",
          username:"webrtc@live.com",
          credential:"muazkh"
        }]
      }
    });

    this.myPeer.on('open', (userId:any) => {
      console.log(userId)
    });

    this.shareScreenPeer = new Peer('share_' + this.currentUser?.userName, {
      config: {
        'iceServers': [{
          urls: 'stun:stun.l.google.com:19302'
        },{
          urls:'stun:stun.l.google.com:19302',
          username:'webrtc@live.com',
          credential:'muazkh'
        }]
      }
    })

    //for share screen
    this.shareScreenPeer.on('call', (call:any) => {
      call.answer(this.shareScreenStream);
      call.on('stream', (otherUserVideoStream: MediaStream) => {
        this.shareScreenStream = otherUserVideoStream;
      });
      call.on('error', (err:any) => {
        console.error(err);
      })
    });

    //for share video user
    this.myPeer.on('call', (call:any) => {
      call.answer(this.stream);
      call.on('stream', (otherUserVideoStream: MediaStream) => {
        this.addOtherUserVideo(call.metadata.userId, otherUserVideoStream);
      });
      call.on('error', (err:any) => {
        console.error(err);
      })
    });


    //share video other user
    this.subscriptions.add(
      this.chatHub.oneOnlineUser$.subscribe((member:Member) => {
        if (this.currentUser?.userName !== member?.userName) {
          // Let some time for new peers to be able to answer
          setTimeout(() => {
            const call = this.myPeer.call(member?.userName, this.stream, {
              metadata: { userId: this.currentMember },
            });
            call.on('stream', (otherUserVideoStream: MediaStream) => {
              this.addOtherUserVideo(member, otherUserVideoStream);
            });
            call.on('close', () => {
              this.videos = this.videos.filter((video) => video.user.userName !== member?.userName);
              //xoa user nao offline tren man hinh hien thi cua current user
              this.tempvideos = this.tempvideos.filter(video => video.user.userName !== member?.userName);
            });
          }, 1000);
        }
      })
    );


    this.subscriptions.add(this.chatHub.oneOfflineUser$.subscribe(member => {
      this.videos = this.videos.filter(video => video.user.userName !== member.userName);
      //xoa user nao offline tren man hinh hien thi current user
      this.tempvideos = this.tempvideos.filter(video => video.user.userName !== member.userName);
    }));

    this.subscriptions.add(
      this.chatHub.messagesThread$.subscribe(messages => {
        this.messageInGroup = messages;
      })
    );

    this.subscriptions.add(
      this.messageCountService.messageCount$.subscribe(value => {
        this.messageCount = value;
      })
    );

    this.subscriptions.add(
      this.shareScreenService.shareScreen$.subscribe(val => {
        if (val) {//true = share screen
          this.statusScreen = eMeet.SHARESCREEN
          this.enableShareScreen = false;
          localStorage.setItem('share-screen', JSON.stringify(this.enableShareScreen));
        } else {// false = stop share
          this.statusScreen = eMeet.NONE
          this.enableShareScreen = true;
          localStorage.setItem('share-screen', JSON.stringify(this.enableShareScreen));
        }
      })
    )


    // this.subscriptions.add(this.shareScreenService.lastShareScreen$.subscribe(val => {
    //   if (val.isShare) {//true = share screen
    //     this.chatHub.shareScreenToUser(Number.parseInt(this.roomId), val.username, true)
    //     setTimeout(() => {
    //       const call = this.shareScreenPeer.call('share_' + val.username, this.shareScreenStream);
    //     }, 1000)
    //   }
    // }))
    this.subscriptions.add(this.shareScreenService.userIsSharing$.subscribe(val => {
      this.userIsSharing = val
    }))

  }

  addOtherUserVideo(userId: Member, stream: MediaStream) {
    const alreadyExisting = this.videos.some(video => video.user.userName === userId.userName);
    if (alreadyExisting) {
      this.videos = this.videos.filter((video) => video.user.userName !== userId?.userName);
      this.tempvideos = this.tempvideos.filter(video => video.user.userName !== userId?.userName);
    }
    this.videos.push({
      muted: false,
      srcObject: stream,
      user: userId
    });

    if(this.videos.length <= this.maxUserDisplay){
      this.tempvideos.push({
        muted: false,
        srcObject: stream,
        user: userId
      })
    }
  }

  async createLocalStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: this.enableVideo, audio: this.enableAudio });
      this.localvideoPlayer.nativeElement.srcObject = this.stream;
      this.localvideoPlayer.nativeElement.load();
      this.localvideoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
      this.localvideoPlayer.nativeElement.play()
      })
    } catch (error) {
      console.error(error);
      alert(`Can't join room, error ${error}`);
    }
  }

  async enableOrDisableVideo() {
    this.enableVideo = !this.enableVideo
    if (this.stream.getVideoTracks()[0]) {
      this.stream.getVideoTracks()[0].enabled = this.enableVideo;
      this.chatHub.muteCamera(this.enableVideo);
      if(!this.enableVideo){
        this.stream.getVideoTracks()[0].stop();
      }
      else{
        this.createLocalStream();
        let mediaStream = await navigator.mediaDevices.getUserMedia({ video: this.enableVideo, audio: this.enableAudio });
        this.videos.forEach(v => {
          const call = this.shareScreenPeer.call(v.user.userName,mediaStream,{
            metadata: { userId: this.currentMember }
          });
        })
      }
    }
  }

  enableOrDisableAudio() {
    this.enableAudio = !this.enableAudio;
    if (this.stream.getAudioTracks()[0]) {
      this.stream.getAudioTracks()[0].enabled = this.enableAudio;
      this.chatHub.muteMicroPhone(this.enableAudio)
    }
  }

  onLoadedMetadata(event: Event) {
    (event.target as HTMLVideoElement).play();
  }

  sendMessage() {
    this.chatHub.sendMessage(this.chatForm.value.content).then(() => {
      this.chatForm.reset();
    })
  }

  async shareScreen() {
    try {
      let mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      this.chatHub.shareScreen(Number.parseInt(this.roomId), true);
      this.shareScreenStream = mediaStream;
      this.enableShareScreen = false;

      this.videos.forEach(v => {
        const call = this.shareScreenPeer.call('share_' + v.user.userName, mediaStream);
        //call.on('stream', (otherUserVideoStream: MediaStream) => { });
      })

      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.chatHub.shareScreen(Number.parseInt(this.roomId), false);
        this.enableShareScreen = true;
        localStorage.setItem('share-screen', JSON.stringify(this.enableShareScreen));
      });
    } catch (e) {
      console.log(e);
      alert(e)
    }
  }

  // StartRecord() {
  //   this.isStopRecord = !this.isStopRecord;
  //   if (this.isStopRecord) {
  //     this.textStopRecord = 'Stop record';
  //     this.recordFileService.startRecording(this.stream);
  //   } else {
  //     this.textStopRecord = 'Start record';
  //     this.recordFileService.stopRecording();
  //     setTimeout(() => {
  //       this.recordFileService.upLoadOnServer().subscribe(() => {
  //         this.toastr.success('Upload file on server success');
  //       })
  //     }, 1000)
  //   }
  // }
  closeCall(){
    this.router.navigate(['home']);
  }

  ngOnDestroy() {
    this.isMeeting = false;
    this.myPeer.disconnect();//dong ket noi nhung van giu nguyen cac ket noi khac
    this.shareScreenPeer.destroy();//dong tat ca cac ket noi
    this.chatHub.stopHubConnection();
    this.subscriptions.unsubscribe();
    localStorage.removeItem('share-screen');
  }


}
