import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ToolsService } from '../../service/tools.service';
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
  public loading = true;
  ////////////////////////////
  public pickings: Picking[] = [];
  public pickRep = [];
  public repSel: any;
  public showLeader = false;
  public pickLeader = [];
  public showOPs = false;
  public leaderSel: any;
  public showPicking = false;
  public box: any;
  public selP: any;
  public pTable = [];
  public showClose = false;
  public pBoxes = [];
  ////////////////////////////
  public alert = '';
  public alertPicking = '';
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

  constructor(public t: ToolsService) { }

  // Lifehooks funs

  public ngOnInit(): void {
    this.getPicking(this.server, this.db, this.user, this.pass, this.uid);
  }

  public ngOnChanges(): void {

  }

  // END - Lifehooks funs

  // Internal use funs

  /* Scann Barcode Function */
  public startScann(i: number): void {
    if (this.pTable[i].scan === false) {
      if (this.pTable[i].ean13 !== false) {
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
            if (this.pTable[i].ean13 === result.text) {
              this.pTable[i].scan_qty = this.pTable[i].scan_qty + 1;
              if (this.pTable[i].scan_qty === this.pTable[i].qty) {
                this.pTable[i].scan = true;
              }
            }
          },
          function (error: any) {
            console.log('Scanning failed: ' + error);
          },
          this.scanConfig
        );
      } else {
        alert('Este producto no tiene código de Barra cargado');
      }
    } else {
      alert('Producto ya escaneado');
    }
  }

  public getPicking(server_url: string, db: string, user: string, pass: string, uid: number): void {
    $.xmlrpc({
      url: server_url + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [db, uid, pass, 'stock.picking.order', 'search_read', [ [['state', '=', 'draft']] ],
      {'fields': ['name', 'id', 'partner_id', 'move_ids', 'rep', 'leader'], 'limit': 5}],
      success: (response: any, status: any, jqXHR: any) => {
        if (response) {
          for (let i = 0; i < response[0].length; i++) {
            this.pickings[i] = {
              name: response[0][i].name,
              customer: response[0][i].partner_id,
              id: response[0][i].id,
              rep: response[0][i].rep,
              leader: response[0][i].leader,
              move_ids: response[0][i].move_ids
            };
          }
          const reps = this.t.groupBy(this.pickings, 'rep');
          const values = (<any>Object).values(reps);
          const keys = Object.keys(reps);
          for (let i = 0; i < keys.length; i++) {
            this.pickRep.push({name: keys[i].split(',')[1], vals: values[i], id: i});
          }
            this.loading = false;
        } else {
            this.loading = false;
          this.alert = 'No hay pedidos planeados';
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public readRep(n: number): void {
    this.showLeader = true;
    this.repSel = this.pickRep[n];
    const leaders = this.t.groupBy(this.repSel.vals, 'leader');
    const values = (<any>Object).values(leaders);
    const keys = Object.keys(leaders);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'false') {
        this.pickLeader.push({name: 'Sin Lider', vals: values[i], id: i});
      } else {
        this.pickLeader.push({name: keys[i].split(',')[1], vals: values[i], id: i});
      }
    }
  }

  public readLeader(n: number): void {
    this.showOPs = true;
    this.leaderSel = this.pickLeader[n];
  }

  public readOP(n: number): void {
    this.loading = true;

    const p = this.pickings.filter(obj => {
      return obj.id === n;
    });

    this.selP = p;

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'res.partner', 'search_read', [ [['id', '=', p[0].customer[0]]] ],
      {'fields': ['name', 'id', 'parent_id', 'leader_id']}],
      success: (response: any, status: any, jqXHR: any) => {
        this.loading = false;
        this.showPicking = true;
        console.log(response);
        if (response[0][0].leader_id !== false) {
          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
            [ [['state', '=', 'opened'], ['rep_id', '=', response[0][0].leader_id[0]]] ],
            {'fields': ['name', 'id', 'rep_id']}],
            success: (rLeader: any, statusLead: any, jqXHRLead: any) => {
              console.log('Leader: ', rLeader);
              // this.box = rLeader;
              if (rLeader[0].length === 0) {
                this.createBox(p);
              } else {
                this.getBox(rLeader[0][0].id, p);
              }
            },
            error: (jqXHRLead: any, statusLead: any, errorLead: any) => {
              console.log('Error : ' + errorLead );
            }
          });
        } else if (response[0][0].parent_id !== false) {
          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
            [ [['state', '=', 'opened'], ['rep_id', '=', response[0][0].parent_id[0]]] ],
            {'fields': ['name', 'id', 'rep_id']}],
            success: (rRep: any, statusRep: any, jqXHRRep: any) => {
              console.log('Rep: ', rRep);
              // this.box = rRep[0];
              if (rRep[0].length === 0) {
                this.createBox(p);
              } else {
                this.getBox(rRep[0][0].id, p);
              }
            },
            error: (jqXHRLead: any, statusLead: any, errorLead: any) => {
              console.log('Error : ' + errorLead );
            }
          });
        } else {
          this.alertPicking = 'No se puede procesar el pedido. Informar al cliente.';
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public createBox(picking: any): void {
    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'create', [{
        name: 'BOX-APP-' + Math.floor((Math.random() * 50000)),
        state: 'opened',
        rep_id: picking[0].rep[0],
      }]],
      success: (res: any, status: any, jqXHR: any) => {
        console.log(res);
        this.getBox(res[0], picking);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error);
      }
    });
  }

  public getBox(id: number, picking: any): void {
    console.log('Picking: ', picking[0]);

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.picking.order', 'write',
      [ [picking[0].id], {'box_id': id}]],
      success: (res: any, status: any, jqXHR: any) => {
        console.log(res);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
      [ [['id', '=', id]] ],
      {'fields': ['name', 'id', 'rep_id', 'create_uid']}],
      success: (res: any, status: any, jqXHR: any) => {
        console.log(res);
        if (res[0][0].create_uid[0] !== this.uid) {
          this.alertPicking = 'Ya hay una caja abierta por otro Usuario.';
        } else {
          this.box = res[0];
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });

    for (const move of picking[0].move_ids) {
      let categ = '';
      let default_code = '';
      let qty = 0;
      let ean13 = 0;
      let id = 0;

      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.move', 'search_read',
        [ [['id', '=', move]] ],
        {'fields': ['product_id', 'product_uom_qty']}],
        success: (res: any, status: any, jqXHR: any) => {
          qty = res[0][0].product_uom_qty;

          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'product.product', 'search_read',
            [ [['id', '=', res[0][0].product_id[0]]] ],
            {'fields': ['id', 'default_code', 'channel_id', 'ean13']}],
            success: (resP: any, statusP: any, jqXHRP: any) => {
              default_code = resP[0][0].default_code;
              ean13 = resP[0][0].ean13;
              id = resP[0][0].id;

              if (resP[0][0].channel_id) {
                $.xmlrpc({
                  url: this.server + '/object',
                  methodName: 'execute_kw',
                  crossDomain: true,
                  params: [this.db, this.uid, this.pass, 'product.channel', 'search_read',
                  [ [['id', '=', resP[0][0].channel_id[0]]] ],
                  {'fields': ['short_name']}],
                  success: (resC: any, statusC: any, jqXHRC: any) => {
                    categ = resC[0][0].short_name;
                    this.pTable.push({id: id, categ_id: categ, sku: default_code, qty: qty, ean13: ean13, scan: false, scan_qty: 0});
                  },
                  error: (jqXHRC: any, statusC: any, errorC: any) => {
                    console.log('Error : ' + errorC );
                  }
                });
              } else {
                categ = 'NO-CAT';
                this.pTable.push({id: id, categ_id: categ, sku: default_code, qty: qty, ean13: ean13, scan: false, scan_qty: 0});
              }
            },
            error: (jqXHRP: any, statusP: any, errorP: any) => {
              console.log('Error : ' + errorP );
            }
          });
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
        }
      });
    }
    console.log('Tabla:', this.pTable);
  }

  public addQty(i: number){
    if (this.pTable[i].scan_qty < this.pTable[i].qty) {
      this.pTable[i].scan = true;
      this.pTable[i].scan_qty++;
    }
  }

  public validatePicking() {
    let isScan = false;
    let list = [];
    let ilist = [];
    let plist = [];

    for (const p of this.pTable) {
      if (p.scan === true) {
        isScan = true;
        if (p.qty === p.scan_qty) {
          list.push(p.id);
        }
      } else {
        plist.push(p.id);
      }
    }

    if (isScan === false) {
      alert('No hay productos escaneados');
    } else {
      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [this.box[0].id], {
          pickings_ids: [[6, 0, list]]
        }]],
        success: (response: any, status: any, jqXHR: any) => {
          console.log('Stock Box:', response);
          alert('Productos Cargados en Caja ' + this.box[0].name);
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
        }
      });

      if (plist.length > 0) {
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.picking', 'create', [{
            picking_type_id: 2,
            backorder_id: this.pTable[0].id,
            move_lines: [[6, 0, plist]]
          }]],
          success: (response: any, status: any, jqXHR: any) => {
            console.log('Picking:', response);
          },
          error: (jqXHR: any, status: any, error: any) => {
            console.log('Error : ' + error );
          }
        });
      }
    }
  }

  public closeBoxes() {
    this.showClose = true;

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
      [ [['create_uid', '=', this.uid], ['state', '=', 'opened']] ],
      {'fields': ['name', 'id', 'rep_id']}],
      success: (res: any, status: any, jqXHR: any) => {
        console.log('BOXES:', res[0]);
        for (let i = 0; i < res[0].length; i++) {
          this.pBoxes.push({id: res[0][i].id, name: res[0][i].name, rep: res[0][i].rep_id[1], state: 'Abierta'});
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public closeBox(id: number, i: number) {
    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [id], {
        state: 'closed'
      }]],
      success: (response: any, status: any, jqXHR: any) => {
        console.log('Stock Box:', response);
        this.pBoxes[i].state = 'Cerrada';
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
        alert('La Caja no se puede Cerrar');
      }
    });
  }

  public getReportTag(id: number) {
    $.xmlrpc({
      url: this.server + '/report',
      methodName: 'render_report',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'uniqs_box_label_2.print', [ id ]],
      success: (response: any, status: any, jqXHR: any) => {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:application/pdf;base64,' + encodeURIComponent(response[0].result));
        element.setAttribute('download', 'nombre.pdf');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  // END - Internal use funs

}
