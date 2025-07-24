import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
// main.ts or any module-level file
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


bootstrapApplication(App, appConfig);
