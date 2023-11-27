import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http'
import { AppRoutingModule } from './core/components/app-routing.module';
import { AppComponent } from './core/components/app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { SampleComponent } from './modules/sample/sample.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import {MatToolbarModule} from '@angular/material/toolbar';
import { HomeComponent } from './modules/home/home.component';
import {MatGridListModule} from '@angular/material/grid-list';
import { FooterComponent } from './core/components/footer/footer.component';
import { HeaderComponent } from './core/components/header/header.component';
import { LoginComponent } from './core/components/authentication/login/login.component';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { RoomComponent } from './modules/room/room.component';
import {MatTabsModule} from '@angular/material/tabs';
import { TimeagoModule,TimeagoFormatter } from 'ngx-timeago';
import { MatPaginatorModule} from '@angular/material/paginator';
import { VideoBoxComponent } from './modules/room/widgets/video-box/video-box.component';
import {MatDialogModule} from '@angular/material/dialog';
import { RoomDialogComponent } from './modules/home/widgets/room-dialog/room-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [
    AppComponent,
    SampleComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    RoomComponent,
    VideoBoxComponent,
    RoomDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    TimeagoModule.forRoot(),
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule,
    MatSidenavModule,
    MatMenuModule
  ],
  providers: [
      {
      provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi:true
    },
  { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
