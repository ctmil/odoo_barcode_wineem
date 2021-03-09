import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, OnChanges {
  @Input() server = '';
  @Input() db = '';
  @Input() user = '';
  @Input() pass = '';
  @Input() uid = 0;
  ////////////////////////////////////////////
  @Input() inLoad = true;
  @Input() logged = false;
  @Output() log = new EventEmitter();
  ////////////////////////////
  public showPicking = false;
  public showStock = false;
  public showFix = false;
  ////////////////////////////
  safe = 'normal';
  timer = 0;
  connect: any;

  constructor() { }

  // Lifehooks funs

  public ngOnInit(): void {
  }

  public ngOnChanges(): void {
    if (this.logged) {}
  }

  public scanNetwork(): void {
    const start_time = new Date().getTime();
    $.xmlrpc({
      url: this.server + '/common',
      methodName: 'version',
      crossDomain: true,
      params: [],
      success: (response: any, status: any, jqXHR: any) => {
        const request_time = new Date().getTime() - start_time;
        this.timer = request_time;
        if (request_time <= 150) {
          this.safe = 'good';
        } else if (request_time > 150 && request_time <= 450) {
          this.safe = 'normal';
        } else if (request_time > 450 && request_time <= 800) {
          this.safe = 'slow';
        } else if (request_time > 800 && request_time <= 1500) {
          this.safe = 'bad';
        } else {
          this.safe = 'critical';
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  // END - Lifehooks funs

  // Internal use funs

  public picking(): void {
    this.showPicking = true;
    clearInterval(this.connect);
  }

  public stock(): void {
    this.showStock = true;
    clearInterval(this.connect);
  }

  public fix(): void {
    this.showFix = true;
    clearInterval(this.connect);
  }

  // END - Internal use funs

  public goOut(): void {
    this.showPicking = false;
    this.showStock = false;
    this.showFix = false;
    this.scanNetwork();
    this.connect = setInterval(() => {
      this.scanNetwork();
    }, 3000);
  }

  /* LogOut emiter */
  public logOut(): void {
    this.log.emit();
  }

}
