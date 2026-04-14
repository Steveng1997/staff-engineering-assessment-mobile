import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Firebase Compatibility Modules
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {
  AngularFireRemoteConfigModule,
  SETTINGS as REMOTE_CONFIG_SETTINGS,
} from '@angular/fire/compat/remote-config';
import { environment } from '../environments/environment';

/**
 * AppModule - Main application gateway.
 * Improved with Offline Persistence to meet local storage requirements.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    // Initialize Firebase with your environment config
    AngularFireModule.initializeApp(environment.firebaseConfig),

    /**
     * STAFF LEVEL OPTIMIZATION:
     * .enablePersistence() allows the app to work offline by caching data in IndexedDB.
     * This fulfills the "local storage" requirement while keeping cloud sync.
     */
    AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }),

    AngularFireRemoteConfigModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },  

    /**
     * Remote Config Settings:
     * During testing, you might want to lower 'minimumFetchIntervalMillis' to 0
     * to see Feature Flag changes instantly.
     */
    {
      provide: REMOTE_CONFIG_SETTINGS,
      useValue: {
        minimumFetchIntervalMillis: 0, // Set to 0 for instant testing of 'show_delete_button'
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
