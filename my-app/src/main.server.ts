import { bootstrapApplication } from '@angular/platform-browser';
import {AppComponent} from "@newRoot";
import {config} from "rxjs";



const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
