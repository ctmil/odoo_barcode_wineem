import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Picking } from '../../picking';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-picking',
  templateUrl: './picking.component.html',
  styleUrls: ['./picking.component.scss']
})
export class PickingComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-input-rename
  @Input('server') server = '';
  // tslint:disable-next-line: no-input-rename
  @Input('db') db = '';
  // tslint:disable-next-line: no-input-rename
  @Input('user') user = '';
  // tslint:disable-next-line: no-input-rename
  @Input('pass') pass = '';
  // tslint:disable-next-line: no-input-rename
  @Input('uid') uid = 0;
  ////////////////////////////////////////////
  // tslint:disable-next-line: no-input-rename
  @Input('inLoad') inLoad = true;
  // tslint:disable-next-line: no-input-rename
  @Input('logged') logged = false;
  @Output() log = new EventEmitter();
  ////////////////////////////
  public barcode = '';
  public barcode_format = '';
  public p_scanned = '';
  public pr_scanned = '';
  public showScann = false;
  public showErr = false;
  ////////////////////////////
  public pickings: Picking[] = [];
  public pickRep = [];
  public repSel: any;
  public showLeader = false;
  public pickLeader = [];
  public showOPs = false;
  public leaderSel: any;
  ////////////////////////////
  public scanConfig = {
    preferFrontCamera : false,    // iOS and Android
    showFlipCameraButton : false, // iOS and Android
    showTorchButton : true,       // iOS and Android
    torchOn: false,               // Android, launch with the torch switched on (if available)
    prompt : 'Place a barcode inside the scan area', // Android
    resultDisplayDuration: 0,     // Time of show
    orientation : 'portrait',     // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true,     // iOS
    disableSuccessBeep: false     // iOS and Android
  };

  constructor() { }

  // Lifehooks funs

  public ngOnInit(): void {
    this.getPicking(this.server, this.db, this.user, this.pass, this.uid);
  }

  public ngOnChanges(): void {

  }

  // END - Lifehooks funs

  // Internal use funs

  /* Scann Barcode Function */
  public startScann(): void {
    this.barcode = '';
    this.barcode_format = '';
    this.p_scanned = '';
    this.pr_scanned = '';
    this.showScann = false;
    this.showErr = false;

    cordova.plugins.barcodeScanner.scan(
      (result: any) => {
        this.barcode = result.text;
        this.barcode_format = result.format;
        console.log('We got a barcode\n' +
                    'Result: ' + result.text + '\n' +
                    'Format: ' + result.format + '\n' +
                    'Cancelled: ' + result.cancelled);
      },
      function (error: any) {
        console.log('Scanning failed: ' + error);
      },
      this.scanConfig
   );
  }

  public getPicking(server_url: string, db: string, user: string, pass: string, uid: number): void {
    $.xmlrpc({
      url: server_url + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [db, uid, pass, 'stock.picking.order', 'search_read', [ [['state', '=', 'planned']] ],
      {'fields': ['name', 'id', 'move_ids', 'rep', 'leader'], 'limit': 10}],
      success: (response: any, status: any, jqXHR: any) => {
        for (let i = 0; i < response[0].length; i++) {
          /*for (let m = 0; m < response[0][i].move_ids.length; m++) {
            console.log(response[0][i].move_ids[m]);
          }*/
          this.pickings[i] = {
            name: response[0][i].name,
            id: response[0][i].id,
            rep: response[0][i].rep[1],
            leader: response[0][i].leader[1],
            move_ids: response[0][i].move_ids
          };
        }
        const reps = this.groupBy(this.pickings, 'rep');
        const values = Object.values(reps);
        const keys = Object.keys(reps);
        for (let i = 0; i < keys.length; i++) {
          this.pickRep.push({name: keys[i], vals: values[i], id: i});
        }
        console.log(this.pickRep);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public readRep(n: number): void {
    this.showLeader = true;
    this.repSel = this.pickRep[n];
    const leaders = this.groupBy(this.repSel.vals, 'leader');
    const values = Object.values(leaders);
    const keys = Object.keys(leaders);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'undefined') {
        this.pickLeader.push({name: 'Sin Lider', vals: values[i], id: i});
      } else {
        this.pickLeader.push({name: keys[i], vals: values[i], id: i});
      }
    }
    console.log(this.pickLeader);
  }

  public readLeader(n: number): void {
    this.showOPs = true;
    this.leaderSel = this.pickLeader[n];
    console.log(this.leaderSel);
  }

  // END - Internal use funs

  public groupBy(xs, key): any {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

}
